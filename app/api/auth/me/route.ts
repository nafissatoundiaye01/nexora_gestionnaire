import { NextResponse } from 'next/server';
import { validateToken, getUser, getAuthTokenByUserId } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Token requis' },
        { status: 401 }
      );
    }

    const validation = await validateToken(token);

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Token invalide ou expire', expired: validation.expired },
        { status: 401 }
      );
    }

    const user = await getUser(validation.userId!);

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouve' },
        { status: 404 }
      );
    }

    const authToken = await getAuthTokenByUserId(user.id);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      expiresAt: authToken?.expiresAt,
    });
  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la verification' },
      { status: 500 }
    );
  }
}
