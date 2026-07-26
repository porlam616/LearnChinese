import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { SESSION_COOKIE_NAME } from '@/lib/session';

export async function POST(req: NextRequest) {
  const { pin } = await req.json();

  const { data: user, error } = await supabase
    .from('chinese_users')
    .select('id, name')
    .eq('pin', pin)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!user) {
    return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, name: user.name });
  res.cookies.set(SESSION_COOKIE_NAME, String(user.id), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
