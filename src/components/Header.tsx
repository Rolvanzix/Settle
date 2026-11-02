import React from 'react';
import { Wallet, ChevronDown, Check } from 'lucide-react';
import { WalletIdentity } from '../types';
import { SettleLogo } from './SettleLogo';
import { truncateAddress } from '../utils/netting';

interface HeaderProps {
  wallet: WalletIdentity | null;
  onOpenWallet: () => void;
  onNavigateHome: () => void;
  activeTabTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  wallet,
  onOpenWallet,
  onNavigateHome,
  activeTabTitle,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#0E0E12]/90 backdrop-blur-xl border-b border-white/[0.06] px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 group text-left focus:outline-none"
          aria-label="Settle Home"
        >
          <div className="group-hover:scale-105 active:scale-95 transition-transform duration-200">
            <SettleLogo size={28} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-lg text-white tracking-tight">
              Settle
            </span>
            {activeTabTitle ? (
              <span className="text-xs text-[#8E8E9B] truncate max-w-[140px] sm:max-w-[200px]">
                / {activeTabTitle}
              </span>
            ) : (
              <span className="text-[11px] font-medium text-[#646473] hidden xs:inline tracking-wider uppercase">
                Pay
              </span>
            )}
          </div>
        </button>

        {/* Right Zone: Quiet, Luxury Wallet Pill */}
        <div>
          {wallet ? (
            <button
              onClick={onOpenWallet}
              className="flex items-center gap-2.5 bg-[#16161C] hover:bg-[#1C1C24] active:bg-[#20202A] border border-white/[0.08] rounded-full pl-3 pr-2.5 py-1.5 transition-all text-xs focus:outline-none focus:ring-1 focus:ring-[#F5A623]/40"
            >
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F5A623]" />
                <span className="font-medium text-[#E4E4EB] max-w-[90px] truncate">
                  {wallet.displayName}
                </span>
              </div>
              <div className="h-3.5 w-px bg-white/10" />
              <span className="font-mono tabular-nums text-[#F5A623] font-medium text-[11px]">
                {wallet.balanceNim.toLocaleString(undefined, { maximumFractionDigits: 0 })} NIM
              </span>
              <ChevronDown className="w-3 h-3 text-[#6E6E7C]" />
            </button>
          ) : (
            <button
              onClick={onOpenWallet}
              className="flex items-center gap-1.5 bg-[#F5A623] hover:bg-[#E2971A] text-[#0E0E12] font-semibold px-3.5 py-1.5 rounded-full text-xs transition-all shadow-sm"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Connect</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
