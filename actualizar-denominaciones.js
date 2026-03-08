const fs = require('fs');
const path = require('path');
const { prisma } = require('./lib/prisma');

const FRAC_MAP = { '\u00BD': 0.5, '\u00BC': 0.25, '\u00BE': 0.75, '\u2153': 1/3, '\u2154': 2/3, '\u2155': 0.2, '\u215B': 0.125, '\u215C': 0.375, '\u215D': 0.625, '\u215E': 0.875 };
const FRAC_CHARS = Object.keys(FRAC_MAP).join('');

function parseDenomination(title, country) {
  if (!title || !country) return null;
  let t = title.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (t.startsWith(country)) t = t.slice(country.length);
  t = t.replace(/^[\s|]+/, '');
  if (!t) return null;

  const fracRe = new RegExp('^([' + FRAC_CHARS + '])');
  const fm = t.match(fracRe);
  if (fm && (t.length === 1 || /[\s]/.test(t[1]))) return FRAC_MAP[fm[1]];

  const slashFrac = t.match(/^(\d+)\/(\d+)(?:\s|$)/);
  if (slashFrac) return parseInt(slashFrac[1]) / parseInt(slashFrac[2]);

  const numRe = new RegExp('^(\\d[\\d.,]*?)([' + FRAC_CHARS + '])?(?:\\s+(\\d+)/(\\d+))?(?:\\s|[A-Za-z]|$)');
  const m = t.match(numRe);
  if (!m) return null;

  let rawNum = m[1];
  let value;
  if (/^\d{1,3}(\.\d{3})+$/.test(rawNum)) value = parseFloat(rawNum.replace(/\./g, ''));
  else if (/^\d{1,3}(,\d{3})+$/.test(rawNum)) value = parseFloat(rawNum.replace(/,/g, ''));
  else value = parseFloat(rawNum.replace(',', '.'));
  if (isNaN(value)) return null;

  if (m[2]) value += FRAC_MAP[m[2]] || 0;
  if (m[3] && m[4]) value += parseInt(m[3]) / parseInt(m[4]);
  return value;
}

async function main() {
  const dataDir = path.join(__dirname, 'scraper', 'data');
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

  console.log(`\n=== ACTUALIZACIÓN DE DENOMINACIONES ===`);
  console.log(`Archivos encontrados: ${files.length}\n`);

  // PASO 1: Actualizar los JSON
  let totalJson = 0, updatedJson = 0, failedJson = 0;
  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let changed = 0;

    for (const b of data.banknotes) {
      totalJson++;
      const denom = parseDenomination(b.title, b.country);
      if (denom !== null && denom > 0) {
        b.denomination = denom;
        changed++;
        updatedJson++;
      } else {
        failedJson++;
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`  ${file}: ${changed}/${data.banknotes.length} denominaciones actualizadas`);
  }

  console.log(`\n--- JSON: ${updatedJson} actualizados, ${failedJson} sin parsear (de ${totalJson}) ---\n`);

  // PASO 2: Actualizar la base de datos
  // Construir un mapa pick_number+pais → denominacion desde los JSON
  const denomMap = new Map();
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
    for (const b of data.banknotes) {
      if (b.denomination && b.denomination > 0) {
        denomMap.set(`${b.country}|${b.pick_number}`, b.denomination);
      }
    }
  }

  console.log(`Mapa de denominaciones: ${denomMap.size} entradas`);

  // Obtener todos los billetes de la DB con denominacion = 0
  const dbBilletes = await prisma.billetes_modelo.findMany({
    where: { denominacion: 0 },
    select: { id: true, pais: true, codigo_catalogo: true },
  });

  console.log(`Billetes en DB con denominacion=0: ${dbBilletes.length}`);

  let dbUpdated = 0, dbNotFound = 0;
  const BATCH_SIZE = 100;

  for (let i = 0; i < dbBilletes.length; i += BATCH_SIZE) {
    const batch = dbBilletes.slice(i, i + BATCH_SIZE);
    const updates = [];

    for (const b of batch) {
      const key = `${b.pais}|${b.codigo_catalogo}`;
      const denom = denomMap.get(key);
      if (denom) {
        updates.push(
          prisma.billetes_modelo.update({
            where: { id: b.id },
            data: { denominacion: denom },
          })
        );
        dbUpdated++;
      } else {
        dbNotFound++;
      }
    }

    if (updates.length > 0) {
      await Promise.all(updates);
    }

    if ((i + BATCH_SIZE) % 500 === 0 || i + BATCH_SIZE >= dbBilletes.length) {
      console.log(`  Progreso DB: ${Math.min(i + BATCH_SIZE, dbBilletes.length)}/${dbBilletes.length}`);
    }
  }

  console.log(`\n--- DB: ${dbUpdated} actualizados, ${dbNotFound} sin match (de ${dbBilletes.length}) ---`);
  console.log(`\n=== COMPLETADO ===\n`);

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
