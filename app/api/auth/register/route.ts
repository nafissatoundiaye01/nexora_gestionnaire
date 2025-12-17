import { NextResponse } from 'next/server';
import { getUserByEmail, createUser, hashPassword, createAuthToken } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est deja utilise' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caracteres' },
        { status: 400 }
      );
    }

    // Create user
    const newUser = createUser({
      email: email.toLowerCase(),
      password: hashPassword(password),
      name,
      role: 'user',
    });

    // Create auth token
    const authToken = createAuthToken(newUser.id);

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      user: userWithoutPassword,
      token: authToken.token,
      refreshToken: authToken.refreshToken,
      expiresAt: authToken.expiresAt,
    }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}
