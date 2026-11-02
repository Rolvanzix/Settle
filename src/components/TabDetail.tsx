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
          className="flex items-center gap-1.5 text-xs font-medium text-[#8E8E9B] hover:text-white transition-colors py-1 focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          {tab.code && (
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16161C] hover:bg-[#1E1E26] border border-white/[0.06] rounded-xl text-xs font-mono text-[#F5A623] transition-colors"
              title="Copy Short Code"
            >
              <span>{tab.code}</span>
              {copiedCode ? <Check className="w-3.5 h-3.5 text-[#34D399]" /> : <Copy className="w-3.5 h-3.5 text-[#8E8E9B]" />}
            </button>
          )}

          <button
            onClick={onOpenInvite}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#F5A623] hover:bg-[#E2971A] text-[#0E0E12] rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite</span>
          </button>
        </div>
      </div>

      {/* Pictorial Tab Header Card */}
      <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] shadow-xl min-h-[160px] sm:min-h-[180px] flex flex-col justify-end p-5">
        <div className="absolute inset-0">
          <ImageWithFallback
            src={tab.coverImage || '/assets/aistudio/file_00000000374881f5983b64890efd45c2_4b6a22b6.png'}
            alt={tab.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#16161C] via-[#16161C]/80 to-black/30" />
        </div>

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[#F5A623] border border-white/10">
              {tab.currency} TAB
            </span>
            <span className="text-xs text-white/80 font-mono">
              {tab.members.length} {tab.members.length === 1 ? 'member' : 'members'}
            </span>
          </div>

          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
            {tab.name}
          </h1>

          {tab.description && (
            <p className="text-xs text-[#C8C8D4] line-clamp-2 max-w-lg">
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
                      ? 'bg-[#F5A623]/20 border-[#F5A623]/40 text-[#F5A623] font-medium'
                      : 'bg-black/50 border-white/10 text-white/90'
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
        <div className="bg-[#16161C] border border-[#F5A623]/30 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-md">
          <div className="space-y-0.5">
            <h4 className="text-xs font-semibold text-white">
              Join this Tab
            </h4>
            <p className="text-[11px] text-[#8E8E9B]">
              Connect your Nimiq wallet to participate in shared expenses.
            </p>
          </div>
          <button
            onClick={handleJoinTab}
            disabled={isJoining}
            className="px-4 py-2 bg-[#F5A623] hover:bg-[#E2971A] text-[#0E0E12] font-semibold text-xs rounded-xl transition-all shrink-0 flex items-center gap-1.5"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>{isJoining ? 'Joining...' : 'Join Tab'}</span>
          </button>
        </div>
      )}

      {/* Segmented Navigation */}
      <div className="flex items-center p-1 bg-[#16161C] border border-white/[0.05] rounded-2xl">
        <button
          onClick={() => setActiveView('settlement')}
          className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all ${
            activeView === 'settlement'
              ? 'bg-[#22222C] text-white shadow-sm'
              : 'text-[#8E8E9B] hover:text-[#E4E4EB]'
          }`}
        >
          Balances & Settle
        </button>

        <button
          onClick={() => setActiveView('expenses')}
          className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all ${
            activeView === 'expenses'
              ? 'bg-[#22222C] text-white shadow-sm'
              : 'text-[#8E8E9B] hover:text-[#E4E4EB]'
          }`}
        >
          Expenses ({tab.expenses.length})
        </button>

        <button
          onClick={() => setActiveView('history')}
          className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all ${
            activeView === 'history'
              ? 'bg-[#22222C] text-white shadow-sm'
              : 'text-[#8E8E9B] hover:text-[#E4E4EB]'
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
            <div className="bg-[#16161C] border border-white/[0.06] rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#8E8E9B] block">
                Your Balance
              </span>

              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl sm:text-5xl font-display font-bold tabular-nums tracking-tight ${
                    userNetAmount < -0.001
                      ? 'text-[#F87171]'
                      : userNetAmount > 0.001
                      ? 'text-[#F5A623]'
                      : 'text-white'
                  }`}>
                    {userNetAmount > 0.001 ? '+' : ''}
                    {userNetAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-base font-semibold font-mono text-[#8E8E9B]">
                    {tab.currency}
                  </span>
                </div>

                <p className="text-xs text-[#8E8E9B]">
                  {userNetAmount < -0.001 ? (
                    <span>You owe <strong className="text-white font-medium">{Math.abs(userNetAmount)} {tab.currency}</strong> to settle with the group.</span>
                  ) : userNetAmount > 0.001 ? (
                    <span>You are owed <strong className="text-white font-medium">{userNetAmount} {tab.currency}</strong> from group members.</span>
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
                    className="w-full py-3.5 bg-[#F5A623] hover:bg-[#E2971A] active:scale-[0.99] text-[#0E0E12] font-semibold text-sm rounded-2xl shadow-lg shadow-[#F5A623]/20 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Settle {myPendingTransfer.amount} {tab.currency} with {myPendingTransfer.toName}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[11px] text-[#6E6E7C] text-center mt-2">
                    Direct transfer via Nimiq Pay
                  </p>
                </div>
              )}
            </div>
          )}

          {/* THE HERO: Minimal Settlement List */}
          <div className="bg-[#16161C] border border-white/[0.06] rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <h3 className="font-display font-bold text-base text-white">
                  Optimal Settlements
                </h3>
                <p className="text-xs text-[#8E8E9B]">
                  {netting.minimalTransfers.length === 0
                    ? 'All obligations are cleared.'
                    : `${netting.minimalTransfers.length} ${netting.minimalTransfers.length === 1 ? 'payment settles' : 'payments settle'} the entire group.`}
                </p>
              </div>
            </div>

            {netting.minimalTransfers.length === 0 ? (
              <div className="py-8 text-center bg-[#111115] border border-white/[0.04] rounded-2xl p-4 space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#34D399]/10 text-[#34D399] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="font-display font-bold text-sm text-white">
                  Tab 100% Settled
                </div>
                <p className="text-xs text-[#8E8E9B] max-w-xs mx-auto">
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
                          ? 'bg-[#1D1D26] border-[#F5A623]/30 shadow-md'
                          : 'bg-[#111115] border-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        {/* Bilateral Transfer Visual */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-white block truncate">
                              {t.fromName} {isUserPayer && '(You)'}
                            </span>
                            <span className="text-[10px] font-mono text-[#6E6E7C] block truncate">
                              {truncateAddress(t.fromAddress)}
                            </span>
                          </div>

                          <div className="shrink-0 text-[#8E8E9B] px-1">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>

                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-white block truncate">
                              {t.toName} {isUserReceiver && '(You)'}
                            </span>
                            <span className="text-[10px] font-mono text-[#6E6E7C] block truncate">
                              {truncateAddress(t.toAddress)}
                            </span>
                          </div>
                        </div>

                        {/* Amount & Settle Button */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <div className="font-display font-bold text-sm text-white tabular-nums">
                              {t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <span className="text-[10px] font-mono text-[#8E8E9B] block">
                              {t.currency}
                            </span>
                          </div>

                          <button
                            onClick={() => onOpenSettleTransfer(t)}
                            className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all ${
                              isUserPayer
                                ? 'bg-[#F5A623] hover:bg-[#E2971A] text-[#0E0E12] shadow-sm'
                                : 'bg-white/[0.06] hover:bg-white/[0.1] text-[#E4E4EB]'
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
          <div className="bg-[#16161C] border border-white/[0.06] rounded-3xl p-6 sm:p-7 space-y-3 shadow-xl">
            <h4 className="font-display font-bold text-sm text-white">
              Member Breakdown
            </h4>

            <div className="divide-y divide-white/[0.04]">
              {netting.netBalances.map((b) => {
                const isMe = userAddress && cleanAddress(b.address) === userAddress;
                return (
                  <div
                    key={b.address}
                    className="py-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white truncate">
                          {b.name}
                        </span>
                        {isMe && <span className="text-[10px] text-[#F5A623] font-medium">(You)</span>}
                      </div>
                      <div className="text-[11px] text-[#6E6E7C] font-mono">
                        Paid: {b.totalPaidAmount} · Share: {b.totalShareAmount}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`font-display font-bold text-sm tabular-nums ${
                        b.netUnits < 0
                          ? 'text-[#F87171]'
                          : b.netUnits > 0
                          ? 'text-[#F5A623]'
                          : 'text-[#8E8E9B]'
                      }`}>
                        {b.netUnits > 0 ? '+' : ''}
                        {b.netAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {tab.currency}
                      </div>
                      <span className="text-[10px] text-[#6E6E7C] block">
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
            <span className="text-xs font-medium text-[#8E8E9B]">
              {tab.expenses.length} {tab.expenses.length === 1 ? 'Expense' : 'Expenses'} Logged
            </span>
            <button
              onClick={onOpenAddExpense}
              className="text-xs font-semibold text-[#F5A623] hover:text-[#E2971A] flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Expense</span>
            </button>
          </div>

          {tab.expenses.length === 0 ? (
            <div className="bg-[#16161C] border border-white/[0.06] rounded-3xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] text-[#8E8E9B] flex items-center justify-center mx-auto">
                <Receipt className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-bold text-base text-white">
                  No Expenses Yet
                </h4>
                <p className="text-xs text-[#8E8E9B] max-w-xs mx-auto">
                  Add the first expense for this tab. Debts will immediately net out automatically.
                </p>
              </div>
              <button
                onClick={onOpenAddExpense}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F5A623] hover:bg-[#E2971A] text-[#0E0E12] font-semibold text-xs rounded-xl shadow-sm transition-all"
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
                    className="p-3.5 sm:p-4 bg-[#16161C] hover:bg-[#1A1A22] border border-white/[0.05] rounded-2xl flex items-center justify-between gap-3 transition-colors shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Pictorial Category Photo Thumbnail */}
                      <div className="w-11 h-11 rounded-xl overflow-hidden border border-white/[0.08] relative shrink-0">
                        <ImageWithFallback
                          src={photoSrc}
                          alt={exp.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <IconComponent className="w-4 h-4 text-white drop-shadow" />
                        </div>
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <h4 className="font-semibold text-sm text-white truncate">
                          {exp.title}
                        </h4>
                        <div className="text-[11px] text-[#6E6E7C] truncate flex items-center gap-1.5">
                          <span className={isPayerMe ? 'text-[#F5A623] font-medium' : ''}>
                            {payerName} paid
                          </span>
                          <span>·</span>
                          <span>split by {exp.splitAmong.length}</span>
                          {exp.receiptImage && (
                            <button
                              type="button"
                              onClick={() => setPreviewReceipt(exp.receiptImage!)}
                              className="text-[10px] text-[#F5A623] hover:underline flex items-center gap-0.5 ml-1"
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
                        <div className="font-display font-bold text-sm text-white tabular-nums">
                          {exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <span className="text-[10px] font-mono text-[#8E8E9B]">
                          {exp.currency}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        disabled={deletingId === exp.id}
                        className="p-1.5 text-[#6E6E7C] hover:text-[#F87171] transition-colors rounded-lg"
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
            <span className="text-xs font-medium text-[#8E8E9B]">
              {tab.settlements.length} Completed {tab.settlements.length === 1 ? 'Transfer' : 'Transfers'}
            </span>
            {tab.settlements.length > 0 && (
              <button
                onClick={handleResetSettlements}
                className="flex items-center gap-1 text-xs text-[#8E8E9B] hover:text-[#F5A623] transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {tab.settlements.length === 0 ? (
            <div className="bg-[#16161C] border border-white/[0.06] rounded-3xl p-8 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-white/[0.04] text-[#8E8E9B] flex items-center justify-center mx-auto">
                <Check className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-sm text-white">
                No Settlements Recorded Yet
              </h4>
              <p className="text-xs text-[#8E8E9B] max-w-xs mx-auto">
                Completed Nimiq Pay settlements with transaction receipts will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {tab.settlements.map((stl) => (
                <div
                  key={stl.id}
                  className="p-4 bg-[#16161C] border border-white/[0.05] rounded-2xl flex items-center justify-between gap-3 shadow-sm"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs text-white font-medium">
                      <span>{stl.fromName}</span>
                      <ArrowRight className="w-3 h-3 text-[#6E6E7C]" />
                      <span>{stl.toName}</span>
                    </div>
                    <div className="text-[10px] text-[#6E6E7C] flex items-center gap-2">
                      <span>{new Date(stl.settledAt).toLocaleDateString()}</span>
                      {stl.txHash && (
                        <>
                          <span>·</span>
                          <span className="font-mono text-[#F5A623]/80 truncate max-w-[120px]">
                            {stl.txHash.slice(0, 10)}...
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-display font-bold text-sm text-[#F5A623] tabular-nums">
                      {stl.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {stl.currency}
                    </div>
                    <span className="text-[10px] text-[#6E6E7C] block">
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
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-[#0E0E12] via-[#0E0E12]/95 to-transparent pt-6 pb-4 px-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button
            onClick={onOpenAddExpense}
            className="flex-1 py-3.5 bg-[#16161C] hover:bg-[#1E1E26] active:scale-[0.98] border border-white/[0.08] text-white font-semibold text-xs sm:text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#F5A623]" />
            <span>Add Expense</span>
          </button>

          {netting.minimalTransfers.length > 0 && (
            <button
              onClick={() => {
                const target = myPendingTransfer || netting.minimalTransfers[0];
                onOpenSettleTransfer(target);
              }}
              className="flex-1 py-3.5 bg-[#F5A623] hover:bg-[#E2971A] active:scale-[0.98] text-[#0E0E12] font-semibold text-xs sm:text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-1.5"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setPreviewReceipt(null)}
        >
          <div className="relative max-w-sm w-full bg-[#16161C] rounded-3xl overflow-hidden border border-white/10 p-3 space-y-3">
            <div className="flex items-center justify-between px-2 pt-1">
              <span className="text-xs font-semibold text-white">Receipt Attachment</span>
              <button
                onClick={() => setPreviewReceipt(null)}
                className="w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center"
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
