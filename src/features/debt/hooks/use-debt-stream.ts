import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import type { DebtState } from '../types';
import {
  DEBT_STATE_QUERY_KEY,
  persistDebtState,
} from './use-debt-state';

const SSE_ENDPOINT = '/api/sse/debt';
const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 15000;

function parseEventData<T>(event: MessageEvent<string>): T | null {
  try {
    return JSON.parse(event.data) as T;
  } catch {
    return null;
  }
}

function mergeDebtState(
  previous: DebtState | undefined,
  partial: Partial<DebtState>,
): DebtState | undefined {
  if (!previous) {
    if (partial.baseTotal != null && partial.perSecondRate != null) {
      const merged: DebtState = {
        baseTotal: partial.baseTotal,
        perSecondRate: partial.perSecondRate,
        lastUpdatedAt: partial.lastUpdatedAt ?? new Date().toISOString(),
        sourceName: partial.sourceName ?? '',
        population: partial.population ?? 0,
      };
      persistDebtState(merged);
      return merged;
    }
    return previous;
  }

  const next: DebtState = {
    baseTotal: partial.baseTotal ?? previous.baseTotal,
    perSecondRate: partial.perSecondRate ?? previous.perSecondRate,
    lastUpdatedAt: partial.lastUpdatedAt ?? previous.lastUpdatedAt,
    sourceName: partial.sourceName ?? previous.sourceName,
    population: partial.population ?? previous.population,
  };

  persistDebtState(next);

  return next;
}

export function useDebtStream(enabled: boolean) {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryDelayRef = useRef(INITIAL_RETRY_DELAY);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    const connect = () => {
      if (cancelled) {
        return;
      }

      const eventSource = new EventSource(SSE_ENDPOINT);
      eventSourceRef.current = eventSource;

      const handleRateChange = (event: MessageEvent<string>) => {
        const payload = parseEventData<Partial<DebtState>>(event);
        if (!payload || payload.perSecondRate == null) {
          return;
        }

        queryClient.setQueryData<DebtState | undefined>(
          DEBT_STATE_QUERY_KEY,
          (current) =>
            mergeDebtState(current, {
              perSecondRate: payload.perSecondRate,
              lastUpdatedAt: payload.lastUpdatedAt,
            }),
        );
      };

      const handleRebase = (event: MessageEvent<string>) => {
        const payload = parseEventData<Partial<DebtState>>(event);
        if (!payload || payload.baseTotal == null) {
          return;
        }

        queryClient.setQueryData<DebtState | undefined>(
          DEBT_STATE_QUERY_KEY,
          (current) =>
            mergeDebtState(current, {
              baseTotal: payload.baseTotal,
              perSecondRate: payload.perSecondRate,
              population: payload.population,
              lastUpdatedAt: payload.lastUpdatedAt,
              sourceName: payload.sourceName,
            }),
        );
      };

      eventSource.addEventListener('rate_change', handleRateChange as EventListener);
      eventSource.addEventListener('rebase', handleRebase as EventListener);

      eventSource.onopen = () => {
        retryDelayRef.current = INITIAL_RETRY_DELAY;
      };

      eventSource.onerror = () => {
        eventSource.close();
        eventSource.removeEventListener('rate_change', handleRateChange as EventListener);
        eventSource.removeEventListener('rebase', handleRebase as EventListener);

        if (cancelled) {
          return;
        }

        const retryDelay = retryDelayRef.current;
        retryDelayRef.current = Math.min(retryDelay * 2, MAX_RETRY_DELAY);
        retryTimerRef.current = setTimeout(connect, retryDelay);
      };
    };

    connect();

    return () => {
      cancelled = true;
      retryDelayRef.current = INITIAL_RETRY_DELAY;
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      const eventSource = eventSourceRef.current;
      if (eventSource) {
        eventSource.close();
        eventSourceRef.current = null;
      }
    };
  }, [enabled, queryClient]);
}
