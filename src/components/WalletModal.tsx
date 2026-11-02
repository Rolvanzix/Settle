import React, { useState } from 'react';
import { X, Copy, Check, Shield, ExternalLink, LogOut, Wallet, Loader2, Sparkles } from 'lucide-react';
import { WalletIdentity } from '../types';
import { nimiqWallet } from '../services/nimiqWallet';
import { SettleLogo } from './SettleLogo';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: WalletIdentity | null;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  wallet,
}) => {
  const [copied, setCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCopy = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnectNimiq = async () => {
    try {
      setIsConnecting(true);
      setError('');
      await nimiqWallet.connectNimiqWallet();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Connection was closed or rejected');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      nimiqWallet.connectManualAddress(manualAddress);
      setManualAddress('');
      setShowManual(false);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Invalid Nimiq address');
    }
  };

  const handleDisconnect = () => {
    nimiqWallet.disconnect();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full sm:max-w-md bg-[#16161C] border border-white/[0.08] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <SettleLogo size={22} />
            <div>
              <h3 className="font-display font-bold text-base text-white">
                Nimiq Wallet
              </h3>
              <p className="text-[11px] text-[#8E8E9B]">
                {wallet ? (wallet.isNimiqPay ? 'Nimiq Pay App' : 'Nimiq Hub Connected') : 'Connect Nimiq Wallet'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.04] text-[#8E8E9B] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {wallet ? (
            /* Connected State */
            <div className="space-y-4">
              <div className="bg-[#111115] border border-white/[0.05] rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-medium text-[#8E8E9B] uppercase tracking-wider block">
                      Connected Account
                    </span>
                    <h4 className="text-base font-display font-bold text-white mt-0.5">
                      {wallet.displayName}
                    </h4>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623]" />
                    <span>{wallet.isNimiqPay ? 'Nimiq Pay' : 'Nimiq Hub'}</span>
                  </span>
                </div>

                {/* Address & Copy */}
                <div className="bg-[#16161C] rounded-xl p-2.5 border border-white/[0.05] flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-[#E4E4EB] select-all truncate">
                    {wallet.formattedAddress}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 p-1.5 text-[#8E8E9B] hover:text-[#F5A623] transition-colors rounded-lg"
                    title="Copy address"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#34D399]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleDisconnect}
                className="w-full py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-[#F87171] text-xs font-medium rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect Wallet</span>
              </button>
            </div>
          ) : (
            /* Not Connected State */
            <div className="space-y-4">
              <div className="text-center space-y-1 py-1">
                <div className="w-14 h-14 rounded-2xl bg-[#F5A623]/10 text-[#F5A623] flex items-center justify-center mx-auto mb-2">
                  <SettleLogo size={32} />
                </div>
                <h4 className="font-display font-bold text-base text-white">
                  Connect Nimiq Wallet
                </h4>
                <p className="text-xs text-[#8E8E9B] max-w-xs mx-auto">
                  Connect your real Nimiq account directly via Nimiq Pay or Nimiq Hub to sign and settle group expenses in 1 tap.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-[#F87171]/10 border border-[#F87171]/20 rounded-xl text-xs text-[#F87171]">
                  {error}
                </div>
              )}

              {/* Main One-Tap Nimiq Connect Action */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleConnectNimiq}
                  disabled={isConnecting}
                  className="w-full py-3.5 bg-[#F5A623] hover:bg-[#E2971A] active:scale-[0.98] text-[#0E0E12] font-semibold text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#0E0E12]" />
                      <span>Connecting Nimiq Wallet...</span>
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4" />
                      <span>Connect with Nimiq</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-[#6E6E7C] text-center">
                  Opens official Nimiq Hub login popup
                </p>
              </div>

              {/* Manual fallback toggle */}
              <div className="pt-2 border-t border-white/[0.04]">
                {!showManual ? (
                  <button
                    onClick={() => setShowManual(true)}
                    className="w-full py-1.5 text-xs text-[#8E8E9B] hover:text-white font-medium text-center transition-colors"
                  >
                    Or paste Nimiq address manually →
                  </button>
                ) : (
                  <form onSubmit={handleManualSubmit} className="space-y-2 pt-1">
                    <input
                      type="text"
                      placeholder="NQxx xxxx xxxx xxxx..."
                      value={manualAddress}
                      onChange={(e) => setManualAddress(e.target.value)}
                      className="w-full bg-[#111115] border border-white/[0.06] rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-[#525262] focus:outline-none focus:border-[#F5A623]/50"
                      required
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-1.5 bg-white/[0.08] hover:bg-white/[0.12] text-white font-semibold text-xs rounded-lg"
                      >
                        Save Address
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowManual(false)}
                        className="px-3 py-1.5 text-xs text-[#8E8E9B] hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/[0.06] bg-[#111115]">
          <button
            onClick={onClose}
            className="w-full py-2 bg-white/[0.06] hover:bg-white/[0.1] text-white font-medium text-xs rounded-xl transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
