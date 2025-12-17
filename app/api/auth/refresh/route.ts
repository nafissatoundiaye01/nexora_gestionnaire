import { NextResponse } from 'next/server';
import { refreshAuthToken, getUser } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token requis' },
        { status: 400 }
      );
    }

    const newAuthToken = await refreshAuthToken(refreshToken);

    if (!newAuthToken) {
      return NextResponse.json(
        { error: 'Refresh token invalide ou expire' },
        { status: 401 }
      );
    }

    const user = await getUser(newAuthToken.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouve' },
        { status: 404 }
      );
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      token: newAuthToken.token,
      refreshToken: newAuthToken.refreshToken,
      expiresAt: newAuthToken.expiresAt,
    });
  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du rafraichissement du token' },
      { status: 500 }
    );
  }
}
