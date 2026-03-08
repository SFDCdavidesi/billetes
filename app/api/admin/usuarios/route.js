import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user || user.perfil !== 'administrador') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const nombre = searchParams.get('nombre') || '';
    const email = searchParams.get('email') || '';
    const perfil_id = searchParams.get('perfil_id') || '';
    const activo = searchParams.get('activo');
    const email_validado = searchParams.get('email_validado');

    const where = {};
    if (nombre) where.nombre = { contains: nombre, mode: 'insensitive' };
    if (email) where.email = { contains: email, mode: 'insensitive' };
    if (perfil_id) where.perfil_id = parseInt(perfil_id);
    if (activo === 'true') where.activo = true;
    if (activo === 'false') where.activo = false;
    if (email_validado === 'true') where.email_validado = true;
    if (email_validado === 'false') where.email_validado = false;

    const usuarios = await prisma.usuarios.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        email: true,
        activo: true,
        email_validado: true,
        fecha_creacion: true,
        perfil_id: true,
        perfiles: { select: { id: true, nombre: true } },
      },
      orderBy: { fecha_creacion: 'desc' },
    });

    const perfiles = await prisma.perfiles.findMany({
      where: { visible: true },
      select: { id: true, nombre: true },
      orderBy: { nombre: 'asc' },
    });

    return NextResponse.json({ usuarios, perfiles });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PUT(request) {
  const user = getUserFromRequest(request);
  if (!user || user.perfil !== 'administrador') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, nombre, email, activo, email_validado, perfil_id } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const data = {};
    if (nombre !== undefined) data.nombre = nombre.trim();
    if (email !== undefined) data.email = email.trim().toLowerCase();
    if (activo !== undefined) data.activo = Boolean(activo);
    if (email_validado !== undefined) data.email_validado = Boolean(email_validado);
    if (perfil_id !== undefined) data.perfil_id = parseInt(perfil_id);
    data.fecha_modificacion = new Date();

    // Check email uniqueness if changing email
    if (data.email) {
      const existing = await prisma.usuarios.findFirst({
        where: { email: data.email, id: { not: id } },
      });
      if (existing) {
        return NextResponse.json({ error: 'Email ya en uso' }, { status: 409 });
      }
    }

    const updated = await prisma.usuarios.update({
      where: { id },
      data,
      select: {
        id: true,
        nombre: true,
        email: true,
        activo: true,
        email_validado: true,
        fecha_creacion: true,
        perfil_id: true,
        perfiles: { select: { id: true, nombre: true } },
      },
    });

    return NextResponse.json({ usuario: updated });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
