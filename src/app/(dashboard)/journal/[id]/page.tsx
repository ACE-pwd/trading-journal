'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';
import { isPreview, getPreviewTrades } from '@/lib/preview';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Trade, AiFeedback } from '@/lib/types';
import { analyzeTrade } from '@/lib/ai';
import { formatCurrency, calculateRRR, cn } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import AiFeedbackCard from '@/components/ai/AiFeedbackCard';
import { KpiSkeleton } from '@/components/ui/Skeleton';
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  BarChart3,
  Brain,
  Tag,
  Clock,
  Heart,
} from 'lucide-react';

export default function TradeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [trade, setTrade] = useState<Trade | null>(null);
  const [feedback, setFeedback] = useState<AiFeedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    async function fetchTrade() {
      if (isPreview) {
        setTrade(getPreviewTrades().find(t => t.id === id) ?? null);
        setFeedback(null);
        setLoading(false);
        return;
      }
      const supabase = createClient();
      try {
        const { data, error } = await supabase
          .from('trades')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (data) {
          setTrade(data as Trade);
          
          // Check for existing AI feedback
          const { data: fb } = await supabase
            .from('ai_feedback')
            .select('*')
            .eq('trade_id', id)
            .single();
            
          if (fb) setFeedback(fb as AiFeedback);
        }
      } catch (err) {
        setActionError('Unable to load this trade. Refresh and try again.');
        console.error('Failed to load trade:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTrade();
  }, [id]);

  const handleAnalyze = async () => {
    if (!trade) return;
    setActionError('');
    setAnalyzing(true);
    try {
      const result = await analyzeTrade(trade);
      if (isPreview) {
        setFeedback({ ...result, id: 'preview-feedback', trade_id: trade.id, created_at: new Date().toISOString() });
        return;
      }
      const supabase = createClient();
      const { data, error } = await supabase
        .from('ai_feedback')
        .insert({
          trade_id: trade.id,
          ...result,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) setFeedback(data as AiFeedback);
    } catch (err) {
      setActionError('Could not save feedback. Please try again.');
      console.error('AI analysis insertion failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async () => {
    if (!trade || deleting) return;
    setActionError('');
    if (isPreview) { setActionError('Deleting is disabled in local preview.'); return; }
    if (!user) { setActionError('Please sign in again before deleting.'); return; }
    setDeleting(true);
    try {
      const { data, error } = await createClient().from('trades').delete()
        .eq('id', trade.id).eq('user_id', user.id).select('id').single();
      if (error || !data) throw new Error('Trade could not be deleted. Refresh and try again.');
      router.replace('/journal');
      router.refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete trade.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <KpiSkeleton />
        <KpiSkeleton />
        <KpiSkeleton />
      </div>
    );
  }

  if (!trade) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-550 mb-4">{actionError || 'Trade record not found'}</p>
        <Button variant="outline" onClick={() => router.push('/journal')}>
          Back to Journal
        </Button>
      </div>
    );
  }

  const rrr = calculateRRR(trade);

  const DetailRow = ({
    icon: Icon,
    label,
    value,
    color,
  }: {
    icon: React.ElementType;
    label: string;
    value: string | number | null;
    color?: string;
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-zinc-50 dark:border-zinc-900/50 last:border-0">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center shrink-0">
          <Icon className="w-3.5 h-3.5 text-zinc-450 dark:text-zinc-550" />
        </div>
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{label}</span>
      </div>
      <span className={cn('text-sm font-bold', color || 'text-zinc-800 dark:text-zinc-200')}>
        {value ?? '—'}
      </span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => router.push('/journal')} className="h-9 w-9 p-0 rounded-xl">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
          {trade.pair}
        </h1>
        <span
          className={cn(
            'px-2.5 py-0.5 rounded-full text-2xs font-extrabold',
            trade.direction === 'Buy'
              ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-500'
              : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-500'
          )}
        >
          {trade.direction}
        </span>
        <span
          className={cn(
            'ml-auto px-3 py-1 rounded-xl text-xs font-extrabold border',
            trade.result === 'Win'
              ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-100/50 text-emerald-600'
              : trade.result === 'Loss'
              ? 'bg-red-50/20 dark:bg-red-950/10 border-red-100/50 text-red-600'
              : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-100 text-zinc-500'
          )}
        >
          {trade.result}
        </span>
      </div>

      <div className="flex gap-3">
        <Link href={`/journal/${trade.id}/edit`} className="text-sm font-semibold text-indigo-600 underline">Edit Trade</Link>
        <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} disabled={analyzing || deleting}>Delete Trade</Button>
      </div>
      {actionError && <p role="alert" className="text-red-600">{actionError}</p>}
      {confirmDelete && (
        <Card role="alertdialog" aria-labelledby="delete-title" aria-describedby="delete-description">
          <h2 id="delete-title" className="font-bold">Delete this {trade.pair} trade?</h2>
          <p id="delete-description" className="my-3 text-sm">This permanently removes the trade and its saved feedback. This cannot be undone.</p>
          <div className="flex gap-3">
            <Button variant="outline" disabled={deleting} onClick={() => setConfirmDelete(false)}>Keep Trade</Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete}>Confirm Delete</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trade Details Panel */}
        <Card className="shadow-sm">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 border-b border-zinc-50 dark:border-zinc-850 pb-2">
            Trade Setup Parameters
          </h3>
          <div className="flex flex-col">
            <DetailRow icon={Calendar} label="Date Logged" value={trade.trade_date} />
            <DetailRow
              icon={trade.direction === 'Buy' ? TrendingUp : TrendingDown}
              label="Direction"
              value={trade.direction}
              color={trade.direction === 'Buy' ? 'text-emerald-600' : 'text-red-600'}
            />
            <DetailRow icon={DollarSign} label="Entry Price" value={trade.entry_price} />
            <DetailRow icon={Target} label="Stop Loss" value={trade.stop_loss} />
            <DetailRow icon={Target} label="Take Profit" value={trade.take_profit} />
            <DetailRow icon={BarChart3} label="Lot Size" value={trade.lot_size} />
            <DetailRow
              icon={DollarSign}
              label="Net PnL"
              value={formatCurrency(trade.pnl)}
              color={trade.pnl >= 0 ? 'text-emerald-600' : 'text-red-650'}
            />
            <DetailRow icon={Brain} label="Risk / Reward" value={rrr > 0 ? `${rrr}:1` : '—'} />
            <DetailRow icon={Tag} label="Strategy" value={trade.strategy} />
            <DetailRow icon={Clock} label="Session" value={trade.session} />
            <DetailRow icon={Heart} label="Psychology State" value={trade.emotion} />
          </div>
        </Card>

        {/* AI Copilot Panel */}
        <AiFeedbackCard feedback={feedback} onAnalyze={handleAnalyze} loading={analyzing} />
      </div>

      {/* Notes Section */}
      {trade.notes && (
        <Card className="shadow-sm">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2 border-b border-zinc-50 dark:border-zinc-850 pb-2">
            Notes & Observations
          </h3>
          <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
            {trade.notes}
          </p>
        </Card>
      )}

      {/* Screenshot Section */}
      {trade.screenshot_url && (
        <Card className="shadow-sm">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 border-b border-zinc-50 dark:border-zinc-850 pb-2">
            Setup Chart Screenshot
          </h3>
          <div className="relative rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-850">
            <img
              src={trade.screenshot_url}
              alt="Trade chart screenshot"
              className="w-full h-auto object-contain"
            />
          </div>
        </Card>
      )}
    </div>
  );
}
