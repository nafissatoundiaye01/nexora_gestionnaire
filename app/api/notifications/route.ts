import { NextResponse } from 'next/server';
import { getNotifications, createNotification, markAllNotificationsAsRead } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const notifications = await getNotifications(userId || undefined);
  return NextResponse.json(notifications);
}

export async function POST(request: Request) {
  const body = await request.json();
  const notification = await createNotification(body);
  return NextResponse.json(notification, { status: 201 });
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (userId) {
    await markAllNotificationsAsRead(userId);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'userId is required' }, { status: 400 });
}
