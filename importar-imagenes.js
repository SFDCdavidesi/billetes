const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const dataDir = path.join(__dirname, 'scraper', 'data');
  const jsonFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
  
  console.log(`Encontrados ${jsonFiles.length} archivos JSON: ${jsonFiles.join(', ')}`);

  // Check current count
  const existingCount = await prisma.imagenes_modelo.count();
  console.log(`Imágenes ya existentes en DB: ${existingCount}`);
  
  if (existingCount > 0) {
    console.log('Limpiando imágenes existentes...');
    await prisma.imagenes_modelo.deleteMany();
  }

  let totalInserted = 0;

  for (const file of jsonFiles) {
    const filePath = path.join(dataDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const banknotes = data.banknotes || [];
    
    console.log(`\nProcesando ${file} (${banknotes.length} billetes)...`);
    let fileInserted = 0;

    for (const b of banknotes) {
      if (!b.pick_number || !b.country || !b.images || b.images.length === 0) continue;

      // Find the matching billetes_modelo by country + pick_number
      const modelo = await prisma.billetes_modelo.findFirst({
        where: {
          pais: b.country,
          codigo_catalogo: b.pick_number
        }
      });

      if (!modelo) continue;

      // Insert images - first one is portada (cover)
      const imageData = b.images.map((url, index) => ({
        modelo_id: modelo.id,
        url: url,
        es_portada: index === 0,
        visible: true
      }));

      await prisma.imagenes_modelo.createMany({ data: imageData });
      fileInserted += imageData.length;
    }

    totalInserted += fileInserted;
    console.log(`  ✅ ${fileInserted} imágenes insertadas desde ${file}`);
  }

  console.log(`\n🎉 Total: ${totalInserted} imágenes importadas`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
