import { cookies } from 'next/headers';

const COOKIE_NAME = 'lc_session';

export async function getSessionUserId(): Promise<number | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
