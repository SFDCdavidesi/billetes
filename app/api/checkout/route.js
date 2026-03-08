import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { NextResponse } from 'next/server';

// Simulated checkout endpoint
export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { direccion, metodo_pago } = body;

    if (!direccion || !direccion.nombre || !direccion.calle || !direccion.ciudad || !direccion.codigo_postal || !direccion.pais) {
      return NextResponse.json({ error: 'Dirección incompleta' }, { status: 400 });
    }

    if (!metodo_pago) {
      return NextResponse.json({ error: 'Método de pago requerido' }, { status: 400 });
    }

    // Get cart items
    const cartItems = await prisma.carrito_items.findMany({
      where: { usuario_id: user.id, visible: true },
      include: {
        ejemplares: {
          include: {
            billetes_modelo: true,
          },
        },
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Carrito vacío' }, { status: 400 });
    }

    // Simulate Stripe payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create orders for each item (simulated)
    const orders = [];
    for (const item of cartItems) {
      const order = await prisma.pedidos.create({
        data: {
          comprador_id: user.id,
          vendedor_id: item.ejemplares.propietario_id,
          ejemplar_id: item.ejemplar_id,
          precio_final: item.ejemplares.precio || 0,
          estado: 'pagado',
        },
      });
      orders.push(order);
    }

    // Clear the cart
    await prisma.carrito_items.deleteMany({
      where: { usuario_id: user.id },
    });

    return NextResponse.json({
      success: true,
      order_id: `ORD-${Date.now()}`,
      items_count: orders.length,
      message: 'Pago procesado correctamente',
    });
  } catch (error) {
    console.error('Error en checkout:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
