import { NextResponse } from 'next/server';
import { validateToken, deleteAuthToken } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Token requis' },
        { status: 400 }
      );
    }

    const validation = await validateToken(token);

    if (validation.userId) {
      await deleteAuthToken(validation.userId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la deconnexion' },
      { status: 500 }
    );
  }
}
