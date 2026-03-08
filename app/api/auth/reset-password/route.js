import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token y contraseña requeridos' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 });
    }

    const usuario = await prisma.usuarios.findFirst({
      where: { token_verificacion: token, visible: true },
      select: { id: true, fecha_modificacion: true },
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 400 });
    }

    // Check token expiry (1 hour)
    const tokenAge = Date.now() - new Date(usuario.fecha_modificacion).getTime();
    if (tokenAge > 60 * 60 * 1000) {
      return NextResponse.json({ error: 'Token expirado. Solicita un nuevo enlace.' }, { status: 400 });
    }

    const password_hash = await bcrypt.hash(password, 10);

    await prisma.usuarios.update({
      where: { id: usuario.id },
      data: {
        password_hash,
        token_verificacion: null,
        fecha_modificacion: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en reset-password:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
