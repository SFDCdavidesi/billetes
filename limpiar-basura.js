/**
 * Script para eliminar registros basura de los JSON y de la base de datos.
 * Registros basura = cabeceras de sección, títulos null/vacíos, entradas sin denominación numérica, datos de test.
 * 
 * USO: node limpiar-basura.js
 */
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const FRAC_MAP = {
  '\u00BD': 0.5, '\u00BC': 0.25, '\u00BE': 0.75,
  '\u2153': 1/3, '\u2154': 2/3, '\u2155': 0.2,
  '\u215B': 0.125, '\u215C': 0.375, '\u215D': 0.625, '\u215E': 0.875
};
const FRAC_CHARS = Object.keys(FRAC_MAP).join('');

function parseDenomination(title, country) {
  if (!title || !country) return null;

  let t = title.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (t.startsWith(country)) t = t.slice(country.length);
  t = t.replace(/^[\s|]+/, '');
  if (!t) return null;

  // Unicode fraction alone: "½ Real..."
  const fracRe = new RegExp('^([' + FRAC_CHARS + '])');
  const fm = t.match(fracRe);
  if (fm && (t.length === 1 || /[\s]/.test(t[1]))) {
    return FRAC_MAP[fm[1]];
  }

  // Slash fraction: "1/2 Real..."
  const slashFrac = t.match(/^(\d+)\/(\d+)(?:\s|$)/);
  if (slashFrac) {
    return parseInt(slashFrac[1]) / parseInt(slashFrac[2]);
  }

  // Number with optional fraction
  const numRe = new RegExp('^(\\d[\\d.,]*?)([' + FRAC_CHARS + '])?(?:\\s+(\\d+)/(\\d+))?(?:\\s|[A-Za-z]|$)');
  const m = t.match(numRe);
  if (!m) return null;

  let rawNum = m[1];
  let value;

  if (/^\d{1,3}(\.\d{3})+$/.test(rawNum)) {
    value = parseFloat(rawNum.replace(/\./g, ''));
  } else if (/^\d{1,3}(,\d{3})+$/.test(rawNum)) {
    value = parseFloat(rawNum.replace(/,/g, ''));
  } else {
    value = parseFloat(rawNum.replace(',', '.'));
  }

  if (isNaN(value)) return null;
  if (m[2]) value += FRAC_MAP[m[2]] || 0;
  if (m[3] && m[4]) value += parseInt(m[3]) / parseInt(m[4]);

  return value;
}

function isGarbage(banknote) {
  const { title, country } = banknote;
  // Null/empty title
  if (!title || !title.trim()) return true;
  // Country is "Continente:" (section header)
  if (!country || country.startsWith('Continente')) return true;
  // Section headers (contain PCOUNTRY - \n)
  if (/\sP[A-Z].*\s*-\s*\n/.test(title)) return true;
  // test entries
  if (/test/i.test(title)) return true;
  // No denomination parseable
  const denom = parseDenomination(title, country);
  return denom === null || denom <= 0;
}

async function main() {
  const files = [
    'scraper/data/billetes_a.json',
    'scraper/data/billetes_b.json',
    'scraper/data/billetes_c.json',
    'scraper/data/billetes_d.json',
    'scraper/data/billetes_e.json',
    'scraper/data/billetes_f.json',
    'scraper/data/billetes_s.json',
  ];

  let totalRemoved = 0;
  let totalKept = 0;
  const removedUrls = [];

  // === 1. LIMPIAR JSONs ===
  console.log('=== LIMPIEZA DE REGISTROS BASURA ===\n');

  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.log(`Archivo no encontrado: ${file}, saltando...`);
      continue;
    }

    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const banknotes = data.banknotes || [];
    const before = banknotes.length;

    const garbage = banknotes.filter(isGarbage);
    const clean = banknotes.filter(b => !isGarbage(b));

    console.log(`${file}:`);
    console.log(`  Antes: ${before} billetes`);
    console.log(`  Basura encontrada: ${garbage.length}`);

    if (garbage.length > 0) {
      garbage.forEach(g => {
        console.log(`    ✗ ${JSON.stringify(g.title)} (${g.country})`);
        if (g.url) removedUrls.push(g.url);
      });
    }

    // Actualizar JSON
    data.banknotes = clean;
    data.metadata.total_banknotes = clean.length;
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');

    totalRemoved += garbage.length;
    totalKept += clean.length;
    console.log(`  Después: ${clean.length} billetes ✓\n`);
  }

  console.log(`\nJSON TOTAL: ${totalRemoved} eliminados, ${totalKept} conservados\n`);

  // === 2. LIMPIAR BASE DE DATOS ===
  if (removedUrls.length > 0) {
    console.log('=== LIMPIEZA DE BASE DE DATOS ===\n');

    // Buscar en la DB los registros cuyo título coincida con los basura
    // Primero obtengo todos los modelos de la DB
    const allModelos = await prisma.billetes_modelo.findMany({
      select: { id: true, pais: true, denominacion: true, unidad_monetaria: true, codigo_catalogo: true }
    });

    console.log(`Total modelos en DB: ${allModelos.length}`);

    // Identificar los que son basura: sin denominación y con datos sospechosos
    // Usamos los URLs de las entradas eliminadas del JSON para buscar coincidencias
    // Los modelos en DB se importaron con pais + codigo_catalogo

    // Recopilar todos los registros basura por país + pick_number
    const garbageKeys = new Set();
    for (const file of files) {
      if (!fs.existsSync(file)) continue;
      // Ya los limpiamos, así que necesitamos los datos originales
      // En su lugar, usamos la lista que ya recopilamos
    }

    // Buscar por título: los basura no tendrán denominación numérica
    const dbGarbage = allModelos.filter(m => {
      // Si tiene pais null o vacío
      if (!m.pais || m.pais.startsWith('Continente')) return true;
      // Si el código catálogo parece sección (contiene " - ")
      if (m.codigo_catalogo && /^P[A-Z].*-/.test(m.codigo_catalogo)) return true;
      // Si la denominación es null Y la unidad monetaria es sospechosa
      if (m.denominacion === null && (!m.unidad_monetaria || m.unidad_monetaria === '')) return true;
      return false;
    });

    if (dbGarbage.length > 0) {
      console.log(`\nRegistros basura en DB: ${dbGarbage.length}`);
      dbGarbage.forEach(g => {
        console.log(`  ✗ id=${g.id} | pais=${g.pais} | catalogo=${g.codigo_catalogo} | denom=${g.denominacion} | unidad=${g.unidad_monetaria}`);
      });

      // Eliminar (CASCADE borrará imágenes asociadas)
      const idsToDelete = dbGarbage.map(g => g.id);
      const deleted = await prisma.billetes_modelo.deleteMany({
        where: { id: { in: idsToDelete } }
      });
      console.log(`\n✓ Eliminados ${deleted.count} registros de billetes_modelo (e imágenes asociadas por CASCADE)`);
    } else {
      console.log('No se encontraron registros basura en la base de datos.');
    }
  }

  await prisma.$disconnect();
  console.log('\n=== LIMPIEZA COMPLETADA ===');
}

main().catch(e => {
  console.error('Error:', e);
  prisma.$disconnect();
  process.exit(1);
});
