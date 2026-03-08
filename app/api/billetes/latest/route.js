import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const billetes = await prisma.billetes_modelo.findMany({
      where: {
        visible: true,
        imagenes_modelo: { some: { visible: true, es_portada: true } },
      },
      orderBy: { id: 'desc' },
      take: 100,
      include: {
        imagenes_modelo: {
          where: { visible: true, es_portada: true },
          take: 1,
        },
      },
    });

    const result = billetes.map(b => ({
      id: b.id,
      pais: b.pais,
      denominacion: b.denominacion,
      unidad_monetaria: b.unidad_monetaria,
      anio: b.a_o_emision,
      codigo_catalogo: b.codigo_catalogo,
      imagen: b.imagenes_modelo[0]?.url || null,
    }));

    return NextResponse.json({ billetes: result });
  } catch (error) {
    console.error('Error fetching latest banknotes:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
