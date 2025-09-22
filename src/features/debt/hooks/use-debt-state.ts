import { useQuery } from '@tanstack/react-query';

import type { DebtState } from '../types';

export const DEBT_STATE_QUERY_KEY = ['debt-state'] as const;
export const DEBT_STATE_CACHE_KEY = 'debt-state-cache';

function readCache(): DebtState | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const raw = window.localStorage.getItem(DEBT_STATE_CACHE_KEY);

  if (!raw) {
    return undefined;
  }

  try {
    return JSON.parse(raw) as DebtState;
  } catch {
    window.localStorage.removeItem(DEBT_STATE_CACHE_KEY);
    return undefined;
  }
}

export function persistDebtState(state: DebtState) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(DEBT_STATE_CACHE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage failures (quota/private mode)
  }
}

async function fetchDebtState(): Promise<DebtState> {
  const response = await fetch('/api/debt-state', {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch debt state');
  }

  const payload = (await response.json()) as DebtState;

  persistDebtState(payload);

  return payload;
}

export function useDebtState() {
  return useQuery<DebtState>({
    queryKey: DEBT_STATE_QUERY_KEY,
    queryFn: fetchDebtState,
    staleTime: 5_000,
    retry: 1,
    refetchInterval: 60_000,
    initialData: readCache,
  });
}
