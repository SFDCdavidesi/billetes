const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
console.log('imagenes_modelo exists:', typeof p.imagenes_modelo);
console.log('Available models:', Object.keys(p).filter(k => !k.startsWith('$') && !k.startsWith('_')));
p.$disconnect();
