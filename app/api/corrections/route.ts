import { NextRequest, NextResponse } from 'next/server';
import { getCorrections, createCorrection } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const corrections = await getCorrections(projectId || undefined);
    return NextResponse.json(corrections);
  } catch (error) {
    console.error('Error fetching corrections:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recuperation des corrections' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Creating correction with body:', body);
    const correction = await createCorrection(body);
    return NextResponse.json(correction, { status: 201 });
  } catch (error) {
    console.error('Error creating correction:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de la creation de la correction' },
      { status: 500 }
    );
  }
}
