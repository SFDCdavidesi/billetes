const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando carga de perfiles y usuarios en la nube...");

  // 1. Crear Perfiles
  const perfilesData = [
    { id: 1, nombre: 'visitante', descripcion: 'Solo ver y comprar' },
    { id: 2, nombre: 'coleccionista', descripcion: 'Gestiona sus propios billetes' },
    { id: 3, nombre: 'editor', descripcion: 'Moderador de catálogo' },
    { id: 4, nombre: 'administrador', descripcion: 'Acceso total' },
  ];

  for (const p of perfilesData) {
    await prisma.perfiles.upsert({
      where: { nombre: p.nombre },
      update: {},
      create: p,
    });
  }
  console.log("✅ Perfiles creados o verificados.");

  // 2. Crear Usuarios (Administradores y Coleccionista)
  const usuariosData = [
    { nombre: 'david', email: 'david+david@herrero.us', password: 'david1234!!', perfil_id: 4 },
    { nombre: 'luis', email: 'david+luis@herrero.us', password: 'luis1234!!', perfil_id: 4 },
    { nombre: 'pruebas', email: 'david+pruebas@herrero.us', password: 'pruebas', perfil_id: 2 },
  ];

  for (const u of usuariosData) {
    const password_hash = await bcrypt.hash(u.password, 10);
    await prisma.usuarios.upsert({
      where: { email: u.email },
      update: { password_hash },
      create: { nombre: u.nombre, email: u.email, password_hash, perfil_id: u.perfil_id, activo: true, email_validado: true },
    });
  }
  console.log("✅ Usuarios creados con contraseñas hasheadas.");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());