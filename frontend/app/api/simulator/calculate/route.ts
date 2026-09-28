import { NextResponse } from 'next/server';
import { backendApiClient, SimulatorCalculateRequest } from '@/lib/api-client';

export async function POST(req: Request) {
  try {
    const payload: SimulatorCalculateRequest = await req.json();

    // Single source of truth: forward to backend simulator endpoint
    const response = await backendApiClient.calculateSimulation(payload);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in /api/simulator/calculate route proxy:', error);
    return NextResponse.json(
      {
        error:
          error.message ||
          'Failed to connect to backend simulation calculation engine. Please verify the backend service is running and try again.',
      },
      { status: 503 }
    );
  }
}
