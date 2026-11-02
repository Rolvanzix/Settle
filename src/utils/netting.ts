import { Currency, Expense, SettlementPayment, Tab, TabMember, TabNettingResult, NetBalance, NettingTransfer } from '../types';

export const LUNA_PER_NIM = 100_000;
export const MICRO_PER_USDT = 1_000_000;

export function getUnitsPerToken(currency: Currency): number {
  return currency === 'NIM' ? LUNA_PER_NIM : MICRO_PER_USDT;
}

export function toIntegerUnits(amount: number, currency: Currency): number {
  const factor = getUnitsPerToken(currency);
  return Math.round(amount * factor);
}

export function toDecimalAmount(units: number, currency: Currency): number {
  const factor = getUnitsPerToken(currency);
  return Math.round((units / factor) * 10000) / 10000;
}

/**
 * Normalizes Nimiq address into standard spaced format
 * (e.g. NQ12 3456 7890 ABCD EFGH IJKL MNOP QRST)
 */
export function formatNimiqAddress(addr: string): string {
  if (!addr) return '';
  const clean = addr.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  if (!clean) return '';
  const parts: string[] = [];
  for (let i = 0; i < clean.length; i += 4) {
    parts.push(clean.slice(i, i + 4));
  }
  return parts.join(' ');
}

export function cleanAddress(addr: string): string {
  if (!addr) return '';
  return addr.replace(/\s+/g, '').toUpperCase();
}

export function isValidNimiqAddress(addr: string): boolean {
  const clean = cleanAddress(addr);
  return clean.startsWith('NQ') && clean.length === 36;
}

export function truncateAddress(addr: string, prefix = 6, suffix = 4): string {
  if (!addr) return '';
  const formatted = formatNimiqAddress(addr);
  if (formatted.length <= 14) return formatted;
  return `${formatted.slice(0, prefix)}...${formatted.slice(-suffix)}`;
}

/**
 * Proper Obligation Netting Engine
 * 
 * 1. Converts all transactions into precise integer units (Luna for NIM, micro-units for USDT).
 * 2. Credits each payer the exact integer amount.
 * 3. Debits each participant their exact share; remainder is distributed unit-by-unit so sum of all balances is strictly zero.
 * 4. Applies any settlements.
 * 5. Runs greedy debt simplification to find the absolute minimal set of bilateral payments.
 */
