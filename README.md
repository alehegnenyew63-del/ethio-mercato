# 👑 Ethio-Mercato VIP | Official Financial & Asset Management Platform

A mobile-first responsive web application built with **HTML5, Tailwind CSS, Vanilla JavaScript, and Supabase Database Backend**. Engineered for high-volume transactions with Ethiopian multi-gateway payment integration (**Telebirr**, **Commercial Bank of Ethiopia**, and **Bank of Abyssinia**), live daily ROI cashback accumulation, strict withdrawal controls, and manual administrative receipt verification.

---

## 📱 9-Screen Production Flow

| Screen | View / Component | Core Functionality |
|---|---|---|
| **Screen 1** | **Sign In / Sign Up** | Real phone authentication (`+251 09...`), password security, optional referral code linkage, and an automatic **50 ETB welcome balance** credited upon registration. |
| **Screen 2** | **Telegram Channel Popup** | Official welcome modal prompting members to join the official verified Telegram channel (`@EthioMercatoVIP`) for daily gift redemption codes and verified payment proofs. |
| **Screen 3** | **Home / Dashboard** | Live balance card in Ethiopian Birr, **Deposit / አስገባ** & **Withdraw / አውጣ** action buttons, live payout notification feed, and the Rolex VIP package catalog (VIP1 to VIP6). |
| **Screen 4** | **Product Detail / Purchase Modal** | Package yield breakdown, daily income in ETB, 90-day contract duration, total expected ROI, wallet balance validation, and instant contract acquisition. |
| **Screen 5** | **My Products Screen** | Active investment contracts tracker, 90-day progress bar, remaining days countdown, and interactive **🎁 Claim Today's Profit** button crediting the user balance. |
| **Screen 6** | **Mine (Profile) Page** | User Phone, UID, VIP tier badge, referral code with 1-click copy, balance breakdown (Wallet, Total Recharged, Total Withdrawn), and transaction ledgers. |
| **Screen 7 & 8** | **Deposit Amount Selection** | Custom ETB input field and preset quick-buttons (**700, 1,000, 2,000, 5,000, 10,000, 20,000, and 50,000 ETB**). |
| **Screen 9** | **Payment Gateway & Screenshot Upload** | Official merchant accounts for Telebirr, CBE, and Bank of Abyssinia with 1-click copy, mandatory receipt screenshot upload to Supabase Storage, and reference tracking. |
| **Security** | **Withdrawal System** | Strict compliance: bonus cannot be withdrawn directly. Users **must purchase at least 1 product package** before initiating withdrawals. Payout requests enter `pending` status for 24-hour admin authorization. |
| **Admin** | **Verification Portal** | Full review panel for administrators to inspect uploaded payment screenshots, approve deposits (crediting user balance instantly), and disburse bank withdrawals. |

---

## 🏦 Official Merchant Gateways (Configured in Screen 9)

Members transfer funds directly to these verified accounts:

1. **Telebirr (ቴሌብር)**:
   - **Phone**: `0943257056`
   - **Account Name**: `Shibabew`
2. **Commercial Bank of Ethiopia (CBE / ንግድ ባንክ)**:
   - **Account Number**: `1000331894994`
   - **Account Name**: `Alehegn`
3. **Bank of Abyssinia (አቢሲኒያ ባንክ)**:
   - **Account Number**: `157312097`
   - **Account Name**: `Alehegn`

---

## ⚙️ Business Rules & Database Procedures

1. **Daily ROI / Cashback Lifecycle**:
   - Each VIP package runs for an exact **90-day cycle**.
   - Example: **Rolex VIP1** costs 700 ETB, yielding 42 ETB daily revenue (Total: 3,780 ETB).
   - Daily returns are collected via the **Claim Today's Profit** trigger and credited directly to the user's spendable balance.
2. **Deposit & Receipt Verification**:
   - Minimum recharge: **50 ETB**.
   - Payment receipts are uploaded directly to the Supabase Storage bucket (`deposit-receipts`).
   - Deposit requests enter `pending` status. Admins inspect the receipt in the Admin Portal and click **Verify & Credit Balance**, which updates the user's wallet in real time.
3. **Withdrawal Policy**:
   - Users **cannot withdraw initial signup bonuses directly**.
   - Users **must purchase at least 1 active product package** to unlock withdrawals.
   - Once unlocked, users can withdraw available balances down to 0 ETB to Telebirr, CBE, or Bank of Abyssinia.
4. **Referral Rewards**:
   - Direct sponsors receive an automatic **10% commission** when their invited members make deposits.

---

## 🗄️ Database Setup (Supabase)

1. Open your project at [supabase.com/dashboard/project/bwebignuouajdohlqmbw](https://supabase.com/dashboard/project/bwebignuouajdohlqmbw).
2. Go to **SQL Editor** -> **New Query**.
3. Paste the contents of [`supabase_schema.sql`](file:///c:/Users/hp/ethio-mercato/supabase_schema.sql) and click **Run**.
4. Retrieve your **anon public key** from **Project Settings -> API** and add it into [`js/config.js`](file:///c:/Users/hp/ethio-mercato/js/config.js).

---

## 🚀 Running the Production Platform

```bash
# Option A: Python HTTP Server
python -m http.server 3000

# Option B: Node.js Serve
npx serve .
```

Open `http://localhost:3000` in any browser or mobile device.
