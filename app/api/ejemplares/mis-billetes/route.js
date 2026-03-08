const { NextResponse } = require('next/server');
const { prisma } = require('@/lib/prisma');
const { getUserFromRequest } = require('@/lib/auth');

// GET /api/ejemplares/mis-billetes — get all user's banknotes with model info
export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page')) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit')) || 20));
  const enVenta = searchParams.get('en_venta');
  const pais = searchParams.get('pais');
  const estado = searchParams.get('estado');

  try {
    const where = {
      propietario_id: user.id,
      visible: true,
    };

    if (enVenta === 'true') where.en_venta = true;
    if (enVenta === 'false') where.en_venta = false;
    if (estado) where.estado_conservacion = estado;
    if (pais) where.billetes_modelo = { pais };

    const [ejemplares, total] = await Promise.all([
      prisma.ejemplares.findMany({
        where,
        include: {
          billetes_modelo: {
            select: {
              id: true,
              pais: true,
              denominacion: true,
              unidad_monetaria: true,
              a_o_emision: true,
              codigo_catalogo: true,
              imagenes_modelo: {
                where: { visible: true, es_portada: true },
                select: { url: true },
                take: 1,
              },
            },
          },
        },
        orderBy: { id: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.ejemplares.count({ where }),
    ]);

    return NextResponse.json({
      ejemplares: ejemplares.map(e => ({
        id: e.id,
        numero_serie: e.numero_serie,
        estado_conservacion: e.estado_conservacion,
        en_venta: e.en_venta,
        precio: e.precio,
        moneda_precio: e.moneda_precio,
        fecha_adquisicion: e.fecha_adquisicion,
        modelo: e.billetes_modelo ? {
          id: e.billetes_modelo.id,
          pais: e.billetes_modelo.pais,
          denominacion: e.billetes_modelo.denominacion,
          unidad_monetaria: e.billetes_modelo.unidad_monetaria,
          a_o_emision: e.billetes_modelo.a_o_emision,
          codigo_catalogo: e.billetes_modelo.codigo_catalogo,
          imagen: e.billetes_modelo.imagenes_modelo[0]?.url || null,
        } : null,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching mis billetes:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
