// ============================================
// TypeScript Type Definitions for Trading Journal
// ============================================

export type Direction = 'Buy' | 'Sell';
export type TradeResult = 'Win' | 'Loss' | 'Breakeven';
export type Session = 'London' | 'NY' | 'Asia';
export type Emotion = 'Calm' | 'Fear' | 'FOMO' | 'Revenge';

/** Core trade record from the database */
export interface Trade {
  id: string;
  user_id: string;
  pair: string;
  direction: Direction;
  entry_price: number;
  stop_loss: number | null;
  take_profit: number | null;
  lot_size: number | null;
  result: TradeResult;
  session: Session | null;
  strategy: string | null;
  emotion: Emotion | null;
  pnl: number;
  screenshot_url: string | null;
  notes: string | null;
  trade_date: string; // ISO date string (YYYY-MM-DD)
  created_at: string;
}

/** Form data for creating a trade */
export interface TradeFormData {
  pair: string;
  direction: Direction;
  entry_price: string;
  stop_loss: string;
  take_profit: string;
  lot_size: string;
  result: TradeResult;
  session: Session | '';
  strategy: string;
  emotion: Emotion | '';
  pnl: string;
  notes: string;
  trade_date: string;
}

/** AI analysis feedback for a single trade */
export interface AiFeedback {
  id: string;
  trade_id: string;
  strengths: string;
  mistakes: string;
  suggestions: string;
  score: number;
  created_at: string;
}

/** User profile */
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

/** Dashboard KPI summary statistics */
export interface DashboardStats {
  totalPnl: number;
  winRate: number;
  totalTrades: number;
  avgRRR: number;
}

/** Data point for the equity curve chart */
export interface EquityPoint {
  date: string;
  equity: number;
}

/** Data point for the PnL by pair bar chart */
export interface PairPnl {
  pair: string;
  pnl: number;
}

/** Calendar day summary */
export interface CalendarDay {
  date: string;
  pnl: number;
  tradeCount: number;
}

/** Analytics summary statistics */
export interface AnalyticsData {
  mostProfitablePair: { pair: string; pnl: number } | null;
  mostProfitableSession: { session: string; pnl: number } | null;
  avgRRR: number;
  longestWinStreak: number;
  longestLossStreak: number;
  totalWins: number;
  totalLosses: number;
  totalBreakeven: number;
  profitFactor: number;
  bestTrade: number;
  worstTrade: number;
}
