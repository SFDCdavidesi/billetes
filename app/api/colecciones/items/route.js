const { NextResponse } = require('next/server');
const { prisma } = require('@/lib/prisma');
const { getUserFromRequest } = require('@/lib/auth');

// POST /api/colecciones/items — add a banknote to a collection
export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { coleccion_id, modelo_id } = body;

    if (!coleccion_id || !modelo_id) {
      return NextResponse.json({ error: 'coleccion_id y modelo_id requeridos' }, { status: 400 });
    }

    // Verify collection ownership
    const coleccion = await prisma.colecciones.findUnique({
      where: { id: parseInt(coleccion_id) },
    });
    if (!coleccion || coleccion.usuario_id !== user.id || !coleccion.visible) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Verify banknote exists
    const modelo = await prisma.billetes_modelo.findUnique({
      where: { id: parseInt(modelo_id) },
    });
    if (!modelo) {
      return NextResponse.json({ error: 'Billete no encontrado' }, { status: 404 });
    }

    // Check if already in collection
    const existing = await prisma.colecciones_items.findFirst({
      where: {
        coleccion_id: parseInt(coleccion_id),
        modelo_id: parseInt(modelo_id),
        visible: true,
      },
    });
    if (existing) {
      return NextResponse.json({ error: 'Ya está en la colección' }, { status: 409 });
    }

    const item = await prisma.colecciones_items.create({
      data: {
        coleccion_id: parseInt(coleccion_id),
        modelo_id: parseInt(modelo_id),
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Error adding to collection:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// DELETE /api/colecciones/items?id=123 — remove item from collection
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
    const item = await prisma.colecciones_items.findUnique({
      where: { id },
      include: { colecciones: true },
    });
    if (!item || !item.colecciones || item.colecciones.usuario_id !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await prisma.colecciones_items.update({
      where: { id },
      data: { visible: false },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error removing from collection:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
