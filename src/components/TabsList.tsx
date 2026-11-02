import React, { useState } from 'react';
import { Plus, Users, ArrowRight, Layers, Sparkles, CheckCircle2, ChevronRight, Compass } from 'lucide-react';
import { Tab, WalletIdentity } from '../types';
import { calculateNetting, cleanAddress } from '../utils/netting';
import { SettleLogo } from './SettleLogo';
import { ImageWithFallback } from './ImageWithFallback';

interface TabsListProps {
  recentTabs: Tab[];
  wallet: WalletIdentity | null;
  onSelectTab: (tab: Tab) => void;
  onCreateTab: () => void;
  onJoinByCodeOrLink: (codeOrLink: string) => Promise<void>;
}

export const TabsList: React.FC<TabsListProps> = ({
  recentTabs,
  wallet,
  onSelectTab,
  onCreateTab,
  onJoinByCodeOrLink,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  const userAddress = wallet ? cleanAddress(wallet.address) : '';

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    try {
      setIsJoining(true);
      setJoinError('');
      await onJoinByCodeOrLink(inputCode.trim());
      setInputCode('');
    } catch (err: any) {
      setJoinError(err?.message || 'Tab not found with this code or link');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 pt-1 animate-in fade-in duration-300">
      {/* High-End Photographic Mobile Hero */}
      <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl min-h-[340px] sm:min-h-[380px] flex flex-col justify-end p-5 sm:p-7">
        {/* Photographic Background */}
        <div className="absolute inset-0">
          <ImageWithFallback
            src="/assets/aistudio/file_00000000374881f5983b64890efd45c2_4b6a22b6.png"
            alt="Travel and settle together"
            className="w-full h-full object-cover object-center scale-105"
          />
          {/* Multi-layered cinematic gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E12] via-[#0E0E12]/80 to-black/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[11px] font-medium text-white/90">
            <span>PLAN</span>
            <span className="text-[#F5A623]">·</span>
            <span>SPLIT</span>
            <span className="text-[#F5A623]">·</span>
            <span className="text-[#F5A623] font-semibold">SETTLE</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight leading-[1.12]">
              Travel. Share. <span className="text-[#F5A623]">Settle.</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#C8C8D4] max-w-sm leading-relaxed font-normal">
              Continuous obligation netting for trips, rent, and outings. Nimiq Pay simplifies multi-person debts into minimal payments.
            </p>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-col xs:flex-row items-stretch xs:items-center gap-2.5">
            <button
              onClick={onCreateTab}
              className="flex items-center justify-center gap-2 bg-[#F5A623] hover:bg-[#E2971A] active:scale-[0.98] text-[#0E0E12] font-semibold text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-[#F5A623]/20 transition-all shrink-0"
            >
              <span>Create a Tab</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Code / Link Input */}
            <form onSubmit={handleJoinSubmit} className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md border border-white/15 rounded-2xl p-1.5 flex-1">
              <input
                type="text"
                placeholder="Paste link or 6-char code..."
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="bg-transparent text-xs text-white placeholder:text-white/50 px-2.5 py-2 flex-1 focus:outline-none font-mono"
              />
              <button
                type="submit"
                disabled={isJoining || !inputCode.trim()}
                className="px-3.5 py-2 bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-40 shrink-0"
              >
                {isJoining ? '...' : 'Open'}
              </button>
            </form>
          </div>

          {joinError && (
            <p className="text-xs text-[#F87171] px-1 font-medium bg-black/60 py-1 rounded-lg">
              {joinError}
            </p>
          )}
        </div>
      </div>

      {/* Pictorial Pillars */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-[#16161C] border border-white/[0.05] rounded-2xl p-3.5 text-center space-y-1.5 hover:border-white/[0.1] transition-all">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] text-[#F5A623] flex items-center justify-center mx-auto shadow-inner">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-xs font-semibold text-white">Create Group</div>
          <p className="text-[10px] text-[#8E8E9B]">Private link & code</p>
        </div>

        <div className="bg-[#16161C] border border-white/[0.05] rounded-2xl p-3.5 text-center space-y-1.5 hover:border-white/[0.1] transition-all">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] text-[#F5A623] flex items-center justify-center mx-auto shadow-inner">
            <Layers className="w-5 h-5" />
          </div>
          <div className="text-xs font-semibold text-white">Add Expenses</div>
          <p className="text-[10px] text-[#8E8E9B]">NIM & USDT support</p>
        </div>

        <div className="bg-[#16161C] border border-white/[0.05] rounded-2xl p-3.5 text-center space-y-1.5 hover:border-white/[0.1] transition-all">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] text-[#F5A623] flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="text-xs font-semibold text-white">Split Fairly</div>
          <p className="text-[10px] text-[#8E8E9B]">Luna-precise math</p>
        </div>

        <div className="bg-[#16161C] border border-white/[0.05] rounded-2xl p-3.5 text-center space-y-1.5 hover:border-white/[0.1] transition-all">
          <div className="w-10 h-10 rounded-xl bg-[#F5A623]/10 text-[#F5A623] flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="text-xs font-semibold text-white">Settle Instantly</div>
          <p className="text-[10px] text-[#8E8E9B]">1-tap Nimiq Pay</p>
        </div>
      </div>

      {/* Recent Tabs Feed with Photo Cards */}
      {recentTabs.length > 0 ? (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-display font-bold text-base text-white">
              Your Shared Tabs
            </h2>
            <span className="text-xs font-mono text-[#8E8E9B]">
              {recentTabs.length} {recentTabs.length === 1 ? 'Tab' : 'Tabs'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {recentTabs.map((tab) => {
              const netting = calculateNetting(tab);
              const userBalance = userAddress ? netting.netBalances.find(
                b => cleanAddress(b.address) === userAddress
              ) : null;
              const netAmount = userBalance ? userBalance.netAmount : 0;
              const isMember = userAddress && tab.members.some(
                m => cleanAddress(m.address) === userAddress
              );

              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab)}
                  className="w-full text-left bg-[#16161C] hover:bg-[#1A1A22] active:scale-[0.99] border border-white/[0.06] hover:border-white/[0.12] rounded-3xl overflow-hidden transition-all duration-200 group focus:outline-none shadow-lg"
                >
                  {/* Photo Header Strip */}
                  <div className="relative h-28 sm:h-32 w-full overflow-hidden">
                    <ImageWithFallback
                      src={tab.coverImage || '/assets/aistudio/file_00000000374881f5983b64890efd45c2_4b6a22b6.png'}
                      alt={tab.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#16161C] via-[#16161C]/50 to-black/30" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[#F5A623] border border-white/10">
                        {tab.currency}
                      </span>
                      {tab.code && (
                        <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10">
                          {tab.code}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 pt-2 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        <h3 className="font-display font-bold text-lg text-white group-hover:text-[#F5A623] transition-colors truncate">
                          {tab.name}
                        </h3>

                        {tab.description && (
                          <p className="text-xs text-[#8E8E9B] line-clamp-1">
                            {tab.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-xs text-[#6E6E7C] pt-1">
                          <span className="text-white/80">{tab.members.length} {tab.members.length === 1 ? 'member' : 'members'}</span>
                          <span>·</span>
                          <span>{tab.expenses.length} {tab.expenses.length === 1 ? 'expense' : 'expenses'}</span>
                          <span>·</span>
                          <span className="font-mono tabular-nums text-[#8E8E9B]">
                            {netting.totalExpensesAmount.toLocaleString()} {tab.currency}
                          </span>
                        </div>
                      </div>

                      {/* Balance Status */}
                      <div className="text-right shrink-0 pl-2">
                        {isMember ? (
                          netAmount < -0.001 ? (
                            <div>
                              <span className="text-[10px] font-semibold text-[#F87171] uppercase tracking-wider block">
                                You owe
                              </span>
                              <div className="font-display font-bold text-lg text-[#F87171] tabular-nums mt-0.5">
                                {Math.abs(netAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                              <span className="text-[10px] font-mono text-[#8E8E9B] block">
                                {tab.currency}
                              </span>
                            </div>
                          ) : netAmount > 0.001 ? (
                            <div>
                              <span className="text-[10px] font-semibold text-[#F5A623] uppercase tracking-wider block">
                                You receive
                              </span>
                              <div className="font-display font-bold text-lg text-[#F5A623] tabular-nums mt-0.5">
                                +{netAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                              <span className="text-[10px] font-mono text-[#8E8E9B] block">
                                {tab.currency}
                              </span>
                            </div>
                          ) : (
                            <div className="text-right">
                              <span className="text-[10px] font-semibold text-[#8E8E9B] uppercase tracking-wider block">
                                Status
                              </span>
                              <div className="text-xs font-medium text-[#8E8E9B] mt-1 flex items-center justify-end gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                                <span>Settled</span>
                              </div>
                            </div>
                          )
                        ) : (
                          <div className="text-right">
                            <span className="text-xs font-semibold text-[#F5A623] group-hover:underline">
                              Open Tab →
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Netting Line */}
                    {netting.minimalTransfers.length > 0 && (
                      <div className="pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-[#6E6E7C]">
                        <span>
                          Netting simplified to <strong className="text-white font-medium">{netting.minimalTransfers.length} {netting.minimalTransfers.length === 1 ? 'payment' : 'payments'}</strong>
                        </span>
                        <span className="font-mono text-[#F5A623] flex items-center gap-1">
                          <span>View settlements</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Inviting Empty State with Photo Visual */
        <div className="bg-[#16161C] border border-white/[0.06] rounded-3xl p-8 sm:p-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto text-[#F5A623]">
            <SettleLogo size={36} />
          </div>
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="font-display font-bold text-xl text-white">
              No tabs yet
            </h3>
            <p className="text-xs sm:text-sm text-[#8E8E9B] leading-relaxed">
              Create a private group tab with custom photography or paste a friend's code to start splitting expenses.
            </p>
          </div>
          <div className="pt-1">
            <button
              onClick={onCreateTab}
              className="inline-flex items-center gap-2 bg-[#F5A623] hover:bg-[#E2971A] text-[#0E0E12] font-semibold text-xs px-6 py-3 rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Tab</span>
            </button>
          </div>
        </div>
      )}

      {/* Reassurance Banner */}
      <div className="bg-[#16161C]/50 border border-white/[0.04] rounded-2xl p-4 flex items-center gap-3.5 text-xs text-[#8E8E9B]">
        <div className="w-1.5 h-8 rounded-full bg-[#F5A623] shrink-0" />
        <div className="leading-relaxed">
          <strong className="text-white block font-medium">Built for real adventures</strong>
          Trips, shared flats, dinners, and events. Settle keeps everyone square on Nimiq Pay without awkward IOUs.
        </div>
      </div>
    </div>
  );
};
