'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Save, Upload, X, AlertTriangle } from 'lucide-react';

export default function AddTradePage() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    pair: '',
    direction: 'Buy',
    entry_price: '',
    stop_loss: '',
    take_profit: '',
    lot_size: '',
    result: 'Win',
    session: '',
    strategy: '',
    emotion: '',
    pnl: '',
    notes: '',
    trade_date: new Date().toISOString().split('T')[0],
  });

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const removeScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Your user session is missing. Please log in again.');
      return;
    }

    setError('');
    setWarning('');
    setLoading(true);

    try {
      const supabase = createClient();
      let screenshot_url: string | null = null;

      // Upload screenshot if provided (isolated upload failure)
      if (screenshotFile) {
        try {
          const ext = screenshotFile.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}.${ext}`;
          
          const { error: uploadError } = await supabase.storage
            .from('trade-screenshots')
            .upload(fileName, screenshotFile);

          if (uploadError) {
            console.warn('Screenshot upload warning:', uploadError);
            setWarning('Screenshot upload failed (please check if "trade-screenshots" bucket is public and has correct RLS policies). Trade details saved without screenshot.');
          } else {
            const { data: urlData } = supabase.storage
              .from('trade-screenshots')
              .getPublicUrl(fileName);
            
            screenshot_url = urlData.publicUrl;
          }
        } catch (uploadException: any) {
          console.warn('Screenshot upload exception:', uploadException);
          setWarning('Screenshot upload failed due to network or config. Trade details saved without screenshot.');
        }
      }

      // Safe parse helper
      const parseNumeric = (val: string) => {
        if (!val || val.trim() === '') return null;
        const num = parseFloat(val);
        return isNaN(num) ? null : num;
      };

      // Insert trade details into trades table
      const { error: insertError } = await supabase.from('trades').insert({
        user_id: user.id,
        pair: form.pair.toUpperCase(),
        direction: form.direction,
        entry_price: parseFloat(form.entry_price),
        stop_loss: parseNumeric(form.stop_loss),
        take_profit: parseNumeric(form.take_profit),
        lot_size: parseNumeric(form.lot_size),
        result: form.result,
        session: form.session || null,
        strategy: form.strategy || null,
        emotion: form.emotion || null,
        pnl: parseNumeric(form.pnl) || 0,
        screenshot_url,
        notes: form.notes || null,
        trade_date: form.trade_date,
      });

      if (insertError) {
        throw insertError;
      }

      // If we had a screenshot warning, wait 2 seconds or alert user, otherwise redirect immediately
      if (screenshotFile && !screenshot_url) {
        // If there was a warning about the screenshot, keep the warning on screen or delay redirect
        setTimeout(() => {
          router.push('/journal');
          router.refresh();
        }, 1500);
      } else {
        router.push('/journal');
        router.refresh();
      }
    } catch (err: any) {
      console.error('Failed to save trade:', err);
      setError(err?.message || 'Database error: Failed to save trade details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Add Trade</h1>

      <Card className="shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs px-4 py-3 rounded-xl border border-red-100 dark:border-red-900/50">
              {error}
            </div>
          )}

          {warning && (
            <div className="bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-xs px-4 py-3 rounded-xl border border-amber-100 dark:border-amber-900/50 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{warning}</span>
            </div>
          )}

          {/* Row 1: Pair, Direction, Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              id="pair"
              label="Pair *"
              placeholder="e.g. EUR/USD or BTC/USD"
              value={form.pair}
              onChange={e => update('pair', e.target.value)}
              required
            />
            <Select
              id="direction"
              label="Direction *"
              value={form.direction}
              onChange={e => update('direction', e.target.value)}
              options={[
                { value: 'Buy', label: 'Buy (Long)' },
                { value: 'Sell', label: 'Sell (Short)' },
              ]}
            />
            <Input
              id="trade_date"
              label="Trade Date *"
              type="date"
              value={form.trade_date}
              onChange={e => update('trade_date', e.target.value)}
              required
            />
          </div>

          {/* Row 2: Prices */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              id="entry_price"
              label="Entry Price *"
              type="number"
              step="any"
              placeholder="0.00"
              value={form.entry_price}
              onChange={e => update('entry_price', e.target.value)}
              required
            />
            <Input
              id="stop_loss"
              label="Stop Loss"
              type="number"
              step="any"
              placeholder="0.00"
              value={form.stop_loss}
              onChange={e => update('stop_loss', e.target.value)}
            />
            <Input
              id="take_profit"
              label="Take Profit"
              type="number"
              step="any"
              placeholder="0.00"
              value={form.take_profit}
              onChange={e => update('take_profit', e.target.value)}
            />
          </div>

          {/* Row 3: Lot size, Result, PnL */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              id="lot_size"
              label="Lot Size"
              type="number"
              step="any"
              placeholder="0.01"
              value={form.lot_size}
              onChange={e => update('lot_size', e.target.value)}
            />
            <Select
              id="result"
              label="Result *"
              value={form.result}
              onChange={e => update('result', e.target.value)}
              options={[
                { value: 'Win', label: 'Win' },
                { value: 'Loss', label: 'Loss' },
                { value: 'Breakeven', label: 'Breakeven' },
              ]}
            />
            <Input
              id="pnl"
              label="PnL ($)"
              type="number"
              step="any"
              placeholder="0.00"
              value={form.pnl}
              onChange={e => update('pnl', e.target.value)}
            />
          </div>

          {/* Row 4: Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              id="strategy"
              label="Strategy Tag"
              placeholder="e.g. Breakout, Support"
              value={form.strategy}
              onChange={e => update('strategy', e.target.value)}
            />
            <Select
              id="session"
              label="Session"
              value={form.session}
              onChange={e => update('session', e.target.value)}
              placeholder="Select session"
              options={[
                { value: 'London', label: 'London' },
                { value: 'NY', label: 'New York' },
                { value: 'Asia', label: 'Asia' },
              ]}
            />
            <Select
              id="emotion"
              label="Emotion"
              value={form.emotion}
              onChange={e => update('emotion', e.target.value)}
              placeholder="Select emotion"
              options={[
                { value: 'Calm', label: 'Calm' },
                { value: 'Fear', label: 'Fear' },
                { value: 'FOMO', label: 'FOMO' },
                { value: 'Revenge', label: 'Revenge' },
              ]}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label htmlFor="notes" className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide">
              Notes
            </label>
            <textarea
              id="notes"
              rows={4}
              placeholder="Record notes on your psychological mindset, market context, rules followed, and setup execution."
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none"
              value={form.notes}
              onChange={e => update('notes', e.target.value)}
            />
          </div>

          {/* Screenshot Upload */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide">
              Screenshot
            </label>
            {screenshotPreview ? (
              <div className="relative inline-block group">
                <img
                  src={screenshotPreview}
                  alt="Trade screenshot preview"
                  className="max-h-48 rounded-xl border border-zinc-200 dark:border-zinc-800 object-cover"
                />
                <button
                  type="button"
                  onClick={removeScreenshot}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 cursor-pointer shadow-sm"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 h-32 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/10 transition-all">
                <Upload className="w-5 h-5 text-zinc-400" />
                <span className="text-sm text-zinc-400">Click to upload chart screenshot</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleScreenshot} />
              </label>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              <Save className="w-4 h-4" /> Save Trade
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
