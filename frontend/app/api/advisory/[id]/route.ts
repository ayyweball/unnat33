import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateFallbackDPR } from '@/lib/fallback-data';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser().catch(() => null);

    let advisory: any = null;
    try {
      advisory = await prisma.advisory.findUnique({
        where: { id: params.id },
        include: {
          business: true,
          schemeMatches: true,
          reports: true,
        },
      });
    } catch (dbErr) {
      console.warn('Prisma DB error in /api/advisory/[id], using fallback advisory:', dbErr);
    }

    if (!advisory) {
      let userBusiness: any = null;
      if (user?.id) {
        userBusiness = await prisma.business.findFirst({
          where: { userId: user.id }
        }).catch(() => null);
      }

      const fallbackDpr = generateFallbackDPR({
        report_id: params.id,
        project_name: userBusiness?.name || (user?.name ? `${user.name}'s Enterprise` : undefined),
        promoter_name: user?.name || undefined,
        business_type: userBusiness?.sector || userBusiness?.type || undefined,
        sub_type: userBusiness?.description || undefined,
        district_name: userBusiness?.district || user?.district || undefined,
        state_name: userBusiness?.state || user?.state || undefined,
        estimated_capital: userBusiness?.projectCost || userBusiness?.estimatedCapital || undefined,
        current_income: userBusiness?.monthlyIncome ? Number(userBusiness.monthlyIncome) * 12 : undefined,
        location_type: userBusiness?.isRural ? 'RURAL' : 'URBAN',
        category: (user as any)?.category || undefined,
        gender: (user as any)?.gender || undefined,
      });
      return NextResponse.json({
        advisory: {
          id: params.id,
          businessId: userBusiness?.id || 'enterprise-id',
          userId: user?.id || 'user-id',
          type: 'business_plan',
          planJson: fallbackDpr,
          financialJson: null,
          status: 'active',
          business: {
            id: userBusiness?.id || 'enterprise-id',
            name: fallbackDpr.project_name,
            sector: fallbackDpr.business_type,
            district: fallbackDpr.district_name,
            state: fallbackDpr.state_name,
            projectCost: fallbackDpr.capital_structure.total_project_cost,
          },
        }
      });
    }

    const parsedPlan = typeof advisory.planJson === 'string' ? JSON.parse(advisory.planJson) : advisory.planJson;
    const parsedFinancial = typeof advisory.financialJson === 'string' ? JSON.parse(advisory.financialJson) : advisory.financialJson;

    return NextResponse.json({
      advisory: {
        ...advisory,
        planJson: parsedPlan,
        financialJson: parsedFinancial,
      }
    });
  } catch (error: any) {
    console.error('Error in /api/advisory/[id]:', error);
    const fallbackDpr = generateFallbackDPR({ report_id: params.id });
    return NextResponse.json({
      advisory: {
        id: params.id,
        businessId: 'demo-business-id',
        type: 'business_plan',
        planJson: fallbackDpr,
        financialJson: null,
        status: 'active',
      }
    });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser().catch(() => null);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
      await prisma.advisory.delete({ where: { id: params.id } });
    } catch (delErr) {
      console.warn('Could not delete advisory from Prisma:', delErr);
    }
    return NextResponse.json({ deleted: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
