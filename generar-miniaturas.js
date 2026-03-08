/**
 * generar-miniaturas.js
 * 
 * Lee todos los billetes_*.json del scraper, descarga la primera imagen
 * (portada) de cada billete y genera una miniatura de 256px de ancho en WebP.
 * 
 * Uso:
 *   node generar-miniaturas.js                  # procesar todos los JSON
 *   node generar-miniaturas.js billetes_d.json   # solo un archivo
 *   node generar-miniaturas.js --workers 20      # 20 descargas paralelas (defecto: 10)
 *   node generar-miniaturas.js --force           # regenerar incluso si ya existe
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// ─── Config ─────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, 'scraper', 'data');
const THUMB_DIR = path.join(__dirname, 'public', 'images', 'thumbnails');
const THUMB_WIDTH = 256;
const THUMB_QUALITY = 75;
const DEFAULT_WORKERS = 10;
const REQUEST_TIMEOUT = 15000; // 15s

// ─── Parse args ─────────────────────────────────────────
const args = process.argv.slice(2);
let specificFile = null;
let workers = DEFAULT_WORKERS;
let force = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--workers' && args[i + 1]) {
    workers = parseInt(args[i + 1], 10) || DEFAULT_WORKERS;
    i++;
  } else if (args[i] === '--force') {
    force = true;
  } else if (args[i].endsWith('.json')) {
    specificFile = args[i];
  }
}

// ─── Helpers ────────────────────────────────────────────
function getThumbFilename(imageUrl) {
  // https://banknotescollection.com/images/billetes/xyz_1.jpg → xyz_1.webp
  const basename = path.basename(new URL(imageUrl).pathname);
  return basename.replace(/\.[^.]+$/, '.webp');
}

async function downloadAndResize(imageUrl, outputPath) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(imageUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BilletesBot/1.0)' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const buffer = Buffer.from(await res.arrayBuffer());
    await sharp(buffer)
      .resize({ width: THUMB_WIDTH })
      .webp({ quality: THUMB_QUALITY })
      .toFile(outputPath);

    return true;
  } catch (err) {
    // Clean up partial file
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Worker pool ────────────────────────────────────────
async function processQueue(tasks, concurrency, onProgress) {
  let idx = 0;
  let completed = 0;
  let errors = 0;

  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      const task = tasks[i];
      try {
        await task();
      } catch {
        errors++;
      }
      completed++;
      if (completed % 50 === 0 || completed === tasks.length) {
        onProgress(completed, tasks.length, errors);
      }
    }
  }

  const workerPromises = [];
  for (let i = 0; i < Math.min(concurrency, tasks.length); i++) {
    workerPromises.push(worker());
  }
  await Promise.all(workerPromises);
  return { completed, errors };
}

// ─── Main ───────────────────────────────────────────────
async function main() {
  // Ensure output dir
  fs.mkdirSync(THUMB_DIR, { recursive: true });

  // Gather JSON files
  let jsonFiles;
  if (specificFile) {
    const fullPath = path.join(DATA_DIR, specificFile);
    if (!fs.existsSync(fullPath)) {
      console.error(`Archivo no encontrado: ${fullPath}`);
      process.exit(1);
    }
    jsonFiles = [specificFile];
  } else {
    jsonFiles = fs.readdirSync(DATA_DIR)
      .filter(f => f.startsWith('billetes_') && f.endsWith('.json'))
      .sort();
  }

  console.log('════════════════════════════════════════════════════');
  console.log('GENERADOR DE MINIATURAS');
  console.log(`Archivos JSON: ${jsonFiles.length}`);
  console.log(`Directorio de salida: ${THUMB_DIR}`);
  console.log(`Ancho: ${THUMB_WIDTH}px | Formato: WebP | Workers: ${workers}`);
  console.log(`Forzar regeneración: ${force ? 'Sí' : 'No'}`);
  console.log('════════════════════════════════════════════════════\n');

  // Collect all tasks: { imageUrl, thumbPath }
  const tasks = [];
  let skipped = 0;

  for (const file of jsonFiles) {
    const raw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
    const banknotes = raw.banknotes || [];

    for (const bn of banknotes) {
      if (!bn.images || bn.images.length === 0) continue;

      const imageUrl = bn.images[0]; // primera imagen = portada
      const thumbName = getThumbFilename(imageUrl);
      const thumbPath = path.join(THUMB_DIR, thumbName);

      if (!force && fs.existsSync(thumbPath)) {
        skipped++;
        continue;
      }

      tasks.push(() => downloadAndResize(imageUrl, thumbPath));
    }
  }

  console.log(`Miniaturas a generar: ${tasks.length}`);
  console.log(`Ya existentes (omitidas): ${skipped}\n`);

  if (tasks.length === 0) {
    console.log('✓ No hay nada que hacer.');
    return;
  }

  const startTime = Date.now();

  const { completed, errors } = await processQueue(tasks, workers, (done, total, errs) => {
    const pct = ((done / total) * 100).toFixed(1);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    process.stdout.write(`\r  Progreso: ${done}/${total} (${pct}%) | Errores: ${errs} | ${elapsed}s`);
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n');
  console.log('════════════════════════════════════════════════════');
  console.log('RESUMEN');
  console.log(`  Procesadas: ${completed}`);
  console.log(`  Errores:    ${errors}`);
  console.log(`  Omitidas:   ${skipped}`);
  console.log(`  Tiempo:     ${elapsed}s`);
  console.log('════════════════════════════════════════════════════');
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
