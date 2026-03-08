import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

function generatePassword(length = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += chars[bytes[i] % chars.length];
  }
  return password;
}

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user || user.perfil !== 'administrador') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId requerido' }, { status: 400 });
    }

    const target = await prisma.usuarios.findUnique({
      where: { id: userId },
      select: { id: true, nombre: true, email: true },
    });

    if (!target) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const newPassword = generatePassword();
    const password_hash = await bcrypt.hash(newPassword, 10);

    await prisma.usuarios.update({
      where: { id: userId },
      data: { password_hash, fecha_modificacion: new Date() },
    });

    // Send email with new password
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || smtpUser;

    if (!smtpHost || !smtpUser || !smtpPass) {
      // Password was reset but email could not be sent
      return NextResponse.json({
        success: true,
        emailSent: false,
        password: newPassword,
        message: 'Contraseña regenerada. SMTP no configurado, no se pudo enviar email.',
      });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: smtpFrom,
      to: target.email,
      subject: 'BilletesAntiguos - Nueva contraseña',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #b8860b;">BilletesAntiguos</h2>
          <p>Hola <strong>${target.nombre}</strong>,</p>
          <p>Un administrador ha regenerado tu contraseña. Tu nueva contraseña es:</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <code style="font-size: 18px; letter-spacing: 2px; font-weight: bold;">${newPassword}</code>
          </div>
          <p>Te recomendamos cambiarla después de iniciar sesión.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">Este es un correo automático, por favor no respondas.</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      emailSent: true,
      message: 'Contraseña regenerada y enviada por email.',
    });
  } catch (error) {
    console.error('Error al regenerar contraseña:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
