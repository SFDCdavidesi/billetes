import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      perfil: user.perfil,
    },
  });
}
