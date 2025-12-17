import { NextResponse } from 'next/server';
import { validateToken, getUser, verifyPassword, hashPassword, updateUser } from '@/lib/db';

export async function POST(request: Request) {
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

    if (!validation.valid || !validation.userId) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Mot de passe actuel et nouveau mot de passe requis' },
        { status: 400 }
      );
    }

    const user = await getUser(validation.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouve' },
        { status: 404 }
      );
    }

    // Verify current password
    if (!verifyPassword(currentPassword, user.password)) {
      return NextResponse.json(
        { error: 'Mot de passe actuel incorrect' },
        { status: 401 }
      );
    }

    // Validate new password strength
    const passwordErrors: string[] = [];
    if (newPassword.length < 8) {
      passwordErrors.push('Au moins 8 caracteres');
    }
    if (!/[A-Z]/.test(newPassword)) {
      passwordErrors.push('Au moins une majuscule');
    }
    if (!/[a-z]/.test(newPassword)) {
      passwordErrors.push('Au moins une minuscule');
    }
    if (!/[0-9]/.test(newPassword)) {
      passwordErrors.push('Au moins un chiffre');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      passwordErrors.push('Au moins un caractere special');
    }

    if (passwordErrors.length > 0) {
      return NextResponse.json(
        { error: `Mot de passe non conforme: ${passwordErrors.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if new password is different from current
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'Le nouveau mot de passe doit etre different de l\'ancien' },
        { status: 400 }
      );
    }

    // Update password and set mustChangePassword to false
    const updatedUser = await updateUser(user.id, {
      password: hashPassword(newPassword),
      mustChangePassword: false,
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Erreur lors de la mise a jour' },
        { status: 500 }
      );
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du changement de mot de passe' },
      { status: 500 }
    );
  }
}
