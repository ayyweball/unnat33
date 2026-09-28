import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const cleanPhone = phone.toString().trim().replace(/\D/g, '');
    if (!/^\d{10}$/.test(cleanPhone)) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit mobile number' }, { status: 400 });
    }

    // Find existing user or initialize a fresh, clean blank user
    let user = await prisma.user.findUnique({
      where: { phone: cleanPhone },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone: cleanPhone,
          name: '',
          language: 'en',
          state: '',
          district: '',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      phone: user.phone,
      mockOtp: '123456',
    });
  } catch (error: any) {
    console.error('Error in /api/auth/login:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
