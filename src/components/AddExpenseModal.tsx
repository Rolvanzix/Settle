import React, { useState } from 'react';
import { X, Utensils, Home, ShoppingCart, Car, Ticket, Coffee, MoreHorizontal, Check, Camera, Image as ImageIcon } from 'lucide-react';
import { Currency, Tab, WalletIdentity } from '../types';
import { api } from '../services/api';
import { truncateAddress } from '../utils/netting';
import { CATEGORY_PHOTO_FALLBACKS } from '../utils/presets';
import { ImageWithFallback } from './ImageWithFallback';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  tab: Tab;
  wallet: WalletIdentity | null;
  onExpenseAdded: (updatedTab: Tab) => void;
}

const CATEGORIES = [
  { id: 'food', label: 'Food & Meals', icon: Utensils, photo: CATEGORY_PHOTO_FALLBACKS.food },
  { id: 'stay', label: 'Stay / Lodging', icon: Home, photo: CATEGORY_PHOTO_FALLBACKS.stay },
  { id: 'groceries', label: 'Groceries', icon: ShoppingCart, photo: CATEGORY_PHOTO_FALLBACKS.groceries },
  { id: 'transport', label: 'Transport', icon: Car, photo: CATEGORY_PHOTO_FALLBACKS.transport },
  { id: 'activities', label: 'Activities', icon: Ticket, photo: CATEGORY_PHOTO_FALLBACKS.activities },
  { id: 'drinks', label: 'Drinks & Bar', icon: Coffee, photo: CATEGORY_PHOTO_FALLBACKS.drinks },
  { id: 'other', label: 'Other', icon: MoreHorizontal, photo: CATEGORY_PHOTO_FALLBACKS.other },
] as const;

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  tab,
  wallet,
  onExpenseAdded,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>(tab.currency);
  const [category, setCategory] = useState<typeof CATEGORIES[number]['id']>('food');
  const [receiptImage, setReceiptImage] = useState('');
  const [showReceiptInput, setShowReceiptInput] = useState(false);
  const [paidBy, setPaidBy] = useState<string>(() => {
    if (wallet && tab.members.some(m => m.address.replace(/\s+/g, '') === wallet.address.replace(/\s+/g, ''))) {
      const match = tab.members.find(m => m.address.replace(/\s+/g, '') === wallet.address.replace(/\s+/g, ''));
      return match?.address || tab.members[0]?.address || '';
    }
    return tab.members[0]?.address || '';
  });
  const [splitAmong, setSplitAmong] = useState<string[]>(() => tab.members.map(m => m.address));
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const parsedAmount = parseFloat(amount);
  const isValidAmount = !isNaN(parsedAmount) && parsedAmount > 0;
  const splitCount = splitAmong.length > 0 ? splitAmong.length : tab.members.length;
  const sharePerPerson = isValidAmount ? (parsedAmount / Math.max(1, splitCount)).toFixed(2) : '0.00';

  const toggleParticipant = (addr: string) => {
    if (splitAmong.includes(addr)) {
      if (splitAmong.length > 1) {
        setSplitAmong(splitAmong.filter(a => a !== addr));
      }
    } else {
      setSplitAmong([...splitAmong, addr]);
    }
  };

  const selectAllParticipants = () => {
    setSplitAmong(tab.members.map(m => m.address));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title');
      return;
    }
    if (!isValidAmount) {
      setError('Please provide a valid amount');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const res = await api.addExpense(tab.id, {
        title: title.trim(),
        amount: parsedAmount,
        currency,
        category,
        paidBy: paidBy || tab.members[0]?.address || '',
        splitAmong: splitAmong.length > 0 ? splitAmong : tab.members.map(m => m.address),
        notes: notes.trim() || undefined,
        receiptImage: receiptImage.trim() || undefined,
      });

      onExpenseAdded(res.tab);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to add expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full sm:max-w-md bg-[#272B35] border border-white/[0.08] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div>
            <h3 className="font-display font-extrabold text-base text-white">
              Add Expense
            </h3>
            <p className="text-xs text-[#A0A5B1]">
              {tab.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.06] text-[#A0A5B1] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {tab.members.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-xs text-[#A0A5B1] leading-relaxed max-w-xs mx-auto">
              This tab currently has no members. Join with your wallet or invite at least one person before recording expenses.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-[#F9B91D] text-[#1A1D24] font-bold text-xs rounded-xl"
            >
              Back to Tab
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
            {error && (
              <div className="p-3 bg-[#F87171]/15 border border-[#F87171]/30 rounded-xl text-xs text-[#F87171]">
                {error}
              </div>
            )}

            {/* Large Hero Amount Input */}
            <div className="bg-[#20232B] border border-white/[0.08] rounded-2xl p-4 text-center space-y-2">
              <span className="text-[10px] font-bold text-[#A0A5B1] uppercase tracking-wider block">
                Expense Amount
              </span>
              <div className="flex items-center justify-center gap-2">
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-48 text-center bg-transparent text-3xl sm:text-4xl font-display font-bold text-white placeholder:text-[#4B5563] focus:outline-none tabular-nums"
                  required
                  autoFocus
                />
                <div className="flex items-center bg-[#2D323E] border border-white/[0.08] rounded-xl p-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setCurrency('NIM')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                      currency === 'NIM' ? 'bg-[#F9B91D] text-[#1A1D24]' : 'text-[#A0A5B1]'
                    }`}
                  >
                    NIM
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency('USDT')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                      currency === 'USDT' ? 'bg-[#F9B91D] text-[#1A1D24]' : 'text-[#A0A5B1]'
                    }`}
                  >
                    USDT
                  </button>
                </div>
              </div>
              {isValidAmount && (
                <span className="text-[11px] font-mono text-[#F9B91D] font-medium block">
                  ≈ {sharePerPerson} {currency} / person
                </span>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#A0A5B1] block">
                Description
              </label>
              <input
                type="text"
                placeholder="e.g. Seafood Dinner, Lift Passes, Airbnb Booking"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#20232B] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#F9B91D]/60 transition-colors"
                required
              />
            </div>

            {/* Category Photo Scroller */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#A0A5B1] block">
                Category
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? 'bg-[#2D323E] border-[#F9B91D] text-[#F9B91D] ring-2 ring-[#F9B91D]/30'
                          : 'bg-[#20232B] border-white/[0.06] text-[#A0A5B1] hover:text-white'
                      }`}
                      title={cat.label}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px] truncate max-w-full font-semibold">
                        {cat.label.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Paid By */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#A0A5B1] block">
                Who paid?
              </label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full bg-[#20232B] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#F9B91D]/60 transition-colors"
              >
                {tab.members.map((m) => (
                  <option key={m.address} value={m.address} className="bg-[#20232B] text-white">
                    {m.name} ({truncateAddress(m.address)})
                  </option>
                ))}
              </select>
            </div>

            {/* Split Among */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#A0A5B1]">
                  Split equally with ({splitCount} people)
                </label>
                {splitAmong.length < tab.members.length && (
                  <button
                    type="button"
                    onClick={selectAllParticipants}
                    className="text-xs font-bold text-[#F9B91D] hover:underline"
                  >
                    Select all
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {tab.members.map((m) => {
                  const isChecked = splitAmong.includes(m.address);
                  return (
                    <button
                      key={m.address}
                      type="button"
                      onClick={() => toggleParticipant(m.address)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                        isChecked
                          ? 'bg-[#2D323E] border-[#F9B91D]/50 text-white'
                          : 'bg-[#20232B] border-transparent text-[#6B7280] opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: m.avatarColor }}
                        />
                        <span className="text-xs font-medium truncate">
                          {m.name}
                        </span>
                      </div>
                      {isChecked && <Check className="w-3.5 h-3.5 text-[#F9B91D] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Receipt Photo */}
            <div className="pt-1">
              {!showReceiptInput ? (
                <button
                  type="button"
                  onClick={() => setShowReceiptInput(true)}
                  className="flex items-center gap-1.5 text-xs text-[#A0A5B1] hover:text-[#F9B91D] transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Attach receipt or bill image URL</span>
                </button>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-[#A0A5B1]">
                    <span>Receipt Image URL</span>
                    <button
                      type="button"
                      onClick={() => { setShowReceiptInput(false); setReceiptImage(''); }}
                      className="hover:text-white"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={receiptImage}
                    onChange={(e) => setReceiptImage(e.target.value)}
                    className="w-full bg-[#20232B] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#F9B91D]/60"
                  />
                </div>
              )}
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#F9B91D] hover:bg-[#E5A817] active:scale-[0.98] text-[#1A1D24] font-extrabold text-sm rounded-2xl shadow-lg shadow-[#F9B91D]/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Saving...' : 'Add Expense'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
