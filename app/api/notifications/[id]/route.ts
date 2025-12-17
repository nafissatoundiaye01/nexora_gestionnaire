import { NextResponse } from 'next/server';
import { getNotification, updateNotification, deleteNotification } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const notification = await getNotification(id);
  if (!notification) {
    return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
  }
  return NextResponse.json(notification);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const updated = await updateNotification(id, body);
  if (!updated) {
    return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = await deleteNotification(id);
  if (!deleted) {
    return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
