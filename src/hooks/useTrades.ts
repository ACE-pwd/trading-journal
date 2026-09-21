'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Trade } from '@/lib/types';
import { isPreview, getPreviewTrades } from '@/lib/preview';

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isPreview) {
        setTrades(getPreviewTrades());
        return;
      }
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('trades')
        .select('*')
        .order('trade_date', { ascending: false });

      if (fetchError) throw fetchError;
      setTrades((data as Trade[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trades');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  return { trades, loading, error, refetch: fetchTrades };
}
