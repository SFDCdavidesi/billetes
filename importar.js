const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  // 1. Capturar el nombre del archivo desde la terminal
  const archivo = process.argv[2];

  // Escudo de seguridad 1: ¿Olvidó poner el nombre?
  if (!archivo) {
    console.error("❌ Error: Debes indicar el nombre del archivo JSON.");
    console.error("👉 Ejemplo de uso: node importar.js billetes_a.json");
    process.exit(1);
  }

  // Escudo de seguridad 2: ¿Existe realmente ese archivo?
  if (!fs.existsSync(`./${archivo}`)) {
    console.error(`❌ Error: El archivo '${archivo}' no existe en esta carpeta.`);
    process.exit(1);
  }

  // 2. Leer el archivo JSON de forma dinámica
  console.log(`📂 Leyendo archivo ${archivo}...`);
  const data = JSON.parse(fs.readFileSync(`./${archivo}`, 'utf-8'));
  const billetes = data.banknotes;

  console.log(`¡Encontrados ${billetes.length} billetes! Empezando la importación a billetes_modelo...`);

  let insertados = 0;

  // 3. Recorrer cada billete y limpiarlo
  for (const b of billetes) {
    if (!b.country || !b.pick_number) continue;

    // Extraer el año occidental
    const matchAno = b.date ? b.date.match(/\b(18|19|20)\d{2}\b/) : null;
    const añoLimpio = matchAno ? parseInt(matchAno[0]) : null;

    // Arreglar denominación nula
    const denominacionLimpia = b.denomination ? parseFloat(b.denomination) : 0;

    // Intentar sacar la unidad monetaria
    let unidadLimpia = "Desconocida";
    if (b.title) {
        const partesTitulo = b.title.split(' ');
        if (partesTitulo.length >= 3) {
            unidadLimpia = partesTitulo[2];
        }
    }

    try {
      // 4. Insertar en la base de datos
 // 4. Insertar en la base de datos
      await prisma.billetes_modelo.create({
        data: {
          pais: b.country,
          denominacion: denominacionLimpia,
          unidad_monetaria: unidadLimpia,
          a_o_emision: añoLimpio,         // <--- ¡AQUÍ ESTÁ EL CAMBIO!
          codigo_catalogo: b.pick_number,
          visible: true
        }
      });
      insertados++;
      console.log(`✅ Insertado: ${b.country} - ${b.pick_number}`);
    } catch (error) {
      console.error(`❌ Error insertando ${b.pick_number}:`, error.message);
    }
  }

  console.log(`\n🎉 ¡Importación finalizada! Se insertaron ${insertados} modelos desde ${archivo}.`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });