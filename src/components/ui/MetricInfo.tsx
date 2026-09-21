'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Info, X } from 'lucide-react';

export const metricHelp: Record<string, string> = {
  'P&L': 'Profit and loss is the total money made or lost across your recorded trades. Positive means a profit; negative means a loss. This uses your entered P&L and does not add fees or open positions automatically.',
  'Win rate': 'The percentage of recorded trades marked as wins. For example, 6 wins out of 10 trades gives a 60% win rate. Breakeven trades count in the total. A high win rate alone does not guarantee a profit.',
  'Expectancy': 'Your average profit or loss per trade: total P&L divided by the number of trades. An expectancy of +$20 means your recorded trades earned $20 on average. It describes the past, not a guaranteed future result.',
  'Profit factor': 'Total winning dollars divided by total losing dollars. A value of 1.5 means $1.50 earned for every $1 lost. Above 1 means gross profits exceed losses. Infinity means there are profits but no losses recorded yet.',
  'Average R:R': 'Your planned reward compared with your planned risk, using entry, stop loss and take profit. A 2:1 setup targets $2 for each $1 at risk. This is the average planned ratio, not your realized return. Trades without valid levels are excluded.',
  'Max drawdown': 'The largest fall from a previous high in your cumulative end-of-day P&L. If the curve reaches +$1,000 and later falls to +$700, the drawdown is $300. We include losses from the initial zero baseline, but cannot measure intraday or open-position drawdowns.',
  'Sharpe ratio': 'A way to compare returns with how much they fluctuate. With the same average return, steadier returns produce a higher Sharpe ratio. Here it is an estimate: average recorded-day return divided by sample standard deviation, using a 0% risk-free rate. It needs a starting balance and at least two days with varying returns. It is not annualized and excludes days without recorded trades, open positions, deposits and withdrawals. A small sample can be misleading.',
  'Risk consistency': 'Shows how similar your realized losses are and how often you record a valid stop loss. These are clues about discipline, not a complete measure of risk. Planned cash risk is not recorded yet, so we cannot calculate consistency of capital at risk.',
  'Loss-size variation': 'The spread of losing-trade dollar amounts divided by their average, expressed as a percentage. Lower values mean more uniform losses; 0% means all recorded losses are the same size. It needs at least two losing trades. It does not measure your planned risk or whether your risk is appropriate.',
  'Stop-loss coverage': 'The percentage of trades with a valid stop price: below entry for a buy, above entry for a sell. Coverage measures what was recorded, not whether that stop was actually followed.',
  'Equity curve': 'A running total of realized trade P&L, grouped by day and starting at zero. The initial point is a reference baseline. This is not your account balance and excludes deposits, withdrawals and unrealized gains or losses.',
  'Outcomes': 'W means winning trades, L means losing trades, and BE means breakeven trades. These counts use the result selected when a trade was recorded.',
  'Longest streaks': 'The longest runs of winning and losing trades, ordered by trade date. A breakeven breaks the run. Without execution timestamps, same-day ordering is approximate.',
  'Top pair': 'The pair with the highest total recorded P&L. Compare the trade count too: one large win is not strong evidence of a repeatable edge.',
  'Top session': 'The tagged session with the highest total recorded P&L. Trades without session tags are excluded from this highlight.',
  'Best trade': 'The highest P&L among your recorded trades. If every trade lost money, this is the smallest loss.',
  'Worst trade': 'The lowest P&L among your recorded trades. If every trade made money, this is the smallest profit.',
};

export default function MetricInfo({ term }: { term: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [open, setOpen] = useState(false);
  useEffect(() => { if (open) dialog.current?.showModal(); }, [open]);
  if (!metricHelp[term]) return null;
  return <>
    <button type="button" aria-label={`About ${term}`} aria-haspopup="dialog" onClick={() => setOpen(true)} className="inline-flex shrink-0 items-center justify-center rounded-full w-6 h-6 text-slate-400 hover:text-violet-600 hover:bg-violet-50 focus-visible:outline-2 focus-visible:outline-violet-500"><Info size={14} /></button>
    {open && createPortal(<dialog onClose={() => setOpen(false)} ref={dialog} aria-labelledby={id} onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }} className="metric-dialog rounded-2xl p-0 border border-slate-200 shadow-2xl bg-white text-slate-900 w-[min(440px,calc(100vw-32px))]">
      <div className="p-6"><div className="flex justify-between items-center gap-4"><h2 id={id} className="text-lg font-semibold">{term}</h2><button type="button" aria-label="Close explanation" onClick={() => dialog.current?.close()} className="p-2 rounded-lg hover:bg-slate-100"><X size={18} /></button></div><p className="mt-4 text-sm leading-7 text-slate-600 font-normal">{metricHelp[term]}</p><button type="button" onClick={() => dialog.current?.close()} className="mt-5 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium">Got it</button></div>
    </dialog>, document.body)}
  </>;
}
