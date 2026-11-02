import React, { useState } from 'react';
import { X, Layers, Image as ImageIcon, Check } from 'lucide-react';
import { Currency, Tab, WalletIdentity } from '../types';
import { api } from '../services/api';
import { SettleLogo } from './SettleLogo';
import { TAB_PRESETS } from '../utils/presets';
import { ImageWithFallback } from './ImageWithFallback';

interface CreateTabModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: WalletIdentity | null;
  onTabCreated: (newTab: Tab) => void;
}

export const CreateTabModal: React.FC<CreateTabModalProps> = ({
  isOpen,
  onClose,
  wallet,
  onTabCreated,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState<Currency>('NIM');
  const [selectedPresetId, setSelectedPresetId] = useState(TAB_PRESETS[0].id);
  const [customImage, setCustomImage] = useState('');
  const [showCustomImage, setShowCustomImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const currentCoverImage = showCustomImage && customImage.trim() 
    ? customImage.trim() 
    : (TAB_PRESETS.find(p => p.id === selectedPresetId)?.coverImage || TAB_PRESETS[0].coverImage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a tab name');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const created = await api.createTab({
        name: name.trim(),
        description: description.trim() || undefined,
        currency,
        coverImage: currentCoverImage,
        creatorAddress: wallet?.address || undefined,
        creatorName: wallet?.displayName || undefined,
      });

      onTabCreated(created);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create tab');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full sm:max-w-lg bg-[#272B35] border border-white/[0.08] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <SettleLogo size={22} />
            <span className="font-display font-extrabold text-base text-white">
              Create Shared Tab
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.06] text-[#A0A5B1] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-[#F87171]/15 border border-[#F87171]/30 rounded-xl text-xs text-[#F87171]">
              {error}
            </div>
          )}

          {/* Visual Cover Header Preview */}
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] h-28 sm:h-32 shadow-inner">
            <ImageWithFallback
              src={currentCoverImage}
              alt="Tab cover preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end p-3.5">
              <div className="min-w-0">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F9B91D] block">
                  Tab Cover
                </span>
                <span className="text-sm font-display font-bold text-white truncate block">
                  {name.trim() || 'Your Trip or Group Name'}
                </span>
              </div>
            </div>
          </div>

          {/* Choose Cover Photo Preset */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#A0A5B1]">
                Choose Theme & Photo
              </label>
              <button
                type="button"
                onClick={() => setShowCustomImage(!showCustomImage)}
                className="text-[11px] font-bold text-[#F9B91D] hover:underline"
              >
                {showCustomImage ? 'Use Presets' : 'Custom Image URL'}
              </button>
            </div>

            {!showCustomImage ? (
              <div className="grid grid-cols-5 gap-1.5">
                {TAB_PRESETS.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedPresetId(preset.id)}
                      className={`relative rounded-xl overflow-hidden h-14 border transition-all text-left group ${
                        isSelected ? 'border-[#F9B91D] ring-2 ring-[#F9B91D]/40 scale-[1.02]' : 'border-white/[0.08] opacity-70 hover:opacity-100'
                      }`}
                      title={preset.name}
                    >
                      <ImageWithFallback
                        src={preset.coverImage}
                        alt={preset.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#F9B91D] text-[#1A1D24] flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={customImage}
                onChange={(e) => setCustomImage(e.target.value)}
                className="w-full bg-[#20232B] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#F9B91D]/60 transition-colors"
              />
            )}
          </div>

          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#A0A5B1] block">
              Tab Name
            </label>
            <input
              type="text"
              placeholder="e.g. Zermatt Ski Trip, Lisbon Airbnb, Hacker House"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#20232B] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#F9B91D]/60 transition-colors"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#A0A5B1] block">
              Description (Optional)
            </label>
            <textarea
              placeholder="Trip dates, cabin details or group goals"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-[#20232B] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#F9B91D]/60 transition-colors resize-none"
            />
          </div>

          {/* Currency Toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#A0A5B1] block">
              Primary Currency
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCurrency('NIM')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  currency === 'NIM'
                    ? 'bg-[#2D323E] border-[#F9B91D] text-white shadow-md'
                    : 'bg-[#20232B] border-white/[0.06] text-[#A0A5B1]'
                }`}
              >
                <div className="font-bold text-xs text-[#F9B91D]">NIM (Nimiq)</div>
                <div className="text-[10px] text-[#A0A5B1] mt-0.5">Micro-fee native chain</div>
              </button>

              <button
                type="button"
                onClick={() => setCurrency('USDT')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  currency === 'USDT'
                    ? 'bg-[#2D323E] border-[#F9B91D] text-white shadow-md'
                    : 'bg-[#20232B] border-white/[0.06] text-[#A0A5B1]'
                }`}
              >
                <div className="font-bold text-xs text-[#F9B91D]">USDT (Tether)</div>
                <div className="text-[10px] text-[#A0A5B1] mt-0.5">Dollar-pegged stability</div>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#F9B91D] hover:bg-[#E5A817] active:scale-[0.98] text-[#1A1D24] font-extrabold text-sm rounded-2xl shadow-lg shadow-[#F9B91D]/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Creating...' : 'Create Tab'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
