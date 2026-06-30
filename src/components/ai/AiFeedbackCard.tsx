import { AiFeedback } from '@/lib/types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Brain, CheckCircle, AlertOctagon, Lightbulb, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AiFeedbackCardProps {
  feedback: AiFeedback | null;
  onAnalyze: () => void;
  loading: boolean;
}

export default function AiFeedbackCard({ feedback, onAnalyze, loading }: AiFeedbackCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/20';
    if (score >= 50) return 'text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/20';
    return 'text-red-650 dark:text-red-500 bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/20';
  };

  const getScoreBadgeText = (score: number) => {
    if (score >= 80) return 'Excellent Discipline';
    if (score >= 50) return 'Average Consistency';
    return 'High Psychological Risk';
  };

  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 border-b border-zinc-55 dark:border-zinc-850 pb-3">
        <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          AI Copilot Analysis
        </h3>
      </div>

      {!feedback ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
          <Activity className="w-10 h-10 text-zinc-300 dark:text-zinc-700 animate-pulse" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Generate Setup Insights</h4>
            <p className="text-2xs text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
              Let the AI scan entries, stop loss spacing, risk ratios, and recorded emotion to score your discipline.
            </p>
          </div>
          <Button onClick={onAnalyze} loading={loading} className="w-full sm:w-auto">
            Analyze Trade Setup
          </Button>
        </div>
      ) : (
        <div className="space-y-5 flex-1">
          {/* Discipline Score Indicator */}
          <div className={cn('p-4 rounded-xl border flex items-center justify-between', getScoreColor(feedback.score))}>
            <div className="space-y-0.5">
              <p className="text-2xs font-semibold text-zinc-500 dark:text-zinc-450 uppercase tracking-wider">Discipline Score</p>
              <p className="text-xs font-extrabold">{getScoreBadgeText(feedback.score)}</p>
            </div>
            <div className="text-3xl font-black">{feedback.score}</div>
          </div>

          <div className="space-y-4">
            {/* Strengths */}
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/10 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-2xs font-extrabold text-zinc-550 dark:text-zinc-400 uppercase tracking-wide">Key Strengths</h4>
                <p className="text-xs text-zinc-650 dark:text-zinc-300 leading-relaxed">{feedback.strengths}</p>
              </div>
            </div>

            {/* Mistakes */}
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100/50 dark:border-red-900/10 flex items-center justify-center text-red-500 shrink-0 mt-0.5">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-2xs font-extrabold text-zinc-550 dark:text-zinc-400 uppercase tracking-wide">Mistakes Detected</h4>
                <p className="text-xs text-zinc-650 dark:text-zinc-300 leading-relaxed">{feedback.mistakes}</p>
              </div>
            </div>

            {/* Suggestions */}
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-100/50 dark:border-amber-900/10 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-2xs font-extrabold text-zinc-550 dark:text-zinc-400 uppercase tracking-wide">Improvement Tips</h4>
                <p className="text-xs text-zinc-650 dark:text-zinc-300 leading-relaxed">{feedback.suggestions}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
