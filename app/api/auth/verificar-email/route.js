import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token de verificación requerido' },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuarios.findFirst({
      where: {
        token_verificacion: token,
        visible: true,
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 400 }
      );
    }

    if (usuario.email_validado) {
      return NextResponse.json({ success: true, alreadyVerified: true });
    }

    await prisma.usuarios.update({
      where: { id: usuario.id },
      data: {
        email_validado: true,
        token_verificacion: null,
        fecha_modificacion: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en verificar-email:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
