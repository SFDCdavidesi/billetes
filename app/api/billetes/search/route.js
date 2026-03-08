import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const pais = searchParams.get('pais');
    const anioDesde = searchParams.get('anio_desde');
    const anioHasta = searchParams.get('anio_hasta');
    const denominacion = searchParams.get('denominacion');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const skip = (page - 1) * limit;

    const where = { visible: true };

    if (pais) {
      where.pais = pais;
    }
    if (anioDesde || anioHasta) {
      where.a_o_emision = {};
      if (anioDesde) where.a_o_emision.gte = parseInt(anioDesde, 10);
      if (anioHasta) where.a_o_emision.lte = parseInt(anioHasta, 10);
    }
    if (denominacion) {
      where.unidad_monetaria = { contains: denominacion, mode: 'insensitive' };
    }

    const [billetes, total] = await Promise.all([
      prisma.billetes_modelo.findMany({
        where,
        orderBy: { id: 'desc' },
        skip,
        take: limit,
        include: {
          imagenes_modelo: {
            where: { visible: true, es_portada: true },
            take: 1,
          },
        },
      }),
      prisma.billetes_modelo.count({ where }),
    ]);

    const result = billetes.map(b => ({
      id: b.id,
      pais: b.pais,
      denominacion: b.denominacion,
      unidad_monetaria: b.unidad_monetaria,
      anio: b.a_o_emision,
      codigo_catalogo: b.codigo_catalogo,
      imagen: b.imagenes_modelo[0]?.url || null,
    }));

    return NextResponse.json({
      billetes: result,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error searching banknotes:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
