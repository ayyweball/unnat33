import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAdvisorChatResponse } from '@/lib/claude';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const { message, conversationId, businessId, district, state, language, businessType } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    const trimmedMessage = message.trim();

    let activeUser = user;
    if (!activeUser) {
      // Find or create default guest user for Prisma FK integrity
      try {
        activeUser = await prisma.user.upsert({
          where: { phone: '0000000000' },
          update: {},
          create: {
            phone: '0000000000',
            name: 'Guest Entrepreneur',
            language: 'en',
            state: 'Uttar Pradesh',
            district: 'Lucknow',
          },
        });
      } catch (err) {
        console.warn('Could not upsert guest user:', err);
      }
    }

    const userId = activeUser?.id;
    let session: any = null;

    if (userId) {
      try {
        if (conversationId) {
          session = await prisma.chatSession.findUnique({
            where: { id: conversationId },
            include: { messages: { orderBy: { createdAt: 'asc' } } }
          });
        }

        if (!session) {
          session = await prisma.chatSession.create({
            data: {
              userId,
              businessId: businessId || undefined
            },
            include: { messages: true }
          });
        }

        // Save user message
        await prisma.chatMessage.create({
          data: {
            sessionId: session.id,
            role: 'user',
            content: trimmedMessage
          }
        });
      } catch (err) {
        console.warn('Chat DB persistence error (proceeding with memory history):', err);
      }
    }

    const history = session?.messages
      ? [
          ...session.messages.map((m: any) => ({ role: m.role, content: m.content })),
          { role: 'user', content: trimmedMessage }
        ]
      : [{ role: 'user', content: trimmedMessage }];

    // Resolve accurate user & business location context:
    // Prioritize explicit body params (from active user session / store),
    // then authenticated user profile (excluding the generic guest fallback record),
    // never defaulting to an unselected city.
    const isGuestRecord = !user || activeUser?.phone === '0000000000';
    const effectiveDistrict = (district && typeof district === 'string' && district.trim())
      ? district.trim()
      : (!isGuestRecord && activeUser?.district ? activeUser.district : undefined);

    const effectiveState = (state && typeof state === 'string' && state.trim())
      ? state.trim()
      : (!isGuestRecord && activeUser?.state ? activeUser.state : undefined);

    const effectiveLanguage = (language && typeof language === 'string' && language.trim())
      ? language.trim()
      : (activeUser?.language || 'en');

    const effectiveName = (!isGuestRecord && activeUser?.name) ? activeUser.name : 'Entrepreneur';

    // Call AI advisor chat service
    const replyText = await getAdvisorChatResponse(history, {
      name: effectiveName,
      language: effectiveLanguage,
      district: effectiveDistrict,
      state: effectiveState,
      businessType: (businessType && typeof businessType === 'string' && businessType.trim()) ? businessType.trim() : undefined
    });

    if (session) {
      try {
        await prisma.chatMessage.create({
          data: {
            sessionId: session.id,
            role: 'assistant',
            content: replyText
          }
        });
      } catch (err) {
        console.warn('Could not save assistant message to DB:', err);
      }
    }

    return NextResponse.json({
      chatId: session?.id || 'guest_session',
      message: replyText,
      role: 'assistant',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: error.message || 'Chat error' }, { status: 500 });
  }
}
