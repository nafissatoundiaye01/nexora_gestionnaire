import { NextRequest, NextResponse } from 'next/server';
import { getCorrections, createCorrection } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const corrections = await getCorrections(projectId || undefined);
  return NextResponse.json(corrections);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const correction = await createCorrection(body);
  return NextResponse.json(correction, { status: 201 });
}
