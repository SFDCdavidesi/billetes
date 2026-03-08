import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const modeloId = parseInt(id, 10);

    if (isNaN(modeloId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const billete = await prisma.billetes_modelo.findUnique({
      where: { id: modeloId },
      include: {
        imagenes_modelo: {
          where: { visible: true },
          orderBy: { es_portada: 'desc' },
        },
        ejemplares: {
          where: { visible: true, en_venta: true },
          include: {
            usuarios: {
              select: { id: true, nombre: true },
            },
            imagenes_ejemplar: {
              where: { visible: true },
              orderBy: { es_portada: 'desc' },
            },
          },
          orderBy: { precio: 'asc' },
        },
      },
    });

    if (!billete || !billete.visible) {
      return NextResponse.json({ error: 'Billete no encontrado' }, { status: 404 });
    }

    const result = {
      id: billete.id,
      pais: billete.pais,
      denominacion: billete.denominacion,
      unidad_monetaria: billete.unidad_monetaria,
      anio: billete.a_o_emision,
      codigo_catalogo: billete.codigo_catalogo,
      imagenes: billete.imagenes_modelo.map(img => ({
        id: img.id,
        url: img.url,
        es_portada: img.es_portada,
      })),
      ejemplares_en_venta: billete.ejemplares.map(ej => ({
        id: ej.id,
        estado_conservacion: ej.estado_conservacion,
        precio: ej.precio,
        moneda_precio: ej.moneda_precio || 'EUR',
        notas_privadas: null,
        propietario: ej.usuarios?.nombre || 'Anónimo',
        imagenes: ej.imagenes_ejemplar.map(img => ({
          id: img.id,
          url: img.url,
          es_portada: img.es_portada,
        })),
      })),
    };

    return NextResponse.json({ billete: result });
  } catch (error) {
    console.error('Error fetching banknote:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
