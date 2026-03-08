import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken, getSessionCookieOptions } from '@/lib/auth';
const bcrypt = require('bcryptjs');

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son obligatorios' },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuarios.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { perfiles: true },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    const passwordValid = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    if (!usuario.activo) {
      return NextResponse.json(
        { error: 'Tu cuenta no está activa. Contacta con el administrador.' },
        { status: 403 }
      );
    }

    if (!usuario.email_validado) {
      return NextResponse.json(
        { error: 'Debes verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.' },
        { status: 403 }
      );
    }

    const token = signToken({
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      perfil: usuario.perfiles?.nombre || 'usuario',
    });

    const cookieOptions = getSessionCookieOptions();
    const response = NextResponse.json({
      success: true,
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        perfil: usuario.perfiles?.nombre || 'usuario',
      },
    });

    response.cookies.set(cookieOptions.name, token, {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      path: cookieOptions.path,
      maxAge: cookieOptions.maxAge,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
