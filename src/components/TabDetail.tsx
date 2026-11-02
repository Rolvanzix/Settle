import React, { useState } from 'react';
import { 
  ArrowLeft, Plus, UserPlus, ArrowRight, CheckCircle2, 
  Trash2, Receipt, RotateCcw, Copy, Check,
  Utensils, Home, ShoppingCart, Car, Ticket, Coffee, MoreHorizontal,
  Wallet, Camera, ExternalLink, X
} from 'lucide-react';
import { Currency, Tab, WalletIdentity, NettingTransfer } from '../types';
import { calculateNetting, truncateAddress, cleanAddress } from '../utils/netting';
import { api } from '../services/api';
import { ImageWithFallback } from './ImageWithFallback';
import { CATEGORY_PHOTO_FALLBACKS } from '../utils/presets';

interface TabDetailProps {
  tab: Tab;
  wallet: WalletIdentity | null;
  onBack: () => void;
  onOpenAddExpense: () => void;
  onOpenInvite: () => void;
  onOpenConnectWallet: () => void;
  onOpenSettleTransfer: (transfer: NettingTransfer) => void;
  onTabUpdated: (updatedTab: Tab) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  food: Utensils,
  stay: Home,
  groceries: ShoppingCart,
  transport: Car,
  activities: Ticket,
  drinks: Coffee,
  other: MoreHorizontal,
};

