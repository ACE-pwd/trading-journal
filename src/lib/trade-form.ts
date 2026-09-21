import type { TradeFormData, Trade } from './types';

export function parseTradeForm(form: TradeFormData): Omit<Trade, 'id' | 'user_id' | 'created_at' | 'screenshot_url'> {
  const numeric = (value: string, label: string, required = false): number | null => {
    if (!value.trim()) {
      if (required) throw new Error(`${label} is required.`);
      return null;
    }
    const number = Number(value);
    if (!Number.isFinite(number)) throw new Error(`${label} must be a valid number.`);
    return number;
  };
  const pair = form.pair.trim().toUpperCase();
  if (!pair) throw new Error('Pair is required.');
  if (!['Buy', 'Sell'].includes(form.direction)) throw new Error('Select a valid direction.');
  if (!['Win', 'Loss', 'Breakeven'].includes(form.result)) throw new Error('Select a valid result.');
  if (form.session && !['London', 'NY', 'Asia'].includes(form.session)) throw new Error('Select a valid session.');
  if (form.emotion && !['Calm', 'Fear', 'FOMO', 'Revenge'].includes(form.emotion)) throw new Error('Select a valid emotion.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.trade_date) || !Number.isFinite(Date.parse(form.trade_date)) || new Date(form.trade_date).toISOString().slice(0, 10) !== form.trade_date) throw new Error('Enter a valid trade date.');
  const entry_price = numeric(form.entry_price, 'Entry price', true)!;
  const stop_loss = numeric(form.stop_loss, 'Stop loss');
  const take_profit = numeric(form.take_profit, 'Take profit');
  const lot_size = numeric(form.lot_size, 'Lot size');
  if (entry_price <= 0 || (stop_loss !== null && stop_loss <= 0) || (take_profit !== null && take_profit <= 0) || (lot_size !== null && lot_size <= 0)) throw new Error('Prices and lot size must be greater than zero.');
  if (stop_loss !== null && (form.direction === 'Buy' ? stop_loss >= entry_price : stop_loss <= entry_price)) throw new Error('Stop loss must be below a buy entry or above a sell entry.');
  if (take_profit !== null && (form.direction === 'Buy' ? take_profit <= entry_price : take_profit >= entry_price)) throw new Error('Take profit must be above a buy entry or below a sell entry.');
  const pnl = numeric(form.pnl, 'PnL') ?? 0;
  if ((form.result === 'Win' && pnl < 0) || (form.result === 'Loss' && pnl > 0) || (form.result === 'Breakeven' && pnl !== 0)) throw new Error('PnL must match the selected result.');
  return { pair, direction: form.direction, entry_price, stop_loss, take_profit, lot_size,
    result: form.result, session: form.session || null, strategy: form.strategy.trim() || null,
    emotion: form.emotion || null, pnl, notes: form.notes.trim() || null, trade_date: form.trade_date };
}
