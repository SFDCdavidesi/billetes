const { NextResponse } = require('next/server');
const { prisma } = require('@/lib/prisma');
const { getUserFromRequest } = require('@/lib/auth');

// GET /api/colecciones — get current user's collections
export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const colecciones = await prisma.colecciones.findMany({
      where: {
        usuario_id: user.id,
        visible: true,
      },
      include: {
        colecciones_items: {
          where: { visible: true },
          include: {
            billetes_modelo: {
              include: {
                imagenes_modelo: {
                  where: { es_portada: true, visible: true },
                  take: 1,
                },
              },
            },
          },
          orderBy: { fecha_agregado: 'desc' },
        },
      },
      orderBy: { fecha_creacion: 'desc' },
    });

    return NextResponse.json({ colecciones });
  } catch (error) {
    console.error('Error fetching colecciones:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// POST /api/colecciones — create a new collection
export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { nombre, descripcion } = body;

    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });
    }

    const sanitizedName = nombre.trim().substring(0, 100);
    const sanitizedDesc = descripcion ? String(descripcion).trim().substring(0, 500) : null;

    // Limit collections per user
    const count = await prisma.colecciones.count({
      where: { usuario_id: user.id, visible: true },
    });
    if (count >= 50) {
      return NextResponse.json({ error: 'Máximo 50 colecciones' }, { status: 400 });
    }

    const coleccion = await prisma.colecciones.create({
      data: {
        usuario_id: user.id,
        nombre: sanitizedName,
        descripcion: sanitizedDesc,
      },
    });

    return NextResponse.json({ coleccion }, { status: 201 });
  } catch (error) {
    console.error('Error creating coleccion:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// PUT /api/colecciones — update a collection
export async function PUT(request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, nombre, descripcion } = body;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ error: 'id requerido' }, { status: 400 });
    }

    // Verify ownership
    const coleccion = await prisma.colecciones.findUnique({ where: { id: parseInt(id) } });
    if (!coleccion || coleccion.usuario_id !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const data = {};
    if (nombre !== undefined) {
      if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
        return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });
      }
      data.nombre = nombre.trim().substring(0, 100);
    }
    if (descripcion !== undefined) {
      data.descripcion = descripcion ? String(descripcion).trim().substring(0, 500) : null;
    }

    const updated = await prisma.colecciones.update({
      where: { id: parseInt(id) },
      data,
    });

    return NextResponse.json({ coleccion: updated });
  } catch (error) {
    console.error('Error updating coleccion:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// DELETE /api/colecciones — soft delete a collection
export async function DELETE(request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get('id'));

  if (!id || isNaN(id)) {
    return NextResponse.json({ error: 'id requerido' }, { status: 400 });
  }

  try {
    const coleccion = await prisma.colecciones.findUnique({ where: { id } });
    if (!coleccion || coleccion.usuario_id !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await prisma.colecciones.update({
      where: { id },
      data: { visible: false },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting coleccion:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
