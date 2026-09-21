import type { Trade } from './types';

// Explicit, development-only preview; production always uses normal authentication.
export const isPreview = process.env.NODE_ENV === 'development'
  && process.env.NEXT_PUBLIC_LOCAL_PREVIEW === 'true';

export function getPreviewTrades(): Trade[] {
  const pnls = [240, -100, 180, 0, -120, 320, 150, -80, 260, 190, -90, 350];
  return pnls.map((pnl, i): Trade => {
    const date = new Date();
    date.setDate(date.getDate() - (pnls.length - i));
    const trade_date = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const sell = i % 2 === 1;
    return {
      id: `preview-${i + 1}`, user_id: 'preview',
      pair: ['EUR/USD', 'GBP/USD', 'USD/JPY'][i % 3],
      direction: sell ? 'Sell' : 'Buy', entry_price: i % 3 === 2 ? 150 : 1.1,
      stop_loss: i % 3 === 2 ? (sell ? 151 : 149) : (sell ? 1.105 : 1.095),
      take_profit: i % 3 === 2 ? (sell ? 148 : 152) : (sell ? 1.09 : 1.11),
      lot_size: 0.1, result: pnl > 0 ? 'Win' : pnl < 0 ? 'Loss' : 'Breakeven',
      session: (['London', 'NY', 'Asia'] as const)[i % 3],
      strategy: i % 2 ? 'Breakout' : 'Support / resistance',
      emotion: pnl < 0 ? 'FOMO' : 'Calm', pnl, screenshot_url: null,
      notes: 'Illustrative sample trade for the local preview. This is not your trading history.',
      trade_date, created_at: `${trade_date}T10:00:00Z`,
    };
  }).reverse();
}
