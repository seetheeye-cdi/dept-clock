import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const CACHE_CONTROL_HEADER = 's-maxage=5, stale-while-revalidate=30';

const DATABASE_QUERY = {
  table: 'debt_state',
  columns: 'total_debt, per_second_rate, last_updated_at, source_name, population',
} as const;

const FALLBACK_POPULATION = 50_000_000;

function getEnv(key: string) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
}

export async function GET() {
  try {
    const url =
      process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

    if (!url) {
      throw new Error('Missing environment variable: SUPABASE_URL');
    }

    const supabase = createClient(url, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase
      .from(DATABASE_QUERY.table)
      .select(DATABASE_QUERY.columns)
      .order('last_updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      throw error ?? new Error('Debt state not found');
    }

    const payload = {
      baseTotal: Number(data.total_debt ?? 0),
      perSecondRate: Number(data.per_second_rate ?? 0),
      lastUpdatedAt: data.last_updated_at,
      sourceName: data.source_name ?? '',
      population: Number(data.population ?? FALLBACK_POPULATION),
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': CACHE_CONTROL_HEADER,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown server error';

    return new Response(
      JSON.stringify({ message: 'Failed to load debt state', detail: message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      },
    );
  }
}
