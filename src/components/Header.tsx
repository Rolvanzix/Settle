import React, { useState } from 'react';
import { Wallet, ChevronDown, Menu, X, Plus, Hash, ExternalLink, ShieldCheck } from 'lucide-react';
import { WalletIdentity } from '../types';
import { SettleLogo } from './SettleLogo';

interface HeaderProps {
  wallet: WalletIdentity | null;
  onOpenWallet: () => void;
  onNavigateHome: () => void;
  onOpenCreateTab?: () => void;
  activeTabTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  wallet,
  onOpenWallet,
  onNavigateHome,
  onOpenCreateTab,
  activeTabTitle,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-[#20232B]/95 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-6 py-3.5 transition-colors">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Zone - Matches reference header */}
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 group text-left focus:outline-none"
            aria-label="Settle Home"
          >
            <div className="group-hover:scale-105 active:scale-95 transition-transform duration-200">
              <SettleLogo size={28} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-bold text-xl text-white tracking-tight">
                Settle
              </span>
              {activeTabTitle && (
                <span className="text-xs text-[#A0A5B1] truncate max-w-[130px] sm:max-w-[200px]">
                  / {activeTabTitle}
                </span>
              )}
            </div>
          </button>

          {/* Right Zone: Wallet Badge + Reference Hamburger Menu */}
          <div className="flex items-center gap-2.5">
            {wallet ? (
              <button
                onClick={onOpenWallet}
                className="flex items-center gap-2 bg-[#272B35] hover:bg-[#2D323E] active:bg-[#343946] border border-white/[0.08] rounded-full pl-3 pr-2.5 py-1.5 transition-all text-xs focus:outline-none"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#F9B91D]" />
                <span className="font-medium text-white max-w-[80px] sm:max-w-[110px] truncate">
                  {wallet.displayName}
                </span>
                <div className="h-3 w-px bg-white/10" />
                <span className="font-mono tabular-nums text-[#F9B91D] font-semibold text-[11px]">
                  {wallet.balanceNim.toLocaleString(undefined, { maximumFractionDigits: 0 })} NIM
                </span>
                <ChevronDown className="w-3 h-3 text-[#A0A5B1]" />
              </button>
            ) : (
              <button
                onClick={onOpenWallet}
                className="hidden xs:flex items-center gap-1.5 bg-[#F9B91D] hover:bg-[#E5A817] text-[#1E2129] font-bold px-3.5 py-1.5 rounded-full text-xs transition-all shadow-sm"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Connect</span>
              </button>
            )}

            {/* Hamburger Menu - Exact reference image placement */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="w-9 h-9 rounded-xl bg-[#272B35] hover:bg-[#2D323E] active:scale-95 border border-white/[0.08] flex items-center justify-center text-white transition-all focus:outline-none"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-over Menu Drawer matching reference aesthetic */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="w-full max-w-xs bg-[#20232B] border-l border-white/10 h-full p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              {/* Drawer Top */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <SettleLogo size={26} />
                  <span className="font-display font-bold text-lg text-white">Settle</span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Wallet Card Inside Drawer */}
              <div className="bg-[#272B35] border border-white/[0.08] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-[#A0A5B1]">
                  <span>Nimiq Wallet</span>
                  <span className="flex items-center gap-1 text-[11px] text-[#F9B91D] font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {wallet ? 'Connected' : 'Not Connected'}
                  </span>
                </div>

                {wallet ? (
                  <div className="space-y-1.5">
                    <div className="text-sm font-semibold text-white truncate font-mono">
                      {wallet.address}
                    </div>
                    <div className="text-xs text-[#F9B91D] font-mono font-bold">
                      {wallet.balanceNim.toLocaleString()} NIM
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#A0A5B1] leading-relaxed">
                    Connect your Nimiq Pay wallet to initiate settlements and sign transactions.
                  </p>
                )}

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenWallet();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#F9B91D] hover:bg-[#E5A817] text-[#1E2129] font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>{wallet ? 'Manage Wallet' : 'Connect Nimiq Wallet'}</span>
                </button>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-[#A0A5B1] uppercase tracking-wider px-1">
                  Actions
                </div>

                {onOpenCreateTab && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenCreateTab();
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#272B35] hover:bg-[#2D323E] border border-white/[0.06] text-white text-xs font-semibold text-left transition-all"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#F9B91D]/15 text-[#F9B91D] flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span>Create a New Tab</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onNavigateHome();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#272B35] hover:bg-[#2D323E] border border-white/[0.06] text-white text-xs font-semibold text-left transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-white/[0.06] text-white flex items-center justify-center">
                    <Hash className="w-4 h-4" />
                  </div>
                  <span>Browse Shared Tabs</span>
                </button>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-white/[0.08] text-[11px] text-[#A0A5B1] space-y-1">
              <div className="font-semibold text-white">Settle for Nimiq Pay</div>
              <p>Continuous obligation netting & minimal debt settlements.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
