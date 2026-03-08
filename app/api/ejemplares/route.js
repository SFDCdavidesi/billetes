const { NextResponse } = require('next/server');
const { prisma } = require('@/lib/prisma');
const { getUserFromRequest } = require('@/lib/auth');

// GET /api/ejemplares?modelo_id=123 — get current user's copies of a banknote
export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const modeloId = parseInt(searchParams.get('modelo_id'));

  if (!modeloId || isNaN(modeloId)) {
    return NextResponse.json({ error: 'modelo_id requerido' }, { status: 400 });
  }

  try {
    const ejemplares = await prisma.ejemplares.findMany({
      where: {
        propietario_id: user.id,
        modelo_id: modeloId,
        visible: true,
      },
      orderBy: { id: 'desc' },
    });

    return NextResponse.json({ ejemplares });
  } catch (error) {
    console.error('Error fetching ejemplares:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// POST /api/ejemplares — create a new copy ("I have this")
export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { modelo_id, numero_serie, estado_conservacion, en_venta, precio, moneda_precio } = body;

    if (!modelo_id || isNaN(parseInt(modelo_id))) {
      return NextResponse.json({ error: 'modelo_id requerido' }, { status: 400 });
    }

    // Validate the banknote model exists
    const modelo = await prisma.billetes_modelo.findUnique({
      where: { id: parseInt(modelo_id) },
    });
    if (!modelo) {
      return NextResponse.json({ error: 'Billete no encontrado' }, { status: 404 });
    }

    // Validate condition
    const validConditions = ['UNC', 'AU', 'XF', 'VF', 'F', 'VG', 'G', 'FR', 'P'];
    if (estado_conservacion && !validConditions.includes(estado_conservacion)) {
      return NextResponse.json({ error: 'Estado de conservación no válido' }, { status: 400 });
    }

    // Validate currency
    const validCurrencies = ['EUR', 'USD', 'GBP'];
    const currency = moneda_precio && validCurrencies.includes(moneda_precio) ? moneda_precio : 'EUR';

    // Sanitize serial number (alphanumeric, spaces, dashes only)
    const sanitizedSerial = numero_serie
      ? String(numero_serie).replace(/[^a-zA-Z0-9\s\-\/\.]/g, '').substring(0, 50)
      : null;

    // Validate price
    const isForSale = en_venta === true;
    let parsedPrice = null;
    if (isForSale && precio != null) {
      parsedPrice = parseFloat(precio);
      if (isNaN(parsedPrice) || parsedPrice < 0 || parsedPrice > 99999999999.99) {
        return NextResponse.json({ error: 'Precio no válido' }, { status: 400 });
      }
    }

    const ejemplar = await prisma.ejemplares.create({
      data: {
        modelo_id: parseInt(modelo_id),
        propietario_id: user.id,
        numero_serie: sanitizedSerial,
        estado_conservacion: estado_conservacion || null,
        en_venta: isForSale,
        precio: isForSale ? parsedPrice : null,
        moneda_precio: isForSale ? currency : null,
      },
    });

    return NextResponse.json({ ejemplar }, { status: 201 });
  } catch (error) {
    console.error('Error creating ejemplar:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// PUT /api/ejemplares — update a user's copy
export async function PUT(request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, numero_serie, estado_conservacion, en_venta, precio, moneda_precio } = body;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ error: 'id requerido' }, { status: 400 });
    }

    const ejemplar = await prisma.ejemplares.findUnique({ where: { id: parseInt(id) } });
    if (!ejemplar || ejemplar.propietario_id !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const validConditions = ['UNC', 'AU', 'XF', 'VF', 'F', 'VG', 'G', 'FR', 'P'];
    if (estado_conservacion && !validConditions.includes(estado_conservacion)) {
      return NextResponse.json({ error: 'Estado de conservación no válido' }, { status: 400 });
    }

    const validCurrencies = ['EUR', 'USD', 'GBP'];
    const currency = moneda_precio && validCurrencies.includes(moneda_precio) ? moneda_precio : 'EUR';

    const sanitizedSerial = numero_serie
      ? String(numero_serie).replace(/[^a-zA-Z0-9\s\-\/\.]/g, '').substring(0, 50)
      : null;

    const isForSale = en_venta === true;
    let parsedPrice = null;
    if (isForSale && precio != null) {
      parsedPrice = parseFloat(precio);
      if (isNaN(parsedPrice) || parsedPrice < 0 || parsedPrice > 99999999999.99) {
        return NextResponse.json({ error: 'Precio no válido' }, { status: 400 });
      }
    }

    const updated = await prisma.ejemplares.update({
      where: { id: parseInt(id) },
      data: {
        numero_serie: sanitizedSerial,
        estado_conservacion: estado_conservacion || null,
        en_venta: isForSale,
        precio: isForSale ? parsedPrice : null,
        moneda_precio: isForSale ? currency : null,
      },
    });

    return NextResponse.json({ ejemplar: updated });
  } catch (error) {
    console.error('Error updating ejemplar:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// DELETE /api/ejemplares?id=123 — delete a user's copy
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
    // Verify ownership
    const ejemplar = await prisma.ejemplares.findUnique({ where: { id } });
    if (!ejemplar || ejemplar.propietario_id !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await prisma.ejemplares.update({
      where: { id },
      data: { visible: false },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting ejemplar:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
