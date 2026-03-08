import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const paises = await prisma.billetes_modelo.findMany({
      where: { visible: true },
      select: { pais: true },
      distinct: ['pais'],
      orderBy: { pais: 'asc' },
    });

    return NextResponse.json({ paises: paises.map(p => p.pais) });
  } catch (error) {
    console.error('Error fetching countries:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
