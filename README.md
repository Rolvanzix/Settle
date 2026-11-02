# Settle

A mobile-first continuous group obligation netting application built for the Nimiq Pay ecosystem.

Settle enables groups—such as travel companions, roommates, event organizers, and colleagues—to maintain shared financial tabs. Participants can record expenses over time, track who paid, split costs among members, monitor real-time net balances, and settle debts with the minimal number of payments using Nimiq Pay.

---

## Architectural Relationship: Settle and Nimiq Pay

It is important to understand the boundary between Settle and the Nimiq Pay infrastructure:

```
+-------------------------------------------------------------------------+
|                                 SETTLE                                  |
|                           (Application Layer)                           |
|                                                                         |
|  * Shared Tabs & Members            * Multi-currency (NIM & USDT)       |
|  * Expense Recording & Splitting    * Netting Engine & Debt Reduction   |
|  * Receipt Attachments              * Settlement Record Keeping         |
+-------------------------------------------------------------------------+
                                     |
                         Settlement Recommendation
                       (Recipient, Luna Amount, Memo)
                                     v
+-------------------------------------------------------------------------+
|                               NIMIQ PAY                                 |
|                       (Payment Infrastructure)                          |
|                                                                         |
|  * User Key Management & Custody    * Transaction Signing & Proofs      |
|  * Mini App SDK Provider Injection  * Blockchain Broadcast & Settlement |
|  * Nimiq Hub Web API                * Fiat & Balance Queries            |
+-------------------------------------------------------------------------+
```

- **Settle is the application layer.** It manages shared tabs, members, expense allocation, continuous balance calculations, debt simplification recommendations, and settlement records.
- **Nimiq Pay is the payment infrastructure.** It provides the non-custodial wallet runtime, account identity, transaction signing, and blockchain broadcast capabilities.
- **Settle calculates obligation states.** It determines who owes whom and the exact amount needed to clear balances.
- **Nimiq Pay authorizes and executes payments.** Users review and approve payments within their wallet.
- **Settle verifies and logs settlements.** Upon payment completion, Settle records the transaction hash and updates the remaining balance sheet.

> **Note:** Settle is **not** a payment network, custom blockchain protocol, or smart contract. It does not deploy or require custom smart contracts. Its operations are executed through client-side interfaces, shared state management via a lightweight Express backend, a deterministic debt netting engine, and standard Nimiq wallet APIs.

---

## Problem Statement

When groups share expenses over multiple days or weeks, traditional expense tracking creates friction:

1. **Lost Records & Calculation Overhead:** Keeping manual tallies across dining, lodging, transit, and groceries leads to calculation errors and forgotten debts.
2. **Bilateral Payment Clutter:** Without debt simplification, $N$ people incurring expenses across a trip generate dozens of fragmented, back-and-forth micro-payments.
3. **Tracking vs. Settling Gap:** Traditional expense apps record that someone owes money, but require users to switch to separate banking or crypto apps to copy addresses, recalculate conversion rates, and manually verify that transfers happened.
4. **Rounding Errors:** Floating-point approximations in financial apps introduce phantom fractions of cents or Luna tokens over dozens of transactions.

Settle solves this by combining integer-precise debt netting with direct wallet integration inside the Nimiq ecosystem.

---

## What Settle Does

- **Create Private Shared Tabs:** Start a named tab (e.g., "Alps Ski Trip 2026") in NIM or USDT with cover photos and a 6-character short code.
- **Invite & Add Members:** Group members join via private link or by entering their Nimiq address (`NQ.. ....`).
- **Record Multi-Party Expenses:** Log expenses with category tags, custom split participants, notes, and receipt images.
- **Track Payer & Shares:** Credit the payer and apportion debit shares equally or selectively among participants.
- **Calculate Live Net Positions:** Instantly compute each member's total paid, total consumed share, and net positive (creditor) or negative (debtor) position.
- **Generate Optimal Settlement Plans:** Execute a greedy debt simplification algorithm to consolidate group obligations into the absolute minimum number of bilateral payments.
- **Execute Direct Payments:** Launch native Nimiq Pay transactions via `@nimiq/mini-app-sdk`, Nimiq Hub (`@nimiq/hub-api`), or fallback deep links.
- **Maintain Tab History:** Keep a permanent log of all expenses and verified settlements. Tabs remain active and dynamic as new expenses are added over time.

