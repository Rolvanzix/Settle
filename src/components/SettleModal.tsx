import React, { useState } from 'react';
import { X, ArrowRight, CheckCircle2, AlertCircle, Loader2, Check, ExternalLink, QrCode } from 'lucide-react';
import { Currency, Tab, WalletIdentity, NettingTransfer } from '../types';
import { nimiqWallet } from '../services/nimiqWallet';
import { api } from '../services/api';
import { truncateAddress, LUNA_PER_NIM } from '../utils/netting';
import { SettleLogo } from './SettleLogo';

interface SettleModalProps {
  isOpen: boolean;
  onClose: () => void;
  transfer: NettingTransfer | null;
  tab: Tab;
  wallet: WalletIdentity | null;
  onSettlementComplete: (updatedTab: Tab) => void;
}

export const SettleModal: React.FC<SettleModalProps> = ({
  isOpen,
  onClose,
  transfer,
  tab,
  wallet,
  onSettlementComplete,
}) => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [txHash, setTxHash] = useState('');
  const [deepLink, setDeepLink] = useState('');

  if (!isOpen || !transfer) return null;

  const lunaValue = transfer.currency === 'NIM' ? Math.round(transfer.amount * LUNA_PER_NIM) : null;

  const handleConfirmPay = async () => {
    try {
      setStatus('processing');
      setErrorMsg('');

      const paymentResult = await nimiqWallet.sendPayment({
        recipient: transfer.toAddress,
        amount: transfer.amount,
        currency: transfer.currency,
        tabName: tab.name,
        tabId: tab.id,
      });

      if (paymentResult.deepLink && !nimiqWallet.isInsideNimiqPay()) {
        setDeepLink(paymentResult.deepLink);
      }

      const res = await api.recordSettlement(tab.id, {
        fromAddress: transfer.fromAddress,
        toAddress: transfer.toAddress,
        fromName: transfer.fromName,
        toName: transfer.toName,
        amount: transfer.amount,
        currency: transfer.currency,
        txHash: paymentResult.txHash,
        note: `Settled via Nimiq Pay`,
      });

      setTxHash(paymentResult.txHash);
      setStatus('success');
      onSettlementComplete(res.tab);
    } catch (err: any) {
      console.error('Payment error:', err);
      setStatus('error');
      setErrorMsg(err?.message || 'Payment was cancelled or failed to process.');
    }
  };

  const handleMarkAsPaidOffline = async () => {
    try {
      setStatus('processing');
      const manualId = `offline_${Date.now()}`;
      const res = await api.recordSettlement(tab.id, {
        fromAddress: transfer.fromAddress,
        toAddress: transfer.toAddress,
        fromName: transfer.fromName,
        toName: transfer.toName,
        amount: transfer.amount,
        currency: transfer.currency,
        txHash: manualId,
        note: `Marked as settled manually`,
      });
      setTxHash(manualId);
      setStatus('success');
      onSettlementComplete(res.tab);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record settlement');
      setStatus('error');
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
            <span className="font-display font-extrabold text-base text-white">
              Settle Balance
            </span>
          </div>
          <button
            onClick={onClose}
            disabled={status === 'processing'}
            className="w-8 h-8 rounded-full bg-white/[0.06] text-[#A0A5B1] hover:text-white flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {status === 'success' ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#F9B91D]/15 text-[#F9B91D] flex items-center justify-center mx-auto">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-display font-extrabold text-white">
                  Payment Recorded
                </h4>
                <p className="text-xs text-[#A0A5B1] max-w-xs mx-auto">
                  {transfer.amount} {transfer.currency} from {transfer.fromName} to {transfer.toName} has been settled.
                </p>
              </div>

              {deepLink && (
                <div className="p-3 bg-[#20232B] border border-white/[0.08] rounded-xl text-left space-y-2">
                  <span className="text-[10px] text-[#A0A5B1] uppercase tracking-wider block font-bold">
                    Nimiq Pay Deep Link
                  </span>
                  <a
                    href={deepLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono text-[#F9B91D] hover:underline break-all block"
                  >
                    Open in Nimiq Pay App →
                  </a>
                </div>
              )}

              {txHash && (
                <div className="bg-[#20232B] border border-white/[0.08] rounded-xl p-3 text-left space-y-1">
                  <span className="text-[10px] text-[#6B7280] uppercase tracking-wider block font-bold">
                    Receipt Identifier
                  </span>
                  <p className="text-xs font-mono text-[#F9B91D] break-all">
                    {txHash}
                  </p>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full py-3.5 bg-[#F9B91D] hover:bg-[#E5A817] text-[#1A1D24] font-extrabold text-sm rounded-2xl transition-all shadow-lg shadow-[#F9B91D]/20 cursor-pointer"
              >
                Return to Tab
              </button>
            </div>
          ) : (
            <>
              {/* Transfer Parties Strip */}
              <div className="bg-[#20232B] border border-white/[0.08] rounded-2xl p-4 space-y-3 shadow-inner">
                <div className="flex items-center justify-between text-xs">
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <span className="text-[10px] text-[#A0A5B1] uppercase tracking-wider block font-semibold">
                      Payer
                    </span>
                    <span className="font-bold text-white block truncate">
                      {transfer.fromName}
                    </span>
                    <span className="font-mono text-[10px] text-[#6B7280] block truncate">
                      {truncateAddress(transfer.fromAddress)}
                    </span>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-white/[0.06] text-[#F9B91D] flex items-center justify-center shrink-0 mx-2">
                    <ArrowRight className="w-4 h-4" />
                  </div>

                  <div className="space-y-0.5 min-w-0 flex-1 text-right">
                    <span className="text-[10px] text-[#A0A5B1] uppercase tracking-wider block font-semibold">
                      Recipient
                    </span>
                    <span className="font-bold text-white block truncate">
                      {transfer.toName}
                    </span>
                    <span className="font-mono text-[10px] text-[#6B7280] block truncate">
                      {truncateAddress(transfer.toAddress)}
                    </span>
                  </div>
                </div>

                {/* Big Calm Hero Amount */}
                <div className="pt-3 border-t border-white/[0.06] text-center">
                  <span className="text-[10px] text-[#A0A5B1] uppercase tracking-wider block font-bold">
                    Settlement Amount
                  </span>
                  <div className="flex items-baseline justify-center gap-1.5 mt-0.5">
                    <span className="text-4xl font-display font-extrabold text-white tabular-nums tracking-tight">
                      {transfer.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                    </span>
                    <span className="text-sm font-bold text-[#F9B91D] font-mono">
                      {transfer.currency}
                    </span>
                  </div>
                  {lunaValue !== null && (
                    <span className="text-[10px] font-mono text-[#A0A5B1] block mt-0.5">
                      = {lunaValue.toLocaleString()} Luna
                    </span>
                  )}
                </div>
              </div>

              {/* Transfer Details */}
              <div className="space-y-2 text-xs divide-y divide-white/[0.06]">
                <div className="flex justify-between py-1 text-[#A0A5B1]">
                  <span>Network</span>
                  <span className="text-white font-semibold">Nimiq Pay</span>
                </div>
                <div className="flex justify-between py-1 text-[#A0A5B1]">
                  <span>Network Fee</span>
                  <span className="text-[#34D399] font-bold font-mono">Free / &lt; 0.001 NIM</span>
                </div>
                <div className="flex justify-between py-1 text-[#A0A5B1]">
                  <span>Tab</span>
                  <span className="text-white font-medium truncate max-w-[200px]">{tab.name}</span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-[#F87171]/15 border border-[#F87171]/30 rounded-xl flex items-start gap-2.5 text-xs text-[#F87171]">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleConfirmPay}
                  disabled={status === 'processing'}
                  className="w-full py-3.5 bg-[#F9B91D] hover:bg-[#E5A817] active:scale-[0.98] text-[#1A1D24] font-extrabold text-sm rounded-2xl transition-all shadow-lg shadow-[#F9B91D]/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {status === 'processing' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#1A1D24]" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <span>Pay {transfer.amount} {transfer.currency} with Nimiq Pay</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleMarkAsPaidOffline}
                  disabled={status === 'processing'}
                  className="w-full py-2 text-xs text-[#A0A5B1] hover:text-white font-semibold text-center transition-colors cursor-pointer"
                >
                  Already paid? Mark settled
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
