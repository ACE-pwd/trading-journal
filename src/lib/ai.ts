import { Trade, AiFeedback } from './types';
import { calculateRRR } from './utils';

/**
 * Analyze a trade and return AI-generated feedback.
 * Simulates API latency.
 */
export async function analyzeTrade(trade: Trade): Promise<Omit<AiFeedback, 'id' | 'trade_id' | 'created_at'>> {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 1500));

  const rrr = calculateRRR(trade);
  const isWin = trade.result === 'Win';
  const hasStopLoss = trade.stop_loss !== null;
  const hasTakeProfit = trade.take_profit !== null;

  // --- Strengths ---
  const strengths: string[] = [];
  if (hasStopLoss) strengths.push('Stop loss was properly set, showing good risk management discipline.');
  if (hasTakeProfit) strengths.push('Take profit target was defined, indicating a planned exit strategy.');
  if (rrr >= 2) strengths.push(`Excellent risk-reward ratio of ${rrr}:1 — well above the recommended 2:1 minimum.`);
  if (isWin && trade.emotion === 'Calm') strengths.push('Trade was executed with a calm emotional state, reflecting disciplined execution.');
  if (trade.strategy) strengths.push(`Followed a defined strategy ("${trade.strategy}"), showing a systematic approach.`);
  if (strengths.length === 0) strengths.push('Trade was logged and documented — consistency in journaling is a key strength.');

  // --- Mistakes ---
  const mistakes: string[] = [];
  if (!hasStopLoss) mistakes.push('No stop loss was set. Always define your maximum risk before entering a trade.');
  if (!hasTakeProfit) mistakes.push('No take profit target defined. Set a clear exit point to lock in gains.');
  if (rrr > 0 && rrr < 1.5) mistakes.push(`Risk-reward ratio of ${rrr}:1 is below optimal. Aim for at least 2:1.`);
  if (trade.emotion === 'FOMO') mistakes.push('Trade was driven by FOMO. Stick to your playbook and avoid chasing entries.');
  if (trade.emotion === 'Revenge') mistakes.push('Revenge trading detected. Take a break after losses to reset your mindset.');
  if (trade.emotion === 'Fear') mistakes.push('Fear-based execution may have impacted trade management. Work on confidence in your setup.');
  if (!trade.strategy) mistakes.push('No strategy tag was recorded. Define and follow a specific setup for each trade.');
  if (mistakes.length === 0) mistakes.push('No major issues identified. Keep maintaining your discipline!');

  // --- Suggestions ---
  const suggestions: string[] = [];
  if (rrr < 2 && rrr > 0) suggestions.push('Consider only taking setups with a minimum 2:1 risk-reward ratio to improve long-term edge.');
  if (trade.session === 'Asia' && !isWin) suggestions.push('Review your performance during the Asian session — consider focusing on higher-volume sessions.');
  if (!trade.notes) suggestions.push('Add detailed notes to every trade to improve your future pattern recognition.');
  suggestions.push('Review this trade during your weekly analysis to identify repeating patterns.');
  if (trade.emotion !== 'Calm') suggestions.push('Practice pre-trade routines (breathing, checklist) to maintain emotional balance.');

  // --- Score (0-100) ---
  let score = 50;
  if (hasStopLoss) score += 10;
  if (hasTakeProfit) score += 10;
  if (rrr >= 2) score += 15;
  else if (rrr >= 1.5) score += 8;
  if (isWin) score += 10;
  if (trade.emotion === 'Calm') score += 10;
  if (trade.strategy) score += 5;
  if (trade.notes) score += 3;
  if (trade.emotion === 'FOMO' || trade.emotion === 'Revenge') score -= 15;
  score = Math.max(10, Math.min(98, score));

  return {
    strengths: strengths.join(' '),
    mistakes: mistakes.join(' '),
    suggestions: suggestions.join(' '),
    score,
  };
}