---

## Key Features

### Shared Tabs
- **Private Link & Code Access:** Tabs are private by default. Access is granted through unique URL parameters (`?tab=...` or `/tab/:idOrCode`) or a 6-character alphanumeric short code.
- **Photographic Themes:** Tab cover presets for Alpine/Mountain, City Dining, Roadtrips, Beach Getaways, and Living/Rent, plus custom image URL support.
- **Member Management:** Add participants by Nimiq address and display name with assigned color avatars.

### Expense Management
- **Category Tagging:** Visual category badges for Food & Dining, Accommodation, Groceries, Transport, Activities, Drinks, and Other.
- **Flexible Participant Splitting:** Select all group members or a specific subset for any expense.
- **Receipt Capture:** Attach photographic receipts (file upload or image URL) with an integrated modal lightbox viewer.
- **Zero Drift Integer Math:** Remainder units are distributed systematically unit-by-unit to guarantee that the sum of all participant shares equals the total expense.

### Balance Calculation & Netting
- **Creditor & Debtor Separation:** Transparently distinguishes members who are owed funds from members who need to pay.
- **Bilateral Debt Consolidation:** Eliminates circular and redundant transfers (e.g., if A owes B 50 NIM and B owes C 50 NIM, Settle instructs A to pay C directly).
- **Transaction Savings Counter:** Highlights how many unnecessary individual payments were eliminated by the netting engine.

### Payments
- **Nimiq Pay Mini App SDK Integration:** Detects injected provider (`init()`) when running inside Nimiq Pay WebView.
- **Nimiq Hub Popup Integration:** Provides full wallet selection and checkout popups via `@nimiq/hub-api` when running in standard web browsers.
- **Payment Fallback:** Generates standardized `nimiq:<address>?amount=<luna>&message=<memo>` deep link URIs for external wallet applications.
- **Settlement Verification & Logging:** Records transaction hashes (`txHash`), timestamps, payer, and payee upon completion.

### History & Auditing
- **Expense Log:** Chronological expense ledger with delete actions and receipt inspection.
- **Settlement Ledger:** Records completed settlement transactions with transaction hashes and timestamps.
- **Reset Capability:** Allows clearing historical settlement markers to recalculate balances from scratch if needed.

---

## Application Architecture

```mermaid
flowchart TD
    subgraph Client [Client Application - React 19 + Vite]
        UI[Settle Mobile UI]
        WM[WalletModal / Header]
        TL[TabsList & TabDetail]
        AEM[AddExpenseModal]
        SM[SettleModal]
        Netting[Netting Engine - Integer Luna Math]
        WalletService[NimiqWalletService]
    end

    subgraph WalletInfra [Nimiq Wallet Infrastructure]
        SDK[@nimiq/mini-app-sdk]
        Hub[@nimiq/hub-api]
        NPay[Nimiq Pay Native App]
        NChain[Nimiq Blockchain]
    end

    subgraph Backend [Full-Stack Node.js / Express Server]
        API[Express REST API]
        Store[(tabs_store.json)]
    end

    UI --> WM
    UI --> TL
    TL --> AEM
    TL --> SM
    
    AEM -->|Add Expense| API
    TL -->|Read Tab State| API
    API -->|Persist / Read| Store
    
    TL -->|Compute Net Balances| Netting
    SM -->|Get Minimal Payments| Netting
    
    WM --> WalletService
    SM -->|Execute Transfer| WalletService
    
    WalletService -->|Inside Nimiq Pay| SDK
    WalletService -->|In Web Browser| Hub
    SDK --> NPay
    Hub --> NChain
    NPay --> NChain
    
    NPay -.->|Transaction Result / Hash| WalletService
    Hub -.->|Checkout Hash| WalletService
    WalletService -->|POST /settle with txHash| API
    API -->|Save Settlement| Store
    Store -->|Updated State| TL
```

