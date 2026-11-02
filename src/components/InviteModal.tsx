import React, { useState } from 'react';
import { X, Copy, Check, UserPlus, KeyRound, Share2 } from 'lucide-react';
import { Tab } from '../types';
import { api } from '../services/api';
import { formatNimiqAddress, isValidNimiqAddress } from '../utils/netting';
import { SettleLogo } from './SettleLogo';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  tab: Tab;
  onMemberAdded: (updatedTab: Tab) => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  tab,
  onMemberAdded,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [newName, setNewName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/?tab=${tab.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    if (tab.code) {
      navigator.clipboard.writeText(tab.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleAddByAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = formatNimiqAddress(newAddress);
    if (!isValidNimiqAddress(formatted)) {
      setError('Please enter a valid Nimiq address (starts with NQ followed by 34 characters)');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const updatedTab = await api.addMember(tab.id, {
        address: formatted,
        name: newName.trim() || undefined,
      });
      onMemberAdded(updatedTab);
      setNewAddress('');
      setNewName('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to add member to tab');
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
          <div className="flex items-center gap-2.5">
            <SettleLogo size={22} />
            <div>
              <h3 className="font-display font-extrabold text-base text-white">
                Invite to {tab.name}
              </h3>
              <p className="text-[11px] text-[#A0A5B1]">
                Private link and code access
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.06] text-[#A0A5B1] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* Method 1: Short Code */}
          {tab.code && (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-[#A0A5B1] block">
                Short Access Code
              </span>
              <div className="bg-[#20232B] border border-white/[0.08] rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-inner">
                <div className="space-y-0.5">
                  <span className="text-2xl font-mono font-extrabold text-[#F9B91D] tracking-widest block">
                    {tab.code}
                  </span>
                  <span className="text-[11px] text-[#A0A5B1]">
                    Enter on home screen to open this tab
                  </span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-4 py-2 bg-white/[0.08] hover:bg-white/[0.14] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-[#34D399]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Method 2: Shareable Link */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-[#A0A5B1] block">
              Direct Private Link
            </span>
            <div className="bg-[#20232B] border border-white/[0.08] rounded-2xl p-2.5 flex items-center justify-between gap-2 shadow-inner">
              <span className="text-xs text-white truncate font-mono px-1">
                {shareUrl}
              </span>
              <button
                onClick={handleCopyLink}
                className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 bg-[#F9B91D] hover:bg-[#E5A817] text-[#1A1D24] font-bold rounded-xl text-xs shadow-md shadow-[#F9B91D]/20 transition-all cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Method 3: Add friend by address */}
          <div className="space-y-2 pt-2 border-t border-white/[0.08]">
            <span className="text-xs font-semibold text-[#A0A5B1] block">
              Or Add Member by Nimiq Address
            </span>

            {error && (
              <div className="p-2.5 bg-[#F87171]/15 border border-[#F87171]/30 rounded-xl text-xs text-[#F87171]">
                {error}
              </div>
            )}

            <form onSubmit={handleAddByAddress} className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="NQxx xxxx xxxx xxxx xxxx..."
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full bg-[#20232B] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs font-mono text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#F9B91D]/60 transition-colors"
                  required
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Friend's Name (e.g. Sam, Lucas)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#20232B] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#F9B91D]/60 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-white/[0.08] hover:bg-white/[0.14] text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Adding...' : 'Add Member to Tab'}
              </button>
            </form>
          </div>

          {/* Current Members List */}
          <div className="pt-2 border-t border-white/[0.08] space-y-2">
            <span className="text-[11px] font-bold text-[#A0A5B1] uppercase tracking-wider block">
              Members in this Tab ({tab.members.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {tab.members.map((m) => (
                <div
                  key={m.address}
                  className="flex items-center gap-1.5 bg-[#20232B] border border-white/[0.06] px-2.5 py-1 rounded-full text-xs text-white"
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: m.avatarColor }}
                  />
                  <span>{m.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
