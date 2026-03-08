const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const count = await p.billetes_modelo.count();
  console.log('Total billetes_modelo:', count);
  
  const sample = await p.billetes_modelo.findMany({ take: 3, orderBy: { id: 'desc' } });
  console.log('Sample:', JSON.stringify(sample, null, 2));

  const ejemplares = await p.ejemplares.count();
  console.log('Total ejemplares:', ejemplares);

  if (ejemplares > 0) {
    const ej = await p.ejemplares.findMany({ 
      take: 3, 
      orderBy: { id: 'desc' },
      include: { billetes_modelo: true, imagenes_ejemplar: true }
    });
    console.log('Sample ejemplares:', JSON.stringify(ej, null, 2));
  }

  const imgs = await p.imagenes_ejemplar.count();
  console.log('Total imagenes_ejemplar:', imgs);

  await p.$disconnect();
}
main().catch(e => { console.error(e); p.$disconnect(); });
