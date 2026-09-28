import { NextResponse } from 'next/server';
import { backendApiClient } from '@/lib/api-client';
import districtList from '@/lib/districts-msme-data.json';

export const dynamic = 'force-dynamic';

function toTitleCase(str: string): string {
  if (!str) return '';
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function GET() {
  try {
    const districts = await backendApiClient.listDistricts();
    if (Array.isArray(districts) && districts.length > 0) {
      return NextResponse.json(districts);
    }
  } catch (error: any) {
    console.warn('FastAPI districts list unavailable, serving authoritative reference data:', error.message || error);
  }

  const fallbackDistricts = districtList.map((d: any) => ({
    id: d.id,
    district_name: toTitleCase(d.district_name),
    district_code: d.district_code,
    state_id: d.state_id,
    state_name: toTitleCase(d.state_name),
  }));

  return NextResponse.json(fallbackDistricts);
}
