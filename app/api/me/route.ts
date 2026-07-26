import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSessionUserId } from '@/lib/session';

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const { data: user, error } = await supabase
    .from('chinese_users')
    .select('id, name')
    .eq('id', userId)
    .single();

  if (error || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ id: user.id, name: user.name });
}
