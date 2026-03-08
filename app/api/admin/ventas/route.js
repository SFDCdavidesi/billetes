import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const perfilRow = await prisma.perfiles?.findUnique({ where: { id: user.perfil_id || 0 } });
    const perfil = perfilRow?.nombre || user.perfil;
    if (perfil !== 'administrador') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const pais = searchParams.get('pais') || '';
    const vendedor = searchParams.get('vendedor') || '';
    const moneda = searchParams.get('moneda') || '';

    const where = {
      en_venta: true,
      visible: true,
    };

    if (moneda) {
      where.moneda_precio = moneda;
    }

    if (vendedor) {
      where.usuarios = {
        nombre: { contains: vendedor, mode: 'insensitive' },
      };
    }

    if (pais) {
      where.billetes_modelo = {
        pais: { contains: pais, mode: 'insensitive' },
      };
    }

    const ejemplares = await prisma.ejemplares.findMany({
      where,
      include: {
        billetes_modelo: {
          include: {
            imagenes_modelo: {
              where: { visible: true, es_portada: true },
              take: 1,
            },
          },
        },
        usuarios: {
          select: { id: true, nombre: true, email: true },
        },
        imagenes_ejemplar: {
          where: { visible: true },
          take: 1,
        },
      },
      orderBy: { id: 'desc' },
    });

    const ventas = ejemplares.map(ej => {
      const modelo = ej.billetes_modelo;
      const imagen = ej.imagenes_ejemplar?.[0]?.url || modelo?.imagenes_modelo?.[0]?.url || null;

      return {
        id: ej.id,
        modelo_id: modelo?.id,
        pais: modelo?.pais,
        denominacion: modelo?.denominacion,
        unidad_monetaria: modelo?.unidad_monetaria,
        codigo_catalogo: modelo?.codigo_catalogo,
        anio_emision: modelo?.a_o_emision,
        precio: ej.precio,
        moneda_precio: ej.moneda_precio || 'EUR',
        estado_conservacion: ej.estado_conservacion,
        condiciones_venta: ej.condiciones_venta,
        vendedor: ej.usuarios?.nombre,
        vendedor_email: ej.usuarios?.email,
        vendedor_id: ej.usuarios?.id,
        imagen,
      };
    });

    return NextResponse.json({ ventas });
  } catch (error) {
    console.error('Error fetching ventas:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
