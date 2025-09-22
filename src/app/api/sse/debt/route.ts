import { createClient, type RealtimeChannel } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const CHANNEL_NAME = 'debt_state_updates';
const KEEPALIVE_INTERVAL_MS = 15_000;
const RETRY_INTERVAL_MS = 5_000;

function requiredEnv(key: string) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
}

function toNumber(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function buildRebasePayload(row: Record<string, unknown>) {
  return {
    baseTotal: toNumber(row.total_debt) ?? 0,
    perSecondRate: toNumber(row.per_second_rate) ?? 0,
    lastUpdatedAt:
      typeof row.last_updated_at === 'string'
        ? row.last_updated_at
        : new Date().toISOString(),
    population: toNumber(row.population) ?? 50_000_000,
    sourceName: typeof row.source_name === 'string' ? row.source_name : '',
  };
}

export async function GET() {
  try {
    const supabaseUrl =
      process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = requiredEnv('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl) {
      throw new Error('Missing environment variable: SUPABASE_URL');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const textEncoder = new TextEncoder();
    let channel: RealtimeChannel | null = null;
    let keepaliveTimer: NodeJS.Timeout | null = null;
    let closed = false;

    const stream = new ReadableStream({
      start(controller) {
        const send = (payload: string) => {
          controller.enqueue(textEncoder.encode(payload));
        };

        const sendEvent = (event: string, data: unknown) => {
          send(`event: ${event}\n`);
          send(`data: ${JSON.stringify(data)}\n\n`);
        };

        const sendKeepalive = () => {
          send(`:keepalive\n\n`);
        };

        send(`retry: ${RETRY_INTERVAL_MS}\n\n`);

        channel = supabase
          .channel(CHANNEL_NAME)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'debt_state',
            },
            (payload) => {
              const newRow = (payload.new ?? undefined) as
                | Record<string, unknown>
                | undefined;
              const oldRow = (payload.old ?? undefined) as
                | Record<string, unknown>
                | undefined;
              const currentRow = (newRow ?? oldRow ?? {}) as Record<
                string,
                unknown
              >;
              const previousRow = (oldRow ?? newRow ?? {}) as Record<
                string,
                unknown
              >;

              const rebasePayload = buildRebasePayload(currentRow);
              const previousRate = toNumber(previousRow.per_second_rate);
              const currentRate = rebasePayload.perSecondRate;

              if (
                previousRate === undefined ||
                previousRate !== currentRate
              ) {
                sendEvent('rate_change', {
                  perSecondRate: currentRate,
                  lastUpdatedAt: rebasePayload.lastUpdatedAt,
                });
              }

              sendEvent('rebase', rebasePayload);
            },
          )
          .subscribe((status) => {
            if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              controller.error(new Error('Supabase channel error'));
            }
          });

        keepaliveTimer = setInterval(sendKeepalive, KEEPALIVE_INTERVAL_MS);
      },
      cancel() {
        if (closed) {
          return;
        }

        closed = true;

        if (keepaliveTimer) {
          clearInterval(keepaliveTimer);
        }

        if (channel) {
          supabase.removeChannel(channel);
        }

        supabase.realtime.disconnect();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return new Response(
      JSON.stringify({ message: 'Failed to establish SSE stream', detail: message }),
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
