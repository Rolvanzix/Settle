import React, { useEffect, useState, useCallback } from 'react';
import { Tab, WalletIdentity, NettingTransfer } from './types';
import { api } from './services/api';
import { nimiqWallet } from './services/nimiqWallet';
import { Header } from './components/Header';
import { TabsList } from './components/TabsList';
import { TabDetail } from './components/TabDetail';
import { WalletModal } from './components/WalletModal';
import { CreateTabModal } from './components/CreateTabModal';
import { AddExpenseModal } from './components/AddExpenseModal';
import { InviteModal } from './components/InviteModal';
import { SettleModal } from './components/SettleModal';
import { Loader2 } from 'lucide-react';

const RECENT_TABS_KEY = 'settle_recent_tab_ids';

export default function App() {
  const [wallet, setWallet] = useState<WalletIdentity | null>(null);
  const [recentTabs, setRecentTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<Tab | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isCreateTabOpen, setIsCreateTabOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [settlingTransfer, setSettlingTransfer] = useState<NettingTransfer | null>(null);

  // Helper to persist tab ID to user's local history
  const rememberTabId = useCallback((id: string) => {
    try {
      const stored = localStorage.getItem(RECENT_TABS_KEY);
      const list: string[] = stored ? JSON.parse(stored) : [];
      const updated = [id, ...list.filter(item => item !== id)].slice(0, 20);
      localStorage.setItem(RECENT_TABS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }, []);

  // Subscribe to wallet changes
  useEffect(() => {
    const unsubscribe = nimiqWallet.subscribe((identity) => {
      setWallet(identity);
    });
    nimiqWallet.initialize().catch(err => {
      console.warn('Wallet initialization note:', err);
    });
    return unsubscribe;
  }, []);

  // Fetch tab by link / query param or load user's recent tabs
  useEffect(() => {
    const initApp = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams(window.location.search);
        const urlTab = params.get('tab') || params.get('code');

        if (urlTab) {
          // Open direct link or code
          try {
            const tab = await api.getTab(urlTab);
            setActiveTab(tab);
            rememberTabId(tab.id);
          } catch (e) {
            console.warn('Could not find tab from URL:', urlTab);
            window.history.replaceState(null, '', window.location.pathname);
          }
        }

        // Fetch recent tabs for this browser session
        const stored = localStorage.getItem(RECENT_TABS_KEY);
        const ids: string[] = stored ? JSON.parse(stored) : [];
        if (ids.length > 0) {
          const loaded = await api.getRecentTabs(ids);
          setRecentTabs(loaded);
        }
      } catch (err) {
        console.error('App init error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, [rememberTabId]);

  const handleTabCreated = (newTab: Tab) => {
    rememberTabId(newTab.id);
    setRecentTabs(prev => [newTab, ...prev.filter(t => t.id !== newTab.id)]);
    setActiveTab(newTab);
    window.history.replaceState(null, '', `?tab=${newTab.id}`);
  };

  const handleTabUpdated = (updatedTab: Tab) => {
    setActiveTab(updatedTab);
    setRecentTabs(prev => prev.map(t => t.id === updatedTab.id ? updatedTab : t));
  };

  const handleSelectTab = (tab: Tab) => {
    rememberTabId(tab.id);
    setActiveTab(tab);
    window.history.replaceState(null, '', `?tab=${tab.id}`);
  };

  const handleNavigateHome = () => {
    setActiveTab(null);
    window.history.replaceState(null, '', window.location.pathname);
  };

  const handleJoinByCodeOrLink = async (input: string) => {
    // Extract code or tab query param if full URL was pasted
    let target = input.trim();
    if (target.includes('?')) {
      try {
        const url = new URL(target, window.location.origin);
        target = url.searchParams.get('tab') || url.searchParams.get('code') || target;
      } catch {
        // ignore
      }
    }

    const tab = await api.getTab(target);
    rememberTabId(tab.id);
    setActiveTab(tab);
    setRecentTabs(prev => [tab, ...prev.filter(t => t.id !== tab.id)]);
    window.history.replaceState(null, '', `?tab=${tab.id}`);
  };

  return (
    <div className="min-h-screen bg-[#20232B] text-white flex flex-col font-sans selection:bg-[#F9B91D] selection:text-[#1A1D24] relative overflow-x-hidden">
      {/* Subtle background ambient glows matching reference poster */}
      <div className="fixed -bottom-24 -left-24 w-72 h-72 bg-[#F9B91D] rounded-full filter blur-[100px] opacity-10 pointer-events-none" />
      <div className="fixed -top-24 -right-24 w-80 h-80 bg-white rounded-full filter blur-[120px] opacity-[0.03] pointer-events-none" />

      {/* Top Header */}
      <Header
        wallet={wallet}
        onOpenWallet={() => setIsWalletOpen(true)}
        onNavigateHome={handleNavigateHome}
        onOpenCreateTab={() => setIsCreateTabOpen(true)}
        activeTabTitle={activeTab?.name}
      />

      {/* Main View Container */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 pt-3 sm:pt-5 relative z-10">
        {isLoading ? (
          <div className="py-28 text-center space-y-3">
            <Loader2 className="w-7 h-7 animate-spin text-[#F9B91D] mx-auto" />
            <p className="text-xs text-[#A0A5B1]">Loading Settle...</p>
          </div>
        ) : activeTab ? (
          <TabDetail
            tab={activeTab}
            wallet={wallet}
            onBack={handleNavigateHome}
            onOpenAddExpense={() => setIsAddExpenseOpen(true)}
            onOpenInvite={() => setIsInviteOpen(true)}
            onOpenConnectWallet={() => setIsWalletOpen(true)}
            onOpenSettleTransfer={(transfer) => setSettlingTransfer(transfer)}
            onTabUpdated={handleTabUpdated}
          />
        ) : (
          <TabsList
            recentTabs={recentTabs}
            wallet={wallet}
            onSelectTab={handleSelectTab}
            onCreateTab={() => setIsCreateTabOpen(true)}
            onJoinByCodeOrLink={handleJoinByCodeOrLink}
          />
        )}
      </main>

      {/* Modals */}
      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        wallet={wallet}
      />

      <CreateTabModal
        isOpen={isCreateTabOpen}
        onClose={() => setIsCreateTabOpen(false)}
        wallet={wallet}
        onTabCreated={handleTabCreated}
      />

      {activeTab && (
        <>
          <AddExpenseModal
            isOpen={isAddExpenseOpen}
            onClose={() => setIsAddExpenseOpen(false)}
            tab={activeTab}
            wallet={wallet}
            onExpenseAdded={handleTabUpdated}
          />

          <InviteModal
            isOpen={isInviteOpen}
            onClose={() => setIsInviteOpen(false)}
            tab={activeTab}
            onMemberAdded={handleTabUpdated}
          />

          <SettleModal
            isOpen={Boolean(settlingTransfer)}
            onClose={() => setSettlingTransfer(null)}
            transfer={settlingTransfer}
            tab={activeTab}
            wallet={wallet}
            onSettlementComplete={handleTabUpdated}
          />
        </>
      )}
    </div>
  );
}
