import { NextResponse } from 'next/server';
import { backendApiClient } from '@/lib/api-client';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ stateName: string }> }
) {
  try {
    const { stateName } = await params;
    const url = new URL(req.url);
    const estimateType = url.searchParams.get('estimate_type') || 'without_imputation';

    const data = await backendApiClient.getStateHcesMpce(stateName, estimateType);
    return NextResponse.json(data);
  } catch (error: any) {
    console.warn(`Failed to fetch HCES state MPCE:`, error.message || error);
    return NextResponse.json(
      { error: error.message || 'HCES State MPCE data not found' },
      { status: 404 }
    );
  }
}
