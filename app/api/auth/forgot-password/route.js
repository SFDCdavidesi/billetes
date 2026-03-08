import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }

    const usuario = await prisma.usuarios.findFirst({
      where: { email: email.trim().toLowerCase(), visible: true },
      select: { id: true, nombre: true, email: true },
    });

    // Always return success to prevent email enumeration
    if (!usuario) {
      return NextResponse.json({ success: true });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');

    await prisma.usuarios.update({
      where: { id: usuario.id },
      data: { token_verificacion: token, fecha_modificacion: new Date() },
    });

    // Send email
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || smtpUser;
    const appUrl = process.env.APP_URL || 'http://localhost:4000';

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.warn('SMTP no configurado, no se puede enviar email de recuperación');
      return NextResponse.json({ success: true });
    }

    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: smtpFrom,
      to: usuario.email,
      subject: 'BilletesAntiguos - Recuperar contraseña',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #b8860b;">BilletesAntiguos</h2>
          <p>Hola <strong>${usuario.nombre}</strong>,</p>
          <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
          <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background-color: #b8860b; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Restablecer contraseña
            </a>
          </div>
          <p style="color: #666; font-size: 13px;">Si no solicitaste este cambio, puedes ignorar este correo. El enlace expirará en 1 hora.</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
            Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
            <a href="${resetUrl}" style="color: #b8860b; word-break: break-all;">${resetUrl}</a>
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en forgot-password:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
