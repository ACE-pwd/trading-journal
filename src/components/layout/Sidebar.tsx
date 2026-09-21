'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, BookOpen, Calendar, Plus, X, ChartNoAxesCombined, ArrowUpRight } from 'lucide-react';

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const items = [{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }, { label: 'Journal', href: '/journal', icon: BookOpen }, { label: 'Calendar', href: '/calendar', icon: Calendar }];
  return <>
    {open && <button aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden" />}
    <aside className={cn('fixed inset-y-0 left-0 z-50 flex w-60 shrink-0 flex-col bg-[#171824] text-slate-300 transition-transform lg:static lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
      <div className="h-20 flex items-center justify-between px-6"><Link href="/dashboard" onClick={onClose} className="flex items-center gap-3"><span className="w-9 h-9 rounded-xl bg-violet-600 text-white grid place-items-center"><ChartNoAxesCombined size={21} /></span><span className="font-semibold tracking-tight text-white text-lg">AI Journal<span className="block text-[9px] font-medium tracking-[.22em] uppercase text-slate-400">Your trading workspace</span></span></Link><button aria-label="Close navigation" onClick={onClose} className="lg:hidden p-1"><X size={18} /></button></div>
      <nav aria-label="Main navigation" className="px-4 py-5 space-y-2">
        <Link href="/add-trade" onClick={onClose} aria-current={pathname === '/add-trade' ? 'page' : undefined} className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-4 py-3 text-sm font-semibold mb-8"><Plus size={17} /> Add Trade</Link>
        <p className="px-3 pb-2 text-[10px] tracking-[.2em] text-slate-500 font-semibold">WORKSPACE</p>
        {items.map(item => <Link key={item.href} href={item.href} onClick={onClose} aria-current={pathname.startsWith(item.href) ? 'page' : undefined} className={cn('flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-colors', pathname.startsWith(item.href) ? 'bg-violet-500/15 text-violet-300 font-semibold border border-violet-500/15' : 'hover:bg-white/5 text-slate-400 border border-transparent')}><item.icon size={18} />{item.label}</Link>)}
      </nav>
      <div className="mt-auto p-4"><div className="rounded-xl border border-white/10 p-4 bg-white/[.025]"><p className="text-xs text-white font-medium">Build a better trading habit.</p><p className="text-xs text-slate-400 mt-2 leading-5">Log the setup. Review the outcome. Learn from every trade.</p><Link href="/journal" onClick={onClose} className="flex items-center gap-2 text-xs text-violet-300 mt-4">Open your journal <ArrowUpRight size={13} /></Link></div><p className="text-[10px] text-slate-500 px-2 pt-4">One trade. One lesson. Every day.</p></div>
    </aside>
  </>;
}
