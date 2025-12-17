import { NextResponse } from 'next/server';
import { getNotifications, createNotification, markAllNotificationsAsRead } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const notifications = await getNotifications(userId || undefined);
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recuperation des notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Creating notification with body:', body);
    const notification = await createNotification(body);
    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de la creation de la notification' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId) {
      await markAllNotificationsAsRead(userId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise a jour des notifications' },
      { status: 500 }
    );
  }
}