export const TabDetail: React.FC<TabDetailProps> = ({
  tab,
  wallet,
  onBack,
  onOpenAddExpense,
  onOpenInvite,
  onOpenConnectWallet,
  onOpenSettleTransfer,
  onTabUpdated,
}) => {
  const [activeView, setActiveView] = useState<'settlement' | 'expenses' | 'history'>('settlement');
  const [isJoining, setIsJoining] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewReceipt, setPreviewReceipt] = useState<string | null>(null);

  const netting = calculateNetting(tab);
  const userAddress = wallet ? cleanAddress(wallet.address) : '';

  const isMember = userAddress
    ? tab.members.some(m => cleanAddress(m.address) === userAddress)
    : false;

  const userBalance = userAddress
    ? netting.netBalances.find(b => cleanAddress(b.address) === userAddress)
    : null;
  const userNetAmount = userBalance ? userBalance.netAmount : 0;

  const myPendingTransfer = userAddress
    ? netting.minimalTransfers.find(t => cleanAddress(t.fromAddress) === userAddress)
    : null;

  const handleCopyCode = () => {
    if (tab.code) {
      navigator.clipboard.writeText(tab.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleJoinTab = async () => {
    if (!wallet) {
      onOpenConnectWallet();
      return;
    }
    try {
      setIsJoining(true);
      const res = await api.joinTab(tab.id, {
        address: wallet.address,
        name: wallet.displayName,
      });
      onTabUpdated(res.tab);
    } catch (err) {
      console.error('Failed to join tab:', err);
    } finally {
      setIsJoining(false);
    }
  };

  const handleDeleteExpense = async (expId: string) => {
    if (!window.confirm('Remove this expense? Netting will be recalculated immediately.')) return;
    try {
      setDeletingId(expId);
      const updated = await api.deleteExpense(tab.id, expId);
      onTabUpdated(updated);
    } catch (err) {
      console.error('Failed to delete expense:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleResetSettlements = async () => {
    if (!window.confirm('Reset completed settlements in this tab to re-open debts?')) return;
    try {
      const updated = await api.resetSettlements(tab.id);
      onTabUpdated(updated);
    } catch (err) {
      console.error('Failed to reset settlements:', err);
    }
  };

  return (
    <div className="space-y-5 pb-28 pt-1 animate-in fade-in duration-300">
      {/* Top Back & Actions Strip */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#A0A5B1] hover:text-white transition-colors py-1 focus:outline-none cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          {tab.code && (
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#272B35] hover:bg-[#2D323E] border border-white/[0.08] rounded-xl text-xs font-mono text-[#F9B91D] font-bold transition-colors cursor-pointer"
              title="Copy Short Code"
            >
              <span>{tab.code}</span>
              {copiedCode ? <Check className="w-3.5 h-3.5 text-[#34D399]" /> : <Copy className="w-3.5 h-3.5 text-[#A0A5B1]" />}
            </button>
          )}

          <button
            onClick={onOpenInvite}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#F9B91D] hover:bg-[#E5A817] text-[#1A1D24] rounded-xl text-xs font-extrabold shadow-md shadow-[#F9B91D]/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite</span>
          </button>
        </div>
      </div>

      {/* Pictorial Tab Header Card */}
      <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl min-h-[160px] sm:min-h-[190px] flex flex-col justify-end p-5 sm:p-6 bg-[#272B35]">
        <div className="absolute inset-0">
          <ImageWithFallback
            src={tab.coverImage || '/assets/aistudio/file_00000000374881f5983b64890efd45c2_4b6a22b6.png'}
            alt={tab.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#20232B] via-[#20232B]/85 to-black/35" />
        </div>

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[#F9B91D] border border-white/10">
              {tab.currency} TAB
            </span>
            <span className="text-xs text-white/90 font-mono font-medium">
              {tab.members.length} {tab.members.length === 1 ? 'member' : 'members'}
            </span>
          </div>

          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            {tab.name}
          </h1>

          {tab.description && (
            <p className="text-xs text-[#D1D5DB] line-clamp-2 max-w-lg">
              {tab.description}
            </p>
          )}

          {/* Member tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar">
            {tab.members.map((m) => {
              const isMe = userAddress && cleanAddress(m.address) === userAddress;
              return (
                <div
                  key={m.address}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs shrink-0 backdrop-blur-md border ${
                    isMe
                      ? 'bg-[#F9B91D]/20 border-[#F9B91D]/50 text-[#F9B91D] font-bold'
                      : 'bg-black/60 border-white/10 text-white/90'
                  }`}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: m.avatarColor }}
                  />
                  <span>{m.name}</span>
                  {isMe && <span className="text-[10px] opacity-75">(You)</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Guest Join Prompt */}
      {!isMember && (
        <div className="bg-[#272B35] border border-[#F9B91D]/40 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-lg">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-white">
              Join this Tab
            </h4>
            <p className="text-[11px] text-[#A0A5B1]">
              Connect your Nimiq wallet to participate in shared expenses.
            </p>
          </div>
          <button
            onClick={handleJoinTab}
            disabled={isJoining}
            className="px-4 py-2 bg-[#F9B91D] hover:bg-[#E5A817] text-[#1A1D24] font-extrabold text-xs rounded-xl shadow-md transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>{isJoining ? 'Joining...' : 'Join Tab'}</span>
          </button>
        </div>
      )}

      {/* Segmented Navigation */}
      <div className="flex items-center p-1 bg-[#272B35] border border-white/[0.08] rounded-2xl">
        <button
          onClick={() => setActiveView('settlement')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeView === 'settlement'
              ? 'bg-[#373C4A] text-white shadow-md'
              : 'text-[#A0A5B1] hover:text-white'
          }`}
        >
          Balances & Settle
        </button>

        <button
          onClick={() => setActiveView('expenses')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeView === 'expenses'
              ? 'bg-[#373C4A] text-white shadow-md'
              : 'text-[#A0A5B1] hover:text-white'
          }`}
        >
          Expenses ({tab.expenses.length})
        </button>

        <button
          onClick={() => setActiveView('history')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeView === 'history'
              ? 'bg-[#373C4A] text-white shadow-md'
              : 'text-[#A0A5B1] hover:text-white'
          }`}
        >
          History ({tab.settlements.length})
        </button>
      </div>

      {/* VIEW 1: HERO BALANCES & MINIMAL SETTLEMENT LIST */}
      {activeView === 'settlement' && (
        <div className="space-y-5">
          {/* Calm, Huge Balance Card */}
          {isMember && (
            <div className="bg-[#272B35] border border-white/[0.08] rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#A0A5B1] block">
                Your Balance
              </span>

              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl sm:text-5xl font-display font-extrabold tabular-nums tracking-tight ${
                    userNetAmount < -0.001
                      ? 'text-[#F87171]'
                      : userNetAmount > 0.001
                      ? 'text-[#F9B91D]'
                      : 'text-white'
                  }`}>
                    {userNetAmount > 0.001 ? '+' : ''}
                    {userNetAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-base font-bold font-mono text-[#A0A5B1]">
                    {tab.currency}
                  </span>
                </div>

                <p className="text-xs text-[#A0A5B1]">
                  {userNetAmount < -0.001 ? (
                    <span>You owe <strong className="text-white font-semibold">{Math.abs(userNetAmount)} {tab.currency}</strong> to settle with the group.</span>
                  ) : userNetAmount > 0.001 ? (
                    <span>You are owed <strong className="text-white font-semibold">{userNetAmount} {tab.currency}</strong> from group members.</span>
                  ) : (
                    <span>You are completely settled up in this tab.</span>
                  )}
                </p>
              </div>

              {/* Prominent Settle Button (if user owes) */}
              {userNetAmount < -0.001 && myPendingTransfer && (
                <div className="pt-2">
                  <button
                    onClick={() => onOpenSettleTransfer(myPendingTransfer)}
                    className="w-full py-3.5 bg-[#F9B91D] hover:bg-[#E5A817] active:scale-[0.99] text-[#1A1D24] font-extrabold text-sm rounded-2xl shadow-lg shadow-[#F9B91D]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Settle {myPendingTransfer.amount} {tab.currency} with {myPendingTransfer.toName}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[11px] text-[#A0A5B1] text-center mt-2">
                    Direct transfer via Nimiq Pay
                  </p>
                </div>
              )}
            </div>
          )}

          {/* THE HERO: Minimal Settlement List */}
          <div className="bg-[#272B35] border border-white/[0.08] rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <h3 className="font-display font-extrabold text-base text-white">
                  Optimal Settlements
                </h3>
                <p className="text-xs text-[#A0A5B1]">
                  {netting.minimalTransfers.length === 0
                    ? 'All obligations are cleared.'
                    : `${netting.minimalTransfers.length} ${netting.minimalTransfers.length === 1 ? 'payment settles' : 'payments settle'} the entire group.`}
                </p>
              </div>
            </div>

            {netting.minimalTransfers.length === 0 ? (
              <div className="py-8 text-center bg-[#20232B] border border-white/[0.06] rounded-2xl p-4 space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#34D399]/15 text-[#34D399] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="font-display font-extrabold text-sm text-white">
                  Tab 100% Settled
                </div>
                <p className="text-xs text-[#A0A5B1] max-w-xs mx-auto">
                  No debts remaining. Add an expense whenever someone pays for the group.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {netting.minimalTransfers.map((t, idx) => {
                  const isUserPayer = userAddress && cleanAddress(t.fromAddress) === userAddress;
                  const isUserReceiver = userAddress && cleanAddress(t.toAddress) === userAddress;

                  return (
                    <div
                      key={`${t.fromAddress}-${t.toAddress}-${idx}`}
                      className={`p-4 rounded-2xl border transition-all ${
                        isUserPayer
                          ? 'bg-[#2D323E] border-[#F9B91D]/40 shadow-lg'
                          : 'bg-[#20232B] border-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        {/* Bilateral Transfer Visual */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white block truncate">
                              {t.fromName} {isUserPayer && '(You)'}
                            </span>
                            <span className="text-[10px] font-mono text-[#6B7280] block truncate">
                              {truncateAddress(t.fromAddress)}
                            </span>
                          </div>

                          <div className="shrink-0 text-[#F9B91D] px-1">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>

                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white block truncate">
                              {t.toName} {isUserReceiver && '(You)'}
                            </span>
                            <span className="text-[10px] font-mono text-[#6B7280] block truncate">
                              {truncateAddress(t.toAddress)}
                            </span>
                          </div>
                        </div>

                        {/* Amount & Settle Button */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <div className="font-display font-extrabold text-sm text-white tabular-nums">
                              {t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <span className="text-[10px] font-mono text-[#A0A5B1] block">
                              {t.currency}
                            </span>
                          </div>

                          <button
                            onClick={() => onOpenSettleTransfer(t)}
                            className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                              isUserPayer
                                ? 'bg-[#F9B91D] hover:bg-[#E5A817] text-[#1A1D24] shadow-md shadow-[#F9B91D]/20'
                                : 'bg-white/[0.08] hover:bg-white/[0.14] text-white'
                            }`}
                          >
                            {isUserPayer ? 'Settle' : 'Pay'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Group Member Balances Ledger */}
          <div className="bg-[#272B35] border border-white/[0.08] rounded-3xl p-6 sm:p-7 space-y-3 shadow-xl">
            <h4 className="font-display font-extrabold text-sm text-white">
              Member Breakdown
            </h4>

            <div className="divide-y divide-white/[0.06]">
              {netting.netBalances.map((b) => {
                const isMe = userAddress && cleanAddress(b.address) === userAddress;
                return (
                  <div
                    key={b.address}
                    className="py-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white truncate">
                          {b.name}
                        </span>
                        {isMe && <span className="text-[10px] text-[#F9B91D] font-bold">(You)</span>}
                      </div>
                      <div className="text-[11px] text-[#6B7280] font-mono">
                        Paid: {b.totalPaidAmount} · Share: {b.totalShareAmount}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`font-display font-bold text-sm tabular-nums ${
                        b.netUnits < 0
                          ? 'text-[#F87171]'
                          : b.netUnits > 0
                          ? 'text-[#F9B91D]'
                          : 'text-[#A0A5B1]'
                      }`}>
                        {b.netUnits > 0 ? '+' : ''}
                        {b.netAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {tab.currency}
                      </div>
                      <span className="text-[10px] text-[#6B7280] block">
                        {b.netUnits < 0 ? 'owes' : b.netUnits > 0 ? 'gets back' : 'cleared'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: EXPENSES FEED */}
      {activeView === 'expenses' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-[#A0A5B1]">
              {tab.expenses.length} {tab.expenses.length === 1 ? 'Expense' : 'Expenses'} Logged
            </span>
            <button
              onClick={onOpenAddExpense}
              className="text-xs font-bold text-[#F9B91D] hover:underline flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Expense</span>
            </button>
          </div>

          {tab.expenses.length === 0 ? (
            <div className="bg-[#272B35] border border-white/[0.08] rounded-3xl p-8 text-center space-y-3 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] text-[#A0A5B1] flex items-center justify-center mx-auto">
                <Receipt className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-extrabold text-base text-white">
                  No Expenses Yet
                </h4>
                <p className="text-xs text-[#A0A5B1] max-w-xs mx-auto">
                  Add the first expense for this tab. Debts will immediately net out automatically.
                </p>
              </div>
              <button
                onClick={onOpenAddExpense}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#F9B91D] hover:bg-[#E5A817] text-[#1A1D24] font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Expense</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {tab.expenses.map((exp) => {
                const IconComponent = CATEGORY_ICONS[exp.category] || CATEGORY_ICONS.other;
                const payerMember = tab.members.find(
                  m => cleanAddress(m.address) === cleanAddress(exp.paidBy)
                );
                const payerName = payerMember ? payerMember.name : truncateAddress(exp.paidBy);
                const isPayerMe = userAddress && cleanAddress(exp.paidBy) === userAddress;
                const photoSrc = exp.receiptImage || CATEGORY_PHOTO_FALLBACKS[exp.category] || CATEGORY_PHOTO_FALLBACKS.other;

                return (
                  <div
                    key={exp.id}
                    className="p-3.5 sm:p-4 bg-[#272B35] hover:bg-[#2D323E] border border-white/[0.08] rounded-2xl flex items-center justify-between gap-3 transition-colors shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Pictorial Category Photo Thumbnail */}
                      <div className="w-11 h-11 rounded-xl overflow-hidden border border-white/[0.08] relative shrink-0">
                        <ImageWithFallback
                          src={photoSrc}
                          alt={exp.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <IconComponent className="w-4 h-4 text-white drop-shadow" />
                        </div>
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <h4 className="font-bold text-sm text-white truncate">
                          {exp.title}
                        </h4>
                        <div className="text-[11px] text-[#A0A5B1] truncate flex items-center gap-1.5">
                          <span className={isPayerMe ? 'text-[#F9B91D] font-bold' : ''}>
                            {payerName} paid
                          </span>
                          <span>·</span>
                          <span>split by {exp.splitAmong.length}</span>
                          {exp.receiptImage && (
                            <button
                              type="button"
                              onClick={() => setPreviewReceipt(exp.receiptImage!)}
                              className="text-[10px] text-[#F9B91D] font-bold hover:underline flex items-center gap-0.5 ml-1 cursor-pointer"
                            >
                              <Camera className="w-2.5 h-2.5" />
                              <span>Receipt</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="font-display font-extrabold text-sm text-white tabular-nums">
                          {exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <span className="text-[10px] font-mono text-[#A0A5B1]">
                          {exp.currency}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        disabled={deletingId === exp.id}
                        className="p-1.5 text-[#6B7280] hover:text-[#F87171] transition-colors rounded-lg cursor-pointer"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: SETTLEMENTS HISTORY */}
      {activeView === 'history' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-[#A0A5B1]">
              {tab.settlements.length} Completed {tab.settlements.length === 1 ? 'Transfer' : 'Transfers'}
            </span>
            {tab.settlements.length > 0 && (
              <button
                onClick={handleResetSettlements}
                className="flex items-center gap-1 text-xs text-[#A0A5B1] hover:text-[#F9B91D] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {tab.settlements.length === 0 ? (
            <div className="bg-[#272B35] border border-white/[0.08] rounded-3xl p-8 text-center space-y-2 shadow-xl">
              <div className="w-10 h-10 rounded-full bg-white/[0.06] text-[#A0A5B1] flex items-center justify-center mx-auto">
                <Check className="w-5 h-5" />
              </div>
              <h4 className="font-display font-extrabold text-sm text-white">
                No Settlements Recorded Yet
              </h4>
              <p className="text-xs text-[#A0A5B1] max-w-xs mx-auto">
                Completed Nimiq Pay settlements with transaction receipts will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {tab.settlements.map((stl) => (
                <div
                  key={stl.id}
                  className="p-4 bg-[#272B35] border border-white/[0.08] rounded-2xl flex items-center justify-between gap-3 shadow-md"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs text-white font-bold">
                      <span>{stl.fromName}</span>
                      <ArrowRight className="w-3 h-3 text-[#F9B91D]" />
                      <span>{stl.toName}</span>
                    </div>
                    <div className="text-[10px] text-[#A0A5B1] flex items-center gap-2">
                      <span>{new Date(stl.settledAt).toLocaleDateString()}</span>
                      {stl.txHash && (
                        <>
                          <span>·</span>
                          <span className="font-mono text-[#F9B91D] truncate max-w-[120px]">
                            {stl.txHash.slice(0, 10)}...
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-display font-extrabold text-sm text-[#F9B91D] tabular-nums">
                      {stl.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {stl.currency}
                    </div>
                    <span className="text-[10px] text-[#A0A5B1] block">
                      Settled via Nimiq
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-[#20232B] via-[#20232B]/95 to-transparent pt-6 pb-4 px-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button
            onClick={onOpenAddExpense}
            className="flex-1 py-3.5 bg-[#272B35] hover:bg-[#2D323E] active:scale-[0.98] border border-white/[0.08] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#F9B91D]" />
            <span>Add Expense</span>
          </button>

          {netting.minimalTransfers.length > 0 && (
            <button
              onClick={() => {
                const target = myPendingTransfer || netting.minimalTransfers[0];
                onOpenSettleTransfer(target);
              }}
              className="flex-1 py-3.5 bg-[#F9B91D] hover:bg-[#E5A817] active:scale-[0.98] text-[#1A1D24] font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-[#F9B91D]/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{myPendingTransfer ? 'Settle Balance' : 'Settle Tab'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Receipt Image Preview Lightbox */}
      {previewReceipt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
          onClick={() => setPreviewReceipt(null)}
        >
          <div className="relative max-w-sm w-full bg-[#272B35] rounded-3xl overflow-hidden border border-white/10 p-3 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between px-2 pt-1">
              <span className="text-xs font-bold text-white">Receipt Attachment</span>
              <button
                onClick={() => setPreviewReceipt(null)}
                className="w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden max-h-[70vh]">
              <img
                src={previewReceipt}
                alt="Receipt"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
