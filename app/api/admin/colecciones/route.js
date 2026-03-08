import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user || user.perfil !== 'administrador') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const colecciones = await prisma.colecciones.findMany({
      include: {
        usuarios: { select: { nombre: true, email: true } },
        _count: { select: { colecciones_items: true } },
      },
      orderBy: { fecha_creacion: 'desc' },
    });

    return NextResponse.json({ colecciones });
  } catch (error) {
    console.error('Error al obtener colecciones:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
