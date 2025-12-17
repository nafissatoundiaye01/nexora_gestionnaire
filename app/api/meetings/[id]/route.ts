import { NextRequest, NextResponse } from 'next/server';
import { getMeeting, updateMeeting, deleteMeeting } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const meeting = await getMeeting(id);
    if (!meeting) {
      return NextResponse.json({ error: 'Reunion non trouvee' }, { status: 404 });
    }
    return NextResponse.json(meeting);
  } catch (error) {
    console.error('Error fetching meeting:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recuperation de la reunion' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const meeting = await updateMeeting(id, body);
    if (!meeting) {
      return NextResponse.json({ error: 'Reunion non trouvee' }, { status: 404 });
    }
    return NextResponse.json(meeting);
  } catch (error) {
    console.error('Error updating meeting:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise a jour de la reunion' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteMeeting(id);
    if (!success) {
      return NextResponse.json({ error: 'Reunion non trouvee' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la reunion' },
      { status: 500 }
    );
  }
}