export function calculateNetting(tab: Tab, targetCurrency?: Currency): TabNettingResult {
  const currency = targetCurrency || tab.currency;
  const factor = getUnitsPerToken(currency);
  const members = tab.members;

  const memberMap = new Map<string, TabMember>();
  members.forEach(m => {
    memberMap.set(cleanAddress(m.address), m);
  });

  const getMemberName = (rawAddr: string): string => {
    const m = memberMap.get(cleanAddress(rawAddr));
    return m ? m.name : truncateAddress(rawAddr);
  };

  // Balances in integer units
  const netUnitsMap = new Map<string, number>();
  const totalPaidUnitsMap = new Map<string, number>();
  const totalShareUnitsMap = new Map<string, number>();

  members.forEach(m => {
    const key = cleanAddress(m.address);
    netUnitsMap.set(key, 0);
    totalPaidUnitsMap.set(key, 0);
    totalShareUnitsMap.set(key, 0);
  });

  // Filter expenses matching the target currency
  const relevantExpenses = tab.expenses.filter(e => e.currency === currency);
  let totalExpensesUnits = 0;
  let rawBilateralTxCount = 0;

  relevantExpenses.forEach(exp => {
    const amountUnits = toIntegerUnits(exp.amount, currency);
    totalExpensesUnits += amountUnits;

    const payerKey = cleanAddress(exp.paidBy);
    if (!netUnitsMap.has(payerKey)) {
      netUnitsMap.set(payerKey, 0);
      totalPaidUnitsMap.set(payerKey, 0);
      totalShareUnitsMap.set(payerKey, 0);
    }

    // Credit payer
    netUnitsMap.set(payerKey, (netUnitsMap.get(payerKey) || 0) + amountUnits);
    totalPaidUnitsMap.set(payerKey, (totalPaidUnitsMap.get(payerKey) || 0) + amountUnits);

    // Determine participants
    const participantKeys = (exp.splitAmong && exp.splitAmong.length > 0)
      ? exp.splitAmong.map(cleanAddress)
      : members.map(m => cleanAddress(m.address));

    const numParticipants = Math.max(1, participantKeys.length);
    const baseShare = Math.floor(amountUnits / numParticipants);
    let remainder = amountUnits % numParticipants;

    participantKeys.forEach((pKey, idx) => {
      // Allocate 1 extra unit to earliest participants until remainder is exhausted
      const participantShare = baseShare + (idx < remainder ? 1 : 0);

      if (!netUnitsMap.has(pKey)) {
        netUnitsMap.set(pKey, 0);
        totalPaidUnitsMap.set(pKey, 0);
        totalShareUnitsMap.set(pKey, 0);
      }

      netUnitsMap.set(pKey, (netUnitsMap.get(pKey) || 0) - participantShare);
      totalShareUnitsMap.set(pKey, (totalShareUnitsMap.get(pKey) || 0) + participantShare);

      if (pKey !== payerKey) {
        rawBilateralTxCount++;
      }
    });
  });

  // Account for completed settlements
  const relevantSettlements = (tab.settlements || []).filter(
    s => s.currency === currency && s.status === 'completed'
  );
  let totalSettledUnits = 0;

  relevantSettlements.forEach(settle => {
    const settleUnits = toIntegerUnits(settle.amount, currency);
    totalSettledUnits += settleUnits;

    const fromKey = cleanAddress(settle.fromAddress);
    const toKey = cleanAddress(settle.toAddress);

    // Sender relieved their debt (+credit)
    netUnitsMap.set(fromKey, (netUnitsMap.get(fromKey) || 0) + settleUnits);
    // Receiver received payout (-debit from what they are owed)
    netUnitsMap.set(toKey, (netUnitsMap.get(toKey) || 0) - settleUnits);
  });

  // Compile NetBalance list
  const allAddresses = Array.from(new Set([
    ...members.map(m => cleanAddress(m.address)),
    ...Array.from(netUnitsMap.keys()),
  ]));

  const netBalances: NetBalance[] = allAddresses.map(cleanAddr => {
    const units = netUnitsMap.get(cleanAddr) || 0;
    const paidUnits = totalPaidUnitsMap.get(cleanAddr) || 0;
    const shareUnits = totalShareUnitsMap.get(cleanAddr) || 0;
    const memberObj = memberMap.get(cleanAddr);
    const formatted = memberObj ? memberObj.address : formatNimiqAddress(cleanAddr);

    return {
      address: formatted,
      name: memberObj ? memberObj.name : truncateAddress(formatted),
      netUnits: units,
      netAmount: toDecimalAmount(units, currency),
      totalPaidUnits: paidUnits,
      totalPaidAmount: toDecimalAmount(paidUnits, currency),
      totalShareUnits: shareUnits,
      totalShareAmount: toDecimalAmount(shareUnits, currency),
    };
  });

  // Separate Debtors (netUnits < 0) and Creditors (netUnits > 0)
  interface Party {
    address: string;
    name: string;
    units: number;
  }

  const debtors: Party[] = [];
  const creditors: Party[] = [];

  netBalances.forEach(b => {
    if (b.netUnits < 0) {
      debtors.push({
        address: b.address,
        name: b.name,
        units: Math.abs(b.netUnits),
      });
    } else if (b.netUnits > 0) {
      creditors.push({
        address: b.address,
        name: b.name,
        units: b.netUnits,
      });
    }
  });

  // Greedy Debt Simplification
  const minimalTransfers: NettingTransfer[] = [];
  const dList = debtors.map(d => ({ ...d }));
  const cList = creditors.map(c => ({ ...c }));

  while (dList.length > 0 && cList.length > 0) {
    // Sort descending to match largest debtor with largest creditor
    dList.sort((a, b) => b.units - a.units);
    cList.sort((a, b) => b.units - a.units);

    const debtor = dList[0];
    const creditor = cList[0];

    const transferUnits = Math.min(debtor.units, creditor.units);

    if (transferUnits > 0) {
      minimalTransfers.push({
        fromAddress: debtor.address,
        fromName: debtor.name,
        toAddress: creditor.address,
        toName: creditor.name,
        units: transferUnits,
        amount: toDecimalAmount(transferUnits, currency),
        currency,
      });
    }

    debtor.units -= transferUnits;
    creditor.units -= transferUnits;

    if (debtor.units <= 0) {
      dList.shift();
    }
    if (creditor.units <= 0) {
      cList.shift();
    }
  }

  const savingsCount = Math.max(0, rawBilateralTxCount - minimalTransfers.length);

  return {
    tabId: tab.id,
    currency,
    netBalances,
    minimalTransfers,
    totalExpensesAmount: toDecimalAmount(totalExpensesUnits, currency),
    totalExpensesUnits,
    totalSettledAmount: toDecimalAmount(totalSettledUnits, currency),
    isFullySettled: minimalTransfers.length === 0,
    savingsCount,
  };
}