### Component Responsibilities

1. **`src/services/nimiqWallet.ts`:**
   - Detects execution environment (Nimiq Pay WebView vs. Web Browser).
   - In Nimiq Pay: Initializes `@nimiq/mini-app-sdk`, queries active accounts and Luna balance.
   - In Web Browser: Uses `@nimiq/hub-api` to open `https://hub.nimiq.com` for account selection and payment checkout.
   - Dispatches transactions via `sendBasicTransactionWithData` or `hubApi.checkout`.
2. **`src/utils/netting.ts`:**
   - Obligation netting engine. Converts all amounts into integer atomic units (`Luna` for NIM: $10^5$, micro-units for USDT: $10^6$).
   - Computes net positions and runs the greedy bilateral debt simplification algorithm.
3. **`server.ts`:**
   - Express server hosting REST endpoints (`/api/tabs`, `/api/tabs/:idOrCode/expenses`, `/api/tabs/:idOrCode/settle`).
   - Serves the Vite frontend in development and production.
   - Manages persistence to `tabs_store.json`.
4. **`src/services/api.ts`:**
   - Type-safe HTTP client connecting client components with the Express backend.
5. **`src/components/`:**
   - Native mobile-first UI components styled with Tailwind CSS, featuring tab overviews, receipt attachments, balance cards, and settlement modals.

---

## Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend Framework** | React 19 (`react`, `react-dom` `^19.0.1`) | Functional components, custom hooks, React 19 compatibility |
| **Language** | TypeScript (`typescript` `^7.0.2`) | Strict typing across data structures, balances, and APIs |
| **Bundler & Dev Server** | Vite 8 (`vite` `^8.3.0`, `@vitejs/plugin-react` `^6.1.1`) | Rapid HMR-capable bundling with ES2022 output |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/vite` `^4.3.3`) | Modern `@import "tailwindcss";` styling with mobile-first dark aesthetic |
| **Icons & Motion** | `lucide-react` `^0.546.0`, `motion` `^12.23.24` | Minimalist financial UI icons and fluid micro-interactions |
| **Nimiq Pay SDK** | `@nimiq/mini-app-sdk` `^0.2.4` | Provider initialization, account listing, balance checks, transactions |
| **Nimiq Hub API** | `@nimiq/hub-api` `^1.16.0` | Browser popup account selection (`chooseAddress`) and payments (`checkout`) |
| **Backend Runtime** | Express 4 (`express` `^4.21.2`), `tsx` `^4.21.0` | REST API with integrated Vite middleware |
| **Persistence** | File-backed JSON store (`tabs_store.json`) | In-memory cache with atomic file writes |
| **Client Storage** | Browser `localStorage` | Client-side tab bookmarking (`settle_recent_tabs`) and wallet cache |

---

## How Settle Works

1. **Accessing the App:** The user opens Settle in the Nimiq Pay Mini App browser or in any web browser.
2. **Connecting Wallet:** Settle initializes the Nimiq provider. If inside Nimiq Pay, it detects the user's Nimiq address automatically. On standard browsers, it opens the official Nimiq Hub dialog.
3. **Creating or Joining a Tab:** 
   - To create: The user enters a name, selects a currency (NIM or USDT), picks an optional cover photo, and receives a unique link and short code.
   - To join: The user clicks a shared link or enters the 6-character code.
4. **Adding Expenses:** Any participant logs an expense by specifying the title, amount, payer, category, and participating members.
5. **Netting Calculation:** Settle converts amounts into integer units, debits each participant's portion, credits the payer, and factors in past settlements.
6. **Determining Payment Plan:** The netting engine identifies creditors (positive net balances) and debtors (negative net balances) and matches them using greedy debt reduction.
7. **Initiating Settlement:** A debtor taps **"Settle Balance"** or selects an individual transfer recommendation.
8. **Wallet Authorization:** Nimiq Pay displays a transaction approval prompt containing the recipient address, exact Luna value, and tab memo.
9. **Settlement Logging:** Once the transaction is broadcast and the transaction hash is received, Settle records the settlement in the tab's ledger, immediately updating group balances.

---

## User Journey and Navigation

### Step 1: Access Settle
Users launch Settle via Nimiq Pay's Mini App marketplace or direct web link. The home screen displays an inviting hero view with options to **Create a New Tab**, **Join by 6-Character Code**, or view **Recent Private Tabs**.

### Step 2: Connect Wallet
Users connect their Nimiq wallet via the **Connect Wallet** button in the header or during tab creation. The `WalletModal` provides:
- One-tap Nimiq Pay provider connection (in WebView).
- Nimiq Hub connection (in desktop/mobile browsers).
- Manual Nimiq address input (`NQ.. ....`).

### Step 3: Create or Join a Tab
- **`CreateTabModal`:** Configure tab name, currency (NIM / USDT), cover theme preset, and creator identity.
- **Short Code Input:** Located directly on the home page for quick entry of codes like `6D2G8B`.

### Step 4: Add Members
Members can be invited via the `InviteModal`, which offers one-tap link copying, short-code display, and direct address entry.

### Step 5: Add Expenses
Tapping the floating or header **"+ Expense"** button opens `AddExpenseModal`. Users enter the amount on a large numeric keypad, select a category tile, designate the payer, select split participants, and optionally attach a receipt photo.

### Step 6: View Balances
The `TabDetail` screen presents a summary card displaying:
- Total group expenditure.
- Total amount settled to date.
- The user's personal balance (highlighted in soft gold if owed money, or coral red if owing).
- Individual breakdown cards for every group member showing amounts paid and shares consumed.

### Step 7: Review Settlement Recommendations
The **"Optimized Settlement Plan"** section highlights the minimal payment transfers required to settle all debts. It displays who must pay whom, the exact token amount, and the number of bilateral payments eliminated.

### Step 8: Execute Payment
Clicking **"Settle"** on any transfer opens the `SettleModal`. Settle pre-populates the exact recipient address and Luna value, then routes the request to Nimiq Pay or Nimiq Hub.

### Step 9: Track Settlement History
Completed settlements appear under the **"Settlements"** tab with transaction timestamps, payer/payee details, and verified transaction hashes.

---

## Settlement Logic

### Unit Precision & Zero Rounding Drift

Settle avoids floating-point inaccuracies by converting all token values to integer sub-units:

$$\text{NIM Units (Luna)} = \text{round}(\text{Amount} \times 100{,}000)$$
$$\text{USDT Units (micro-units)} = \text{round}(\text{Amount} \times 1{,}000{,}000)$$

When an expense is split among $P$ participants:

$$\text{Base Share} = \lfloor \text{Total Units} / P \rfloor$$
$$\text{Remainder} = \text{Total Units} \pmod P$$

The remainder is distributed by allocating 1 extra sub-unit to the first $R$ participants. This guarantees that:

$$\sum_{i=1}^{P} \text{Participant Share}_i \equiv \text{Total Expense Units}$$

### Net Balance Formula

For each member $m$, the net position is:

$$\text{Net Balance}_m = \text{Total Paid Units}_m - \text{Total Share Units}_m + \sum \text{Settled Sent}_m - \sum \text{Settled Received}_m$$

- $\text{Net Balance}_m > 0$: **Creditor** (is owed money).
- $\text{Net Balance}_m < 0$: **Debtor** (owes money).
- $\text{Net Balance}_m = 0$: **Settled** (obligation clear).

### Greedy Debt Simplification Algorithm

To minimize payments:
1. Divide members into two sorted priority lists:
   - **Debtors** ordered descending by debt magnitude $| \text{Net Balance} |$.
   - **Creditors** ordered descending by credit magnitude $\text{Net Balance}$.
2. Pair the largest debtor with the largest creditor.
3. Compute transfer value: $T = \min(|\text{Debtor Units}|, \text{Creditor Units})$.
4. Deduct $T$ from both parties and append the transfer instruction to the settlement plan.
5. Remove any party whose remaining balance reaches zero.
6. Repeat until all debts and credits are cleared.

#### Example Scenario

Consider three friends sharing a weekend trip:
- **Alice** pays 300 NIM for accommodation (split equally: Alice 100, Bob 100, Charlie 100).
- **Bob** pays 150 NIM for groceries (split equally: Alice 50, Bob 50, Charlie 50).

**Net Balances Before Simplification:**
- **Alice:** $+300 - 150 = +150\text{ NIM}$ (Creditor)
- **Bob:** $+150 - 150 = 0\text{ NIM}$ (Settled)
- **Charlie:** $0 - 150 = -150\text{ NIM}$ (Debtor)

**Without Simplification:**
Charlie owes Alice 100 NIM and Bob 50 NIM; Bob owes Alice 50 NIM (3 separate transactions).

**With Settle's Netting:**
Bob is completely netted out ($0$ net). Settle produces a single payment instruction:
> **Charlie pays Alice 150 NIM.** (2 transactions eliminated).

---

## Payment Architecture

```
User confirms transfer in SettleModal
              |
              v
     NimiqWalletService
              |
    +---------+---------+
    |                   |
[In Nimiq Pay]     [In Web Browser]
    |                   |
    v                   v
Mini App SDK        Nimiq Hub API
sendBasicTx         checkout()
    |                   |
    +---------+---------+
              |
              v
Transaction Hash returned
              |
              v
POST /api/tabs/:id/settle
{
  fromAddress, toAddress,
  amount, currency, txHash
}
              |
              v
Backend records settlement in tab
Balancing sheet recalculated in real time
```

- **Obligation vs. Execution:** Settle computes and presents the settlement recommendation. Payment authorization remains strictly within the user's Nimiq wallet.
- **Data Integrity:** Settle records settlements only after receiving a confirmed transaction hash from the Nimiq wallet provider or user confirmation.
- **Supported Assets:**
  - **NIM:** Fully supported natively through Nimiq Pay's `sendBasicTransactionWithData` and Nimiq Hub's `checkout()`.
  - **USDT:** Supported within Settle's accounting and netting engine. On-chain USDT execution via Nimiq Pay is supported in environments where the Nimiq USDT token bridge is available.

---

## Data Architecture

### Data Models (`src/types/index.ts`)

```typescript
export interface Tab {
  id: string;               // Unique private ID (e.g., "tab_d0b23f0375d58bdc")
  code: string;             // 6-character short code (e.g., "6D2G8B")
  name: string;             // Tab title
  description?: string;     // Optional description
  coverImage?: string;      // Photographic cover URL
  currency: 'NIM' | 'USDT'; // Primary tab currency
  createdAt: string;        // ISO timestamp
  updatedAt: string;        // ISO timestamp
  createdBy: string;        // Creator Nimiq address
  members: TabMember[];     // Array of participants
  expenses: Expense[];      // Array of recorded expenses
  settlements: SettlementPayment[]; // Completed payments
}

export interface TabMember {
  address: string;          // Nimiq address ("NQ.. ....")
  name: string;             // Friendly display name
  avatarColor: string;      // Hex color for avatar
  joinedAt: string;         // ISO timestamp
}

export interface Expense {
  id: string;               // Unique ID ("exp_...")
  tabId: string;
  title: string;
  amount: number;           // Decimal display amount
  currency: 'NIM' | 'USDT';
  category: 'food' | 'transport' | 'stay' | 'drinks' | 'groceries' | 'activities' | 'other';
  paidBy: string;           // Payer Nimiq address
  splitAmong: string[];     // Array of participant addresses
  createdAt: string;
  notes?: string;
  receiptImage?: string;    // Base64 or image URL
}

export interface SettlementPayment {
  id: string;               // Unique settlement ID ("stl_...")
  tabId: string;
  fromAddress: string;      // Debtor address
  toAddress: string;        // Creditor address
  fromName: string;
  toName: string;
  amount: number;
  currency: 'NIM' | 'USDT';
  txHash?: string;          // Blockchain transaction hash
  settledAt: string;
  status: 'completed';
  note?: string;
}
```

### Persistence & Synchronization
- **Backend File Store:** The Express server persists tab data to `tabs_store.json` on disk.
- **Private Access Model:** Tabs are accessed exclusively through knowledge of the tab ID or short code.
- **Client Bookmarking:** The client stores active tab IDs in browser `localStorage` (`settle_recent_tabs`) to restore access across sessions.

---

## Security and Trust

- **Non-Custodial Design:** Settle never handles, asks for, or stores private keys, seed phrases, or wallet secrets. All transaction signing occurs inside Nimiq Pay or Nimiq Hub.
- **Address Formatting & Sanitization:** Nimiq addresses are normalized, sanitized, and validated using checksum format checks (`NQ` + 34 characters).
- **Private Link Architecture:** Tabs are not listed on a public directory. Users must possess the direct URL or short code to inspect tab expenses or join.
- **Zero-Secret Client:** The client contains no embedded administrative keys or API secrets.

---

## Installation and Local Development

### Prerequisites
- **Node.js:** v18.0.0 or higher (v20+ recommended).
- **Package Manager:** `npm` (comes with Node.js) or `bun`.

### Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd settle
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The development server starts Express and mounts Vite middleware at:
   `http://localhost:3000`

4. **Verify TypeScript compilation & linting:**
   ```bash
   npm run lint
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

6. **Start production server:**
   ```bash
   npm run start
   ```

---

## Environment Configuration

Environment variables can be specified in a `.env` file based on `.env.example`:

| Variable | Description | Default |
|---|---|---|
| `PORT` | Port on which the Express server and Vite application run | `3000` |
| `GEMINI_API_KEY` | Optional runtime secret for auxiliary AI capabilities in AI Studio | Not required for core Settle operations |
| `APP_URL` | Self-referential URL where Settle is hosted | Injected in Cloud Run environments |

Core tab creation, expense tracking, debt netting, and Nimiq wallet interactions **do not require external API keys**.

---

## Project Structure

```
├── .env.example            # Example environment configuration
├── .gitignore              # Git ignore rules
├── index.html              # HTML entry point with meta tags & typography
├── metadata.json           # Application metadata and runtime permissions
├── package.json            # Node.js dependencies and scripts
├── public/                 # Static assets (including high-resolution photography)
│   └── assets/aistudio/    # Hero imagery and reference graphics
├── server.ts               # Express backend & Vite middleware server
├── tabs_store.json         # File-based tab and expense storage
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration with Tailwind plugin
└── src/
    ├── App.tsx             # Root React component, view state & modal routing
    ├── main.tsx            # DOM initialization
    ├── index.css           # Global Tailwind CSS imports & theme overrides
    ├── types/
    │   └── index.ts        # TypeScript definitions for tabs, expenses, netting
    ├── services/
    │   ├── api.ts          # REST client communicating with Express server
    │   └── nimiqWallet.ts  # Nimiq Mini App SDK & Hub API integration service
    ├── utils/
    │   ├── netting.ts      # Obligation netting engine & integer Luna math
    │   └── presets.ts      # Photographic theme presets & category mappings
    └── components/
        ├── AddExpenseModal.tsx    # Modal for recording multi-party expenses
        ├── CreateTabModal.tsx     # Modal for creating new shared tabs
        ├── Header.tsx             # App navigation, wallet status indicator
        ├── ImageWithFallback.tsx  # Resilient image loader with fallback UI
        ├── InviteModal.tsx        # Modal displaying shareable links & short codes
        ├── SettleLogo.tsx         # SVG Nimiq-gold hexagonal logo
        ├── SettleModal.tsx        # Settlement execution modal
        ├── TabDetail.tsx          # Main tab view (expenses, balances, settlements)
        ├── TabsList.tsx           # Home view with hero visual & recent tabs
        └── WalletModal.tsx        # Real Nimiq wallet connection modal
```

---

## Current Implementation Status

### Working & Verified
- **Shared Tab Lifecycle:** Creation, retrieval by ID or short code, member addition, and deletion.
- **Expense Operations:** Addition, participant subset selection, categorization, receipt attachments, and deletion.
- **Netting Algorithm:** Integer Luna arithmetic, zero rounding drift, debtor/creditor segregation, and greedy debt minimization.
- **Nimiq Hub Wallet Connection:** Functional on desktop and mobile web browsers via `@nimiq/hub-api`.
- **Nimiq Pay Mini App Provider:** Automatic provider detection and transaction dispatching via `@nimiq/mini-app-sdk`.
- **Receipt Lightbox:** In-app preview modal for attached receipts.
- **Persistence:** Real-time persistence to `tabs_store.json` with client-side recent tab caching.

### Partially Implemented / Dependent on Environment
- **USDT Blockchain Broadcasts:** USDT debt netting and calculations are fully functional; on-chain USDT settlement depends on Nimiq Pay's USDT gasless contract availability in the host wallet.
- **Fallback Deep Links:** Operates in external browsers that have native Nimiq wallet handlers registered for `nimiq:` URIs.

### Unimplemented / Planned for Future
- **Push / Instant Notifications:** Group members must refresh or open the tab link to view newly added expenses.
- **Cryptographic Signatures on Edits:** Tab edits are currently authorized via address association; cryptographic signature verification on expense creation is not yet enforced.

---

## Limitations

1. **Local Single-File Persistence:** The backend currently utilizes `tabs_store.json`. For large-scale production deployments, this can be transitioned to Cloud SQL (PostgreSQL) or Firestore.
2. **Real-Time WebSockets:** Settle currently fetches updated tab data on user interactions (create, add, delete, settle). It does not maintain an active WebSocket connection.
3. **Nimiq Pay Host Requirement for In-App Native Payments:** Full embedded one-tap payments without popups require running inside the official Nimiq Pay native application WebView. Outside of Nimiq Pay, the app gracefully falls back to Nimiq Hub popups.

---

## Future Improvements

- **WebSockets / Server-Sent Events:** Real-time updates as other participants add expenses or make settlements.
- **Cryptographic Signatures:** Require members to sign expense additions using their Nimiq private keys to ensure non-repudiation.
- **Unequal & Percentage Splits:** Support custom amounts and percentage-based expense allocation in addition to equal splits.
- **Recurring Expenses:** Automated tab templates for monthly recurring costs (e.g., apartment rent and utilities).
- **Multi-Currency FX Netting:** Real-time conversion between NIM, USDT, EUR, and USD during the netting phase.

---

## Contributing

1. **Fork or Clone the Repository.**
2. **Review Code Standards:**
   - Adhere to TypeScript strict types (`src/types/index.ts`).
   - Use integer Luna units (`100,000 Luna = 1 NIM`) for any balance calculations.
   - Run `npm run lint` to verify that there are no type errors before submitting PRs.
3. **Submit Pull Requests:** Provide clear descriptions of bug fixes or enhancements.

---

## License

This project currently does not contain an explicit license file, and formal open-source licensing has not been specified. All rights are reserved by the original authors.
