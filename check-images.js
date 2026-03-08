const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const count = await p.imagenes_modelo.count();
  console.log('Total imagenes_modelo:', count);
  const portadas = await p.imagenes_modelo.count({ where: { es_portada: true } });
  console.log('With es_portada=true:', portadas);
  const noPortada = await p.imagenes_modelo.count({ where: { es_portada: false } });
  console.log('With es_portada=false:', noPortada);
  const nullPortada = await p.imagenes_modelo.count({ where: { es_portada: null } });
  console.log('With es_portada=null:', nullPortada);
  
  // Check a billete with images
  const b = await p.billetes_modelo.findFirst({
    where: { visible: true },
    orderBy: { id: 'desc' },
    include: { imagenes_modelo: { take: 3 } }
  });
  console.log('Sample billete with images:', JSON.stringify(b, null, 2));
  
  await p.$disconnect();
}
main();
