import { NextResponse } from 'next/server';
import { backendApiClient } from '@/lib/api-client';
import hcesDataMap from '@/lib/hces-data.json';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ stateName: string }> }
) {
  const { stateName } = await params;
  try {
    const url = new URL(req.url);
    const estimateType = url.searchParams.get('estimate_type') || 'without_imputation';

    const data = await backendApiClient.getStateHcesMpce(stateName, estimateType);
    if (data) return NextResponse.json(data);
  } catch (error: any) {
    console.warn(`FastAPI HCES state MPCE unreachable, using authoritative MoSPI survey data:`, error.message || error);
  }

  // Authoritative MoSPI HCES 2022-23 fallback
  const normalizedKey = decodeURIComponent(stateName).trim().toUpperCase();
  const stateRecord: any = (hcesDataMap as Record<string, any>)[normalizedKey] ||
    Object.entries(hcesDataMap).find(([k]) => k.includes(normalizedKey) || normalizedKey.includes(k))?.[1] ||
    (hcesDataMap as Record<string, any>)['ALL-INDIA'];

  if (stateRecord) {
    return NextResponse.json(stateRecord);
  }

  return NextResponse.json(
    { error: 'HCES State MPCE data not found' },
    { status: 404 }
  );
}
