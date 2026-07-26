import { NextRequest, NextResponse } from 'next/server';

// Simple PIN check, mirroring LearnFrench's auth approach.
// The PIN itself lives only in an env var (APP_PIN), never in the repo.
export async function POST(req: NextRequest) {
  const { pin } = await req.json();
  const correctPin = process.env.APP_PIN;

  if (!correctPin) {
    return NextResponse.json(
      { error: 'Server misconfigured: APP_PIN not set' },
      { status: 500 }
    );
  }

  if (pin !== correctPin) {
    return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('lc_session', 'authenticated', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
