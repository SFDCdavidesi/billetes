import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
const bcrypt = require('bcryptjs');

export async function POST(request) {
  try {
    const body = await request.json();
    const { nombre, email, password } = body;

    if (!nombre || !email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.toLowerCase().trim();
    const trimmedNombre = nombre.trim();

    if (trimmedNombre.length < 2 || trimmedNombre.length > 100) {
      return NextResponse.json(
        { error: 'El nombre debe tener entre 2 y 100 caracteres' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.usuarios.findUnique({
      where: { email: trimmedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con ese correo electrónico' },
        { status: 409 }
      );
    }

    // Hash password & generate verification token
    const password_hash = await bcrypt.hash(password, 12);
    const token_verificacion = crypto.randomBytes(32).toString('hex');

    // Create user (inactive, email not validated)
    await prisma.usuarios.create({
      data: {
        nombre: trimmedNombre,
        email: trimmedEmail,
        password_hash,
        activo: false,
        email_validado: false,
        token_verificacion,
        perfil_id: 1,
      },
    });

    // Send verification email
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || smtpUser;
    const appUrl = process.env.APP_URL || 'http://localhost:4000';

    if (smtpHost && smtpUser && smtpPass) {
      const verifyUrl = `${appUrl}/verificar-email?token=${token_verificacion}`;

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from: smtpFrom,
        to: trimmedEmail,
        subject: 'BilletesAntiguos - Verifica tu correo electrónico',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #b8860b;">BilletesAntiguos</h2>
            <p>Hola <strong>${trimmedNombre}</strong>,</p>
            <p>¡Gracias por registrarte en BilletesAntiguos!</p>
            <p>Para completar tu registro, por favor verifica tu correo electrónico haciendo clic en el siguiente botón:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" style="display: inline-block; padding: 14px 28px; background-color: #b8860b; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Verificar correo electrónico
              </a>
            </div>
            <p style="color: #666; font-size: 13px;">Una vez verificado tu correo, un administrador revisará y activará tu cuenta. Recibirás acceso completo cuando tu cuenta sea activada.</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
              Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
              <a href="${verifyUrl}" style="color: #b8860b; word-break: break-all;">${verifyUrl}</a>
            </p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
