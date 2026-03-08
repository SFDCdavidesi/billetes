import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const [
      totalBilletes,
      totalPaises,
      totalImagenes,
      totalUsuarios,
      totalEjemplares,
      totalColecciones,
    ] = await Promise.all([
      prisma.billetes_modelo.count({ where: { visible: true } }),
      prisma.billetes_modelo.findMany({
        where: { visible: true },
        select: { pais: true },
        distinct: ['pais'],
      }).then(r => r.length),
      prisma.imagenes_modelo.count({ where: { visible: true } }),
      prisma.usuarios.count({ where: { activo: true } }),
      prisma.ejemplares.count(),
      prisma.colecciones.count(),
    ]);

    return NextResponse.json({
      totalBilletes,
      totalPaises,
      totalImagenes,
      totalUsuarios,
      totalEjemplares,
      totalColecciones,
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
