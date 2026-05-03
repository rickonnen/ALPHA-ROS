import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const existing = request.cookies.get('session_id')?.value;
  const sessionId = existing ?? crypto.randomUUID();

  const response = NextResponse.json({ session_id: sessionId }, { status: 200 });

  if (!existing) {
    response.cookies.set('session_id', sessionId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });
  }

  return response;
}

