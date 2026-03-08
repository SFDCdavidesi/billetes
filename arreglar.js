const fs = require('fs');
const { execSync } = require('child_process');

console.log("🛠️ Iniciando reparación automática de Prisma...");

// 1. Arreglar importar.js para que use el estándar
try {
    let importarContent = fs.readFileSync('importar.js', 'utf8');
    importarContent = importarContent.replace(
        /const\s+\{\s*PrismaClient\s*\}\s*=\s*require\(['"].*['"]\);/,
        "const { PrismaClient } = require('@prisma/client');"
    );
    fs.writeFileSync('importar.js', importarContent);
    console.log("✅ Archivo 'importar.js' corregido.");
} catch (e) {
    console.log("⚠️ No se pudo modificar importar.js:", e.message);
}

// 2. Desactivar el archivo rebelde prisma.config.ts
if (fs.existsSync('prisma.config.ts')) {
    fs.renameSync('prisma.config.ts', 'prisma.config.ts.bak');
    console.log("✅ Archivo 'prisma.config.ts' desactivado (renombrado a .bak).");
} else {
    console.log("✅ No se encontró 'prisma.config.ts' (todo en orden).");
}

// 3. Limpiar schema.prisma de rutas extrañas
try {
    let schemaContent = fs.readFileSync('prisma/schema.prisma', 'utf8');
    // Busca cualquier línea que diga output = "..." y la elimina
    schemaContent = schemaContent.replace(/^\s*output\s*=\s*".*".*$/gm, "");
    fs.writeFileSync('prisma/schema.prisma', schemaContent);
    console.log("✅ Archivo 'schema.prisma' limpiado correctamente.");
} catch (e) {
    console.log("⚠️ No se pudo modificar schema.prisma:", e.message);
}

// 4. Ejecutar los comandos finales
try {
    console.log("\n⏳ Generando Prisma Client de nuevo (esto puede tardar unos segundos)...");
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    console.log("\n🚀 ¡Todo listo! Lanzando la importación de billetes...");
    execSync('node importar.js', { stdio: 'inherit' });
} catch (e) {
    console.error("\n❌ Hubo un error ejecutando los comandos de consola.");
}