import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { Tab, TabMember, Expense, SettlementPayment } from './src/types/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'tabs_store.json');

app.use(express.json());

// In-memory store (empty by default, completely private)
let tabsStore: Record<string, Tab> = {};

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      // Clean up any legacy mock tabs if present
      delete parsed['alpine-cabin-2026'];
      delete parsed['devcon-berlin-usdt'];
      tabsStore = parsed;
    } else {
      tabsStore = {};
      saveData();
    }
  } catch (e) {
    tabsStore = {};
  }
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tabsStore, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to persist tabs:', e);
  }
}

// Generate friendly 6-character short code without ambiguous characters
function generateShortCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 6; i++) {
    const idx = crypto.randomInt(0, chars.length);
    code += chars[idx];
  }
  return code;
}

loadData();

// Helper to look up a tab by ID or by 6-char short code
function findTab(idOrCode: string): Tab | undefined {
  if (!idOrCode) return undefined;
  const clean = idOrCode.trim();
  // Check direct key
  if (tabsStore[clean]) return tabsStore[clean];
  // Check by short code (case insensitive)
  const upperCode = clean.toUpperCase();
  return Object.values(tabsStore).find(
    t => t.id === clean || t.code?.toUpperCase() === upperCode
  );
}

// List user's known tabs by IDs (private access model)
app.get('/api/tabs', (req, res) => {
  const idsQuery = req.query.ids as string | undefined;
  if (!idsQuery) {
    // Tabs are private by default: return empty array unless specific private IDs are requested
    return res.json([]);
  }

  const requestedIds = idsQuery.split(',').map(s => s.trim());
  const userTabs = requestedIds
    .map(id => findTab(id))
    .filter((t): t is Tab => Boolean(t))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  res.json(userTabs);
});

// Create new private tab
app.post('/api/tabs', (req, res) => {
  const { name, description, currency, creatorAddress, creatorName, coverImage } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Tab name is required' });
  }

  const tabId = 'tab_' + crypto.randomBytes(8).toString('hex');
  const shortCode = generateShortCode();
  const now = new Date().toISOString();

  const members: TabMember[] = [];
  if (creatorAddress && creatorAddress.trim()) {
    members.push({
      address: creatorAddress.trim(),
      name: creatorName?.trim() || 'Creator',
      avatarColor: '#F5A623',
      joinedAt: now,
    });
  }

  const newTab: Tab = {
    id: tabId,
    code: shortCode,
    name: name.trim(),
    description: description ? description.trim() : '',
    coverImage: coverImage ? coverImage.trim() : '/assets/aistudio/file_00000000374881f5983b64890efd45c2_4b6a22b6.png',
    currency: currency === 'USDT' ? 'USDT' : 'NIM',
    createdAt: now,
    updatedAt: now,
    createdBy: creatorAddress?.trim() || 'anonymous',
    members,
    expenses: [],
    settlements: [],
  };

  tabsStore[tabId] = newTab;
  saveData();
  res.status(201).json(newTab);
});

// Get single private tab by ID or short code
app.get('/api/tabs/:idOrCode', (req, res) => {
  const tab = findTab(req.params.idOrCode);
  if (!tab) {
    return res.status(404).json({ error: 'Tab not found. Check the link or short code.' });
  }
  res.json(tab);
});

// Join tab with Nimiq address
app.post('/api/tabs/:idOrCode/join', (req, res) => {
  const tab = findTab(req.params.idOrCode);
  if (!tab) {
    return res.status(404).json({ error: 'Tab not found' });
  }

  const { address, name } = req.body;
  if (!address || !address.trim()) {
    return res.status(400).json({ error: 'Address is required to join' });
  }

  const cleanAddr = address.trim();
  const existing = tab.members.find(
    m => m.address.replace(/\s+/g, '') === cleanAddr.replace(/\s+/g, '')
  );

  if (existing) {
    if (name && name.trim() && existing.name !== name.trim()) {
      existing.name = name.trim();
      tab.updatedAt = new Date().toISOString();
      saveData();
    }
    return res.json({ tab, member: existing, alreadyJoined: true });
  }

  const colors = ['#F5A623', '#10B981', '#6366F1', '#EC4899', '#06B6D4', '#8B5CF6'];
  const avatarColor = colors[tab.members.length % colors.length];

  const newMember: TabMember = {
    address: cleanAddr,
    name: name?.trim() || `Member ${tab.members.length + 1}`,
    avatarColor,
    joinedAt: new Date().toISOString(),
  };

  tab.members.push(newMember);
  tab.updatedAt = new Date().toISOString();
  saveData();

  res.status(201).json({ tab, member: newMember, alreadyJoined: false });
});

// Add member by address
app.post('/api/tabs/:idOrCode/members', (req, res) => {
  const tab = findTab(req.params.idOrCode);
  if (!tab) {
    return res.status(404).json({ error: 'Tab not found' });
  }

  const { address, name } = req.body;
  if (!address || !address.trim()) {
    return res.status(400).json({ error: 'Address is required' });
  }

  const cleanAddr = address.trim();
  const existing = tab.members.find(
    m => m.address.replace(/\s+/g, '') === cleanAddr.replace(/\s+/g, '')
  );

  if (existing) {
    return res.status(400).json({ error: 'Member is already in this tab' });
  }

  const colors = ['#F5A623', '#10B981', '#6366F1', '#EC4899', '#06B6D4', '#8B5CF6'];
  const avatarColor = colors[tab.members.length % colors.length];

  const newMember: TabMember = {
    address: cleanAddr,
    name: name?.trim() || `Friend ${tab.members.length + 1}`,
    avatarColor,
    joinedAt: new Date().toISOString(),
  };

  tab.members.push(newMember);
  tab.updatedAt = new Date().toISOString();
  saveData();

  res.status(201).json(tab);
});

// Add expense
app.post('/api/tabs/:idOrCode/expenses', (req, res) => {
  const tab = findTab(req.params.idOrCode);
  if (!tab) {
    return res.status(404).json({ error: 'Tab not found' });
  }

  const { title, amount, currency, category, paidBy, splitAmong, notes, receiptImage } = req.body;
  if (!title || !amount || !paidBy) {
    return res.status(400).json({ error: 'Title, amount, and payer are required' });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be greater than zero' });
  }

  const newExpense: Expense = {
    id: 'exp_' + crypto.randomBytes(6).toString('hex'),
    tabId: tab.id,
    title: title.trim(),
    amount: parsedAmount,
    currency: currency || tab.currency,
    category: category || 'other',
    paidBy: paidBy.trim(),
    splitAmong: Array.isArray(splitAmong) && splitAmong.length > 0 
      ? splitAmong.map((s: string) => s.trim()) 
      : tab.members.map(m => m.address),
    createdAt: new Date().toISOString(),
    notes: notes ? notes.trim() : undefined,
    receiptImage: receiptImage ? receiptImage.trim() : undefined,
  };

  tab.expenses.unshift(newExpense);
  tab.updatedAt = new Date().toISOString();
  saveData();

  res.status(201).json({ tab, expense: newExpense });
});

// Delete expense
app.delete('/api/tabs/:idOrCode/expenses/:expenseId', (req, res) => {
  const tab = findTab(req.params.idOrCode);
  if (!tab) {
    return res.status(404).json({ error: 'Tab not found' });
  }

  const initialLen = tab.expenses.length;
  tab.expenses = tab.expenses.filter(e => e.id !== req.params.expenseId);

  if (tab.expenses.length === initialLen) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  tab.updatedAt = new Date().toISOString();
  saveData();

  res.json(tab);
});

// Record settlement payment
app.post('/api/tabs/:idOrCode/settle', (req, res) => {
  const tab = findTab(req.params.idOrCode);
  if (!tab) {
    return res.status(404).json({ error: 'Tab not found' });
  }

  const { fromAddress, toAddress, fromName, toName, amount, currency, txHash, note } = req.body;
  if (!fromAddress || !toAddress || !amount) {
    return res.status(400).json({ error: 'fromAddress, toAddress, and amount are required' });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be positive' });
  }

  const newSettlement: SettlementPayment = {
    id: 'stl_' + crypto.randomBytes(6).toString('hex'),
    tabId: tab.id,
    fromAddress: fromAddress.trim(),
    toAddress: toAddress.trim(),
    fromName: fromName || fromAddress.slice(0, 8),
    toName: toName || toAddress.slice(0, 8),
    amount: parsedAmount,
    currency: currency || tab.currency,
    txHash: txHash || undefined,
    settledAt: new Date().toISOString(),
    status: 'completed',
    note: note || undefined,
  };

  tab.settlements.unshift(newSettlement);
  tab.updatedAt = new Date().toISOString();
  saveData();

  res.status(201).json({ tab, settlement: newSettlement });
});

// Reset settlements
app.post('/api/tabs/:idOrCode/reset', (req, res) => {
  const tab = findTab(req.params.idOrCode);
  if (!tab) {
    return res.status(404).json({ error: 'Tab not found' });
  }

  tab.settlements = [];
  tab.updatedAt = new Date().toISOString();
  saveData();

  res.json(tab);
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, port: Number(PORT), host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Settle server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
