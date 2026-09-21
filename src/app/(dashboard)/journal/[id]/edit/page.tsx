
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getPreviewTrades, isPreview } from '@/lib/preview';
import type { Trade } from '@/lib/types';
import TradeForm from '@/components/trades/TradeForm';

export default function EditTradePage() {
  const { id } = useParams<{ id: string }>();
  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const result = isPreview
          ? { data: getPreviewTrades().find(t => t.id === id), error: null }
          : await createClient().from('trades').select('*').eq('id', id).single();
        if (result.error || !result.data) throw new Error('Trade not found or unavailable.');
        if (active) setTrade(result.data as Trade);
      } catch (err) { if (active) setError(err instanceof Error ? err.message : 'Failed to load trade.'); }
      finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [id]);
  if (loading) return <p>Loading trade…</p>;
  if (error || !trade) return <div role="alert">{error}<br /><Link href="/journal">Back to journal</Link></div>;
  return <TradeForm key={trade.id} trade={trade} />;
}
