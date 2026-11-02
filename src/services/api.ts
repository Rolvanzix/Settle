import { Tab, Currency } from '../types';

export const api = {
  async getRecentTabs(ids: string[]): Promise<Tab[]> {
    if (!ids || ids.length === 0) return [];
    const query = encodeURIComponent(ids.join(','));
    const res = await fetch(`/api/tabs?ids=${query}`);
    if (!res.ok) return [];
    return res.json();
  },

  async getTab(idOrCode: string): Promise<Tab> {
    const res = await fetch(`/api/tabs/${encodeURIComponent(idOrCode.trim())}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Tab not found');
    }
    return res.json();
  },

  async createTab(params: {
    name: string;
    description?: string;
    coverImage?: string;
    currency: Currency;
    creatorAddress?: string;
    creatorName?: string;
  }): Promise<Tab> {
    const res = await fetch('/api/tabs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create tab');
    }
    return res.json();
  },

  async joinTab(idOrCode: string, params: {
    address: string;
    name?: string;
  }): Promise<{ tab: Tab; member: any; alreadyJoined: boolean }> {
    const res = await fetch(`/api/tabs/${encodeURIComponent(idOrCode.trim())}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to join tab');
    }
    return res.json();
  },

  async addMember(idOrCode: string, params: {
    address: string;
    name?: string;
  }): Promise<Tab> {
    const res = await fetch(`/api/tabs/${encodeURIComponent(idOrCode.trim())}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to add member');
    }
    return res.json();
  },

  async addExpense(idOrCode: string, params: {
    title: string;
    amount: number;
    currency: Currency;
    category: string;
    paidBy: string;
    splitAmong: string[];
    notes?: string;
    receiptImage?: string;
  }): Promise<{ tab: Tab; expense: any }> {
    const res = await fetch(`/api/tabs/${encodeURIComponent(idOrCode.trim())}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to add expense');
    }
    return res.json();
  },

  async deleteExpense(idOrCode: string, expenseId: string): Promise<Tab> {
    const res = await fetch(`/api/tabs/${encodeURIComponent(idOrCode.trim())}/expenses/${encodeURIComponent(expenseId)}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete expense');
    }
    return res.json();
  },

  async recordSettlement(idOrCode: string, params: {
    fromAddress: string;
    toAddress: string;
    fromName: string;
    toName: string;
    amount: number;
    currency: Currency;
    txHash?: string;
    note?: string;
  }): Promise<{ tab: Tab; settlement: any }> {
    const res = await fetch(`/api/tabs/${encodeURIComponent(idOrCode.trim())}/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to record settlement');
    }
    return res.json();
  },

  async resetSettlements(idOrCode: string): Promise<Tab> {
    const res = await fetch(`/api/tabs/${encodeURIComponent(idOrCode.trim())}/reset`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to reset settlements');
    }
    return res.json();
  },
};
