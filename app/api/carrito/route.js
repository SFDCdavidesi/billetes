import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const ejemplarId = parseInt(body.ejemplar_id, 10);

    if (isNaN(ejemplarId)) {
      return NextResponse.json({ error: 'ID de ejemplar inválido' }, { status: 400 });
    }

    // Verify the ejemplar exists, is for sale, and isn't owned by the requesting user
    const ejemplar = await prisma.ejemplares.findUnique({
      where: { id: ejemplarId },
    });

    if (!ejemplar || !ejemplar.visible || !ejemplar.en_venta) {
      return NextResponse.json({ error: 'Ejemplar no disponible' }, { status: 404 });
    }

    if (ejemplar.propietario_id === user.id) {
      return NextResponse.json({ error: 'No puedes comprar tu propio ejemplar' }, { status: 400 });
    }

    // Upsert to avoid duplicates (unique constraint on usuario_id + ejemplar_id)
    const item = await prisma.carrito_items.upsert({
      where: {
        usuario_id_ejemplar_id: {
          usuario_id: user.id,
          ejemplar_id: ejemplarId,
        },
      },
      update: {
        visible: true,
        fecha_agregado: new Date(),
      },
      create: {
        usuario_id: user.id,
        ejemplar_id: ejemplarId,
      },
    });

    return NextResponse.json({ ok: true, item: { id: item.id } });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const items = await prisma.carrito_items.findMany({
      where: {
        usuario_id: user.id,
        visible: true,
      },
      include: {
        ejemplares: {
          include: {
            billetes_modelo: {
              include: {
                imagenes_modelo: {
                  where: { visible: true, es_portada: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
      orderBy: { fecha_agregado: 'desc' },
    });

    const result = items.map(item => ({
      id: item.id,
      ejemplar_id: item.ejemplar_id,
      precio: item.ejemplares?.precio,
      estado: item.ejemplares?.estado_conservacion,
      billete: {
        id: item.ejemplares?.billetes_modelo?.id,
        pais: item.ejemplares?.billetes_modelo?.pais,
        denominacion: item.ejemplares?.billetes_modelo?.denominacion,
        unidad_monetaria: item.ejemplares?.billetes_modelo?.unidad_monetaria,
        codigo_catalogo: item.ejemplares?.billetes_modelo?.codigo_catalogo,
        imagen: item.ejemplares?.billetes_modelo?.imagenes_modelo?.[0]?.url || null,
      },
    }));

    return NextResponse.json({ items: result });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
