import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { toE164, assertE164, phoneHash } from '@/lib/phone';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'edge';

const schema = z.object({
  phone: z.string().min(8).max(32),
});

function getEnv(key: string) {
  const v = process.env[key];
  if (!v) throw new Error(`Missing environment variable: ${key}`);
  return v;
}

export async function POST(req: Request) {
  try {
    const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0] || 'unknown';
    if (!rateLimit(`alerts:unsub:${ip}`, 5)) {
      return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json();
    const parsed = schema.parse(body);
    const e164 = toE164(parsed.phone);
    assertE164(e164);
    const hash = phoneHash(e164);

    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) throw new Error('Missing environment variable: SUPABASE_URL');
    const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
    const supa = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

    const { error } = await supa
      .from('kakao_subscribers')
      .update({ status: 'UNSUBSCRIBED', unsubscribed_at: new Date().toISOString() })
      .eq('phone_hash', hash);

    if (error) {
      return NextResponse.json({ message: 'unsubscribe_failed' }, { status: 400 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown_error';
    return NextResponse.json({ message }, { status: 400 });
  }
}


