import React, { useState } from 'react';
import { 
  ArrowRight, Users, FileText, CheckCircle2, ChevronRight, 
  MapPin, Plus, Hash, Layers
} from 'lucide-react';
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
      {/* ============================================================== */}
      {/* 1. HERO POSTER SECTION (Matches Reference Image Composition)  */}
      {/* ============================================================== */}
      <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl bg-[#20232B] min-h-[440px] sm:min-h-[480px] flex flex-col justify-between p-6 sm:p-8">
        {/* Photographic Globe & Friends Artwork */}
        <div className="absolute inset-0">
          <ImageWithFallback
            src="/assets/aistudio/file_00000000374881f5983b64890efd45c2_4b6a22b6.png"
            alt="Travel. Share. Settle."
            className="w-full h-full object-cover object-top sm:object-center"
          />
          {/* Subtle multi-layer charcoal vignette overlay to ensure pristine typography legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#20232B] via-[#20232B]/80 to-[#20232B]/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#20232B]/90 via-[#20232B]/50 to-transparent" />
        </div>

        {/* Top Space for Air / Plane */}
        <div className="relative z-10">
          {/* Kicker: PLAN · SPLIT · SETTLE */}
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] text-[#A0A5B1] uppercase">
            <span>PLAN</span>
            <span className="text-[#F9B91D] font-bold">·</span>
            <span>SPLIT</span>
            <span className="text-[#F9B91D] font-bold">·</span>
            <span className="text-white">SETTLE</span>
          </div>
        </div>

        {/* Hero Copy & CTA Zone */}
        <div className="relative z-10 space-y-4 pt-12 sm:pt-16 max-w-md">
          {/* Main Title with Golden Yellow Underline on Settle */}
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-white tracking-tight leading-[1.08]">
              Travel. Share.
              <br />
              <span className="relative inline-block text-[#F9B91D]">
                Settle.
                {/* Yellow curved brush underline SVG matching reference */}
                <svg
                  className="absolute -bottom-2.5 left-0 w-full h-3 text-[#F9B91D] overflow-visible"
                  viewBox="0 0 160 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 8.5C38 3 105 2.5 157 9"
                    stroke="#F9B91D"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
          </div>

          <p className="text-sm sm:text-base text-[#D1D5DB] leading-relaxed font-normal pt-1">
            Easily split expenses with your friends, group or team.
          </p>

          {/* Primary Action Button: Golden-Yellow Pill "Get Started →" */}
          <div className="pt-2 flex flex-col xs:flex-row items-stretch xs:items-center gap-3">
            <button
              onClick={onCreateTab}
              className="inline-flex items-center justify-center gap-2 bg-[#F9B91D] hover:bg-[#E5A817] active:scale-[0.98] text-[#1A1D24] font-extrabold text-sm px-7 py-3.5 rounded-full shadow-lg shadow-[#F9B91D]/25 transition-all shrink-0 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Quick Code / Link Input */}
            <form onSubmit={handleJoinSubmit} className="flex items-center gap-1.5 bg-[#272B35]/90 backdrop-blur-md border border-white/15 rounded-full p-1.5 flex-1">
              <input
                type="text"
                placeholder="Paste code (e.g. 6D2G8B)"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="bg-transparent text-xs text-white placeholder:text-white/40 px-3 py-1.5 flex-1 focus:outline-none font-mono"
              />
              <button
                type="submit"
                disabled={isJoining || !inputCode.trim()}
                className="px-3.5 py-1.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-bold rounded-full transition-all disabled:opacity-40 shrink-0"
              >
                {isJoining ? '...' : 'Join'}
              </button>
            </form>
          </div>

          {joinError && (
            <p className="text-xs text-[#F87171] px-2 font-medium bg-[#272B35] py-1.5 rounded-xl border border-[#F87171]/20">
              {joinError}
            </p>
          )}

          {/* Subtle "Learn More ∨" indicator from reference */}
          <div className="pt-1">
            <a
              href="#pillars"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#A0A5B1] hover:text-white transition-colors"
            >
              <span>Learn More</span>
              <span className="text-xs">∨</span>
            </a>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. THE 4 PILLARS (Exact 4 Cards from Reference Image)          */}
      {/* ============================================================== */}
      <div id="pillars" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Card 1: Create Group */}
        <button
          onClick={onCreateTab}
          className="bg-[#272B35] hover:bg-[#2D323E] active:scale-[0.98] border border-white/[0.08] hover:border-[#F9B91D]/30 rounded-2xl p-4 text-center space-y-2.5 transition-all group focus:outline-none"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/[0.06] text-white flex items-center justify-center mx-auto transition-transform group-hover:scale-105">
            {/* Custom stylized group icon with sparkle */}
            <div className="relative">
              <Users className="w-6 h-6 stroke-[1.8]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#F9B91D]" />
            </div>
          </div>
          <div className="text-xs sm:text-sm font-bold text-white group-hover:text-[#F9B91D] transition-colors">
            Create Group
          </div>
        </button>

        {/* Card 2: Add Expenses */}
        <button
          onClick={recentTabs.length > 0 ? () => onSelectTab(recentTabs[0]) : onCreateTab}
          className="bg-[#272B35] hover:bg-[#2D323E] active:scale-[0.98] border border-white/[0.08] hover:border-[#F9B91D]/30 rounded-2xl p-4 text-center space-y-2.5 transition-all group focus:outline-none"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/[0.06] text-white flex items-center justify-center mx-auto transition-transform group-hover:scale-105">
            <div className="relative">
              <FileText className="w-6 h-6 stroke-[1.8]" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#F9B91D] text-[#1E2129] font-bold text-[10px] flex items-center justify-center">
                +
              </div>
            </div>
          </div>
          <div className="text-xs sm:text-sm font-bold text-white group-hover:text-[#F9B91D] transition-colors">
            Add Expenses
          </div>
        </button>

        {/* Card 3: Split Fairly */}
        <div className="bg-[#272B35] border border-white/[0.08] rounded-2xl p-4 text-center space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.06] text-white flex items-center justify-center mx-auto">
            {/* Person-to-person network */}
            <div className="flex items-center justify-center -space-x-1">
              <div className="w-4 h-4 rounded-full border-2 border-white/80" />
              <div className="w-5 h-5 rounded-full border-2 border-[#F9B91D] bg-[#F9B91D]/20 z-10" />
              <div className="w-4 h-4 rounded-full border-2 border-white/80" />
            </div>
          </div>
          <div className="text-xs sm:text-sm font-bold text-white">
            Split Fairly
          </div>
        </div>

        {/* Card 4: Settle Instantly */}
        <div className="bg-[#272B35] border border-white/[0.08] rounded-2xl p-4 text-center space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-[#F9B91D]/15 text-[#F9B91D] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6 stroke-[2.2] text-[#F9B91D]" />
          </div>
          <div className="text-xs sm:text-sm font-bold text-white">
            Settle Instantly
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. FEATURE CARD: "Perfect for any plan" (Matches Reference)   */}
      {/* ============================================================== */}
      <div className="bg-[#272B35] border border-white/[0.08] rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden">
        {/* Left Side: Headline & Copy */}
        <div className="space-y-2 text-left z-10 flex-1">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-6 bg-[#F9B91D] rounded-full shrink-0" />
            <h3 className="font-display font-extrabold text-lg sm:text-xl text-white">
              Perfect for any plan
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#A0A5B1] leading-relaxed max-w-sm">
            Trips, outings, house rent, or daily expenses — Settle keeps everyone on the same page.
          </p>
        </div>

        {/* Right Side: Folded Map Artwork with Yellow Pin */}
        <div className="shrink-0 relative w-36 h-24 sm:w-44 sm:h-28 flex items-center justify-center">
          <svg
            className="w-full h-full drop-shadow-xl"
            viewBox="0 0 180 110"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 3D Folded Map panels */}
            <polygon
              points="10,35 60,15 60,85 10,105"
              fill="#343946"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1.5"
            />
            <polygon
              points="60,15 120,30 120,100 60,85"
              fill="#3D4353"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1.5"
            />
            <polygon
              points="120,30 170,12 170,82 120,100"
              fill="#2E333F"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1.5"
            />

            {/* Dashed trail route across map */}
            <path
              d="M30 65 Q 90 90, 100 45 T 150 40"
              stroke="#F9B91D"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              strokeLinecap="round"
            />

            {/* Glowing Map Pin Icon in Vibrant Yellow */}
            <g transform="translate(85, 18)">
              {/* Pin shadow */}
              <ellipse cx="14" cy="38" rx="7" ry="3" fill="#15171D" fillOpacity="0.6" />
              {/* Pin body */}
              <path
                d="M14 0 C6.3 0 0 6.3 0 14 C0 24.5 14 38 14 38 C14 38 28 24.5 28 14 C28 6.3 21.7 0 14 0 Z"
                fill="#F9B91D"
              />
              <circle cx="14" cy="14" r="5" fill="#20232B" />
            </g>
          </svg>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. RECENT TABS FEED (Consistent Charcoal & Gold Styling)        */}
      {/* ============================================================== */}
      {recentTabs.length > 0 ? (
        <div className="space-y-3.5 pt-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h2 className="font-display font-extrabold text-lg text-white">
                Your Shared Tabs
              </h2>
              <span className="text-xs font-mono font-bold text-[#F9B91D] bg-[#F9B91D]/15 px-2 py-0.5 rounded-full">
                {recentTabs.length}
              </span>
            </div>
            <button
              onClick={onCreateTab}
              className="text-xs font-bold text-[#F9B91D] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Tab</span>
            </button>
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
                  className="w-full text-left bg-[#272B35] hover:bg-[#2D323E] active:scale-[0.99] border border-white/[0.08] hover:border-white/[0.16] rounded-3xl overflow-hidden transition-all duration-200 group focus:outline-none shadow-xl"
                >
                  {/* Photo Header Strip */}
                  <div className="relative h-28 sm:h-32 w-full overflow-hidden">
                    <ImageWithFallback
                      src={tab.coverImage || '/assets/aistudio/file_00000000374881f5983b64890efd45c2_4b6a22b6.png'}
                      alt={tab.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#272B35] via-[#272B35]/60 to-black/30" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[#F9B91D] border border-white/10">
                        {tab.currency}
                      </span>
                      {tab.code && (
                        <span className="text-[11px] font-mono font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white border border-white/10">
                          {tab.code}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 pt-2 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        <h3 className="font-display font-extrabold text-lg text-white group-hover:text-[#F9B91D] transition-colors truncate">
                          {tab.name}
                        </h3>

                        {tab.description && (
                          <p className="text-xs text-[#A0A5B1] line-clamp-1">
                            {tab.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-xs text-[#8B92A2] pt-1">
                          <span className="text-white/90 font-medium">
                            {tab.members.length} {tab.members.length === 1 ? 'member' : 'members'}
                          </span>
                          <span>·</span>
                          <span>{tab.expenses.length} {tab.expenses.length === 1 ? 'expense' : 'expenses'}</span>
                          <span>·</span>
                          <span className="font-mono tabular-nums text-white font-semibold">
                            {netting.totalExpensesAmount.toLocaleString()} {tab.currency}
                          </span>
                        </div>
                      </div>

                      {/* Balance Status */}
                      <div className="text-right shrink-0 pl-2">
                        {isMember ? (
                          netAmount < -0.001 ? (
                            <div>
                              <span className="text-[10px] font-bold text-[#F87171] uppercase tracking-wider block">
                                You owe
                              </span>
                              <div className="font-display font-bold text-lg text-[#F87171] tabular-nums mt-0.5">
                                {Math.abs(netAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                              <span className="text-[10px] font-mono text-[#A0A5B1] block">
                                {tab.currency}
                              </span>
                            </div>
                          ) : netAmount > 0.001 ? (
                            <div>
                              <span className="text-[10px] font-bold text-[#F9B91D] uppercase tracking-wider block">
                                You receive
                              </span>
                              <div className="font-display font-bold text-lg text-[#F9B91D] tabular-nums mt-0.5">
                                +{netAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                              <span className="text-[10px] font-mono text-[#A0A5B1] block">
                                {tab.currency}
                              </span>
                            </div>
                          ) : (
                            <div className="text-right">
                              <span className="text-[10px] font-bold text-[#A0A5B1] uppercase tracking-wider block">
                                Status
                              </span>
                              <div className="text-xs font-semibold text-[#34D399] mt-1 flex items-center justify-end gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                                <span>Settled</span>
                              </div>
                            </div>
                          )
                        ) : (
                          <div className="text-right">
                            <span className="text-xs font-bold text-[#F9B91D] group-hover:underline">
                              Open Tab →
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Netting Line */}
                    {netting.minimalTransfers.length > 0 && (
                      <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#A0A5B1]">
                        <span>
                          Netting simplified to <strong className="text-white font-semibold">{netting.minimalTransfers.length} {netting.minimalTransfers.length === 1 ? 'payment' : 'payments'}</strong>
                        </span>
                        <span className="font-mono text-[#F9B91D] font-bold flex items-center gap-1">
                          <span>View plan</span>
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
        /* Inviting Empty State with Settle Logo */
        <div className="bg-[#272B35] border border-white/[0.08] rounded-3xl p-8 sm:p-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-[#F9B91D]">
            <SettleLogo size={36} />
          </div>
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="font-display font-extrabold text-xl text-white">
              No tabs yet
            </h3>
            <p className="text-xs sm:text-sm text-[#A0A5B1] leading-relaxed">
              Create a private group tab or paste a friend's 6-character code to start splitting expenses.
            </p>
          </div>
          <div className="pt-1">
            <button
              onClick={onCreateTab}
              className="inline-flex items-center gap-2 bg-[#F9B91D] hover:bg-[#E5A817] text-[#1A1D24] font-extrabold text-xs px-6 py-3 rounded-full shadow-lg shadow-[#F9B91D]/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Tab</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. FOOTER WITH LOGO & GOLD WAVE ACCENT (Matches Reference)     */}
      {/* ============================================================== */}
      <div className="relative pt-6 pb-4 overflow-hidden rounded-3xl bg-[#20232B] border border-white/[0.06] p-6">
        {/* Yellow curved wave accent in bottom-left */}
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-[#F9B91D] rounded-full filter blur-xl opacity-20 pointer-events-none" />
        <svg
          className="absolute bottom-0 left-0 w-32 h-20 text-[#F9B91D] pointer-events-none"
          viewBox="0 0 120 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 80 C40 80, 80 50, 0 10 Z"
            fill="#F9B91D"
            fillOpacity="0.35"
          />
        </svg>

        {/* Footer Brand + Tagline from reference */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-2.5 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <SettleLogo size={22} />
            <span className="font-display font-bold text-white text-sm">Settle</span>
          </div>
          <span className="hidden sm:inline text-white/30 font-light">|</span>
          <span className="text-xs text-[#A0A5B1] font-medium tracking-wide">
            Smarter Spending. Stronger Connections.
          </span>
        </div>
      </div>
    </div>
  );
};
