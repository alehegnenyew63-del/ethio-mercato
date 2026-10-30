// ==============================================================================
// ETHIO-MERCATO VIP - SUPABASE BACKEND CLIENT
// ==============================================================================
// Automated Database Connection (No Frontend Key Inputs Required)
// ==============================================================================

const SUPABASE_URL = "https://bwebignuouajdohlqmbw.supabase.co";
// ⚠️  REQUIRED: Replace PASTE_YOUR_ANON_KEY_HERE with your real anon key.
// Find it at: Supabase Dashboard → Project Settings → API → anon public key
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3ZWJpZ251b3VhamRvaGxxbWJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyNzc3MzEsImV4cCI6MjEwODg1MzczMX0.sbaN2VJQZUm4ivYfWTZHmE8nUGmCamXsPXYHHTsFxGQ";

// Default Seed Accounts
const DEFAULT_PAYMENT_ACCOUNTS = [
  {
    id: "seed-telebirr",
    provider_name: "Telebirr",
    account_number: "0943257056",
    account_holder_name: "Shibabew",
    is_active: true
  },
  {
    id: "seed-cbe",
    provider_name: "Commercial Bank of Ethiopia (CBE)",
    account_number: "1000331894994",
    account_holder_name: "Alehegn",
    is_active: true
  },
  {
    id: "seed-abyssinia",
    provider_name: "Bank of Abyssinia",
    account_number: "157312097",
    account_holder_name: "Alehegn",
    is_active: true
  }
];

// Visual styling, icons and metadata by provider
function getProviderVisuals(providerName = '') {
  const name = (providerName || '').toLowerCase();
  if (name.includes('telebirr') || name.includes('tele') || name.includes('ቴሌ')) {
    return {
      icon: '📱',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      activeTabClass: 'border-amber-500 bg-amber-500/20 text-amber-300 shadow-lg shadow-amber-500/20',
      inactiveTabClass: 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200',
      tagColor: 'text-amber-400',
      label: 'ስልክ ቁጥር (Phone / Account)',
      gradient: 'from-amber-500/20 to-yellow-500/5'
    };
  }
  if (name.includes('cbe') || name.includes('commercial') || name.includes('ንግድ')) {
    return {
      icon: '🏛️',
      badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      activeTabClass: 'border-purple-500 bg-purple-500/20 text-purple-300 shadow-lg shadow-purple-500/20',
      inactiveTabClass: 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200',
      tagColor: 'text-purple-400',
      label: 'የሂሳብ ቁጥር (Account Number)',
      gradient: 'from-purple-500/20 to-indigo-500/5'
    };
  }
  if (name.includes('abyssinia') || name.includes('አቢሲኒያ') || name.includes('boa')) {
    return {
      icon: '🏦',
      badgeClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
      activeTabClass: 'border-yellow-500 bg-yellow-500/20 text-yellow-300 shadow-lg shadow-yellow-500/20',
      inactiveTabClass: 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200',
      tagColor: 'text-yellow-400',
      label: 'የሂሳብ ቁጥር (Account Number)',
      gradient: 'from-yellow-500/20 to-amber-500/5'
    };
  }
  if (name.includes('awash') || name.includes('አዋሽ')) {
    return {
      icon: '🏢',
      badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      activeTabClass: 'border-blue-500 bg-blue-500/20 text-blue-300 shadow-lg shadow-blue-500/20',
      inactiveTabClass: 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200',
      tagColor: 'text-blue-400',
      label: 'የሂሳብ ቁጥር (Account Number)',
      gradient: 'from-blue-500/20 to-cyan-500/5'
    };
  }
  if (name.includes('dashen') || name.includes('ዳሸን')) {
    return {
      icon: '💳',
      badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      activeTabClass: 'border-indigo-500 bg-indigo-500/20 text-indigo-300 shadow-lg shadow-indigo-500/20',
      inactiveTabClass: 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200',
      tagColor: 'text-indigo-400',
      label: 'የሂሳብ ቁጥር (Account Number)',
      gradient: 'from-indigo-500/20 to-blue-500/5'
    };
  }
  if (name.includes('coop') || name.includes('oromia') || name.includes('ኦሮሚያ')) {
    return {
      icon: '🌾',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      activeTabClass: 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-lg shadow-emerald-500/20',
      inactiveTabClass: 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200',
      tagColor: 'text-emerald-400',
      label: 'የሂሳብ ቁጥር (Account Number)',
      gradient: 'from-emerald-500/20 to-teal-500/5'
    };
  }
  // Generic bank fallback
  return {
    icon: '🏦',
    badgeClass: 'bg-slate-700/50 text-slate-300 border-slate-600',
    activeTabClass: 'border-amber-500 bg-amber-500/20 text-amber-300 shadow-lg shadow-amber-500/20',
    inactiveTabClass: 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200',
    tagColor: 'text-amber-400',
    label: 'የሂሳብ ቁጥር (Account Number)',
    gradient: 'from-slate-800 to-slate-900'
  };
}

class SupabaseService {
  constructor() {
    this.client = null;
    this.init();
  }

  init() {
    if (window.supabase) {
      try {
        this.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("🟢 Connected to Supabase Backend:", SUPABASE_URL);
      } catch (err) {
        console.warn("Supabase client initialization notice:", err);
      }
    }
  }

  generateReferralCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'ET';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // ----------------------------------------------------------------------------
  // 1. AUTHENTICATION & AUTOMATIC 200 ETB WELCOME BONUS
  // ----------------------------------------------------------------------------
  async signUp(phone, password, inviteCode = '') {
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      throw new Error('Please enter a valid Ethiopian phone number.');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    // Check if phone already registered
    const { data: existing } = await this.client
      .from('users')
      .select('id')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (existing) {
      throw new Error('This phone number is already registered. Please sign in.');
    }

    const myRefCode = this.generateReferralCode();
    const cleanInvite = inviteCode ? inviteCode.trim().toUpperCase() : null;

    // Automatic 200 ETB welcome bonus stored in database
    const newUser = {
      phone: cleanPhone,
      password_hash: password,
      balance: 200.00, // 200 ETB Welcome Bonus
      referral_code: myRefCode,
      referred_by: cleanInvite,
      total_recharged: 0.00,
      total_withdrawn: 0.00,
      is_admin: cleanPhone === '0943257056' || cleanPhone === '0912345678'
    };

    const { data, error } = await this.client
      .from('users')
      .insert([newUser])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async signIn(phone, password) {
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (!cleanPhone || !password) {
      throw new Error('Phone number and password are required.');
    }

    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('phone', cleanPhone)
      .eq('password_hash', password)
      .maybeSingle();

    if (error || !data) {
      throw new Error('Invalid phone number or password. Please verify credentials.');
    }

    return data;
  }

  async getUser(userId) {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  // ----------------------------------------------------------------------------
  // 2. PRODUCTS & PURCHASES (DAILY ROI LIFECYCLE)
  // ----------------------------------------------------------------------------
  async getProducts() {
    const { data, error } = await this.client
      .from('products')
      .select('*')
      .order('price', { ascending: true });

    if (error) {
      console.warn("Falling back to local catalog:", error);
      return [];
    }
    return data || [];
  }

  async buyProduct(userId, product) {
    // 1. Check user balance
    const user = await this.getUser(userId);
    const price = Number(product.price);
    const balance = Number(user.balance || 0);

    if (balance < price) {
      const needed = (price - balance).toFixed(2);
      throw new Error(`Insufficient balance! Price is ${price.toLocaleString()} ETB, but your balance is ${balance.toFixed(2)} ETB. You need ${needed} ETB more.`);
    }

    // 2. Deduct balance from user
    const newBal = Number((balance - price).toFixed(2));
    const { error: updErr } = await this.client
      .from('users')
      .update({ balance: newBal, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (updErr) throw new Error(updErr.message);

    // 3. Insert purchase record
    const purchaseRecord = {
      user_id: userId,
      product_id: product.id,
      price: price,
      daily_return: Number(product.daily_return),
      days_remaining: product.duration_days || 90,
      total_earned: 0.00,
      status: 'active'
    };

    const { data: purchase, error: pErr } = await this.client
      .from('purchases')
      .insert([purchaseRecord])
      .select()
      .single();

    if (pErr) console.warn("Purchase insert note:", pErr);

    return { success: true, purchase, newBalance: newBal };
  }

  async getPurchases(userId) {
    const { data, error } = await this.client
      .from('purchases')
      .select('*, products(title, image_url)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async claimDaily(purchaseId, userId) {
    const { data: purchase, error: pErr } = await this.client
      .from('purchases')
      .select('*')
      .eq('id', purchaseId)
      .eq('user_id', userId)
      .single();

    if (pErr || !purchase) throw new Error("Purchase contract not found.");
    if (purchase.status !== 'active') throw new Error("Contract cycle has already ended.");

    // ─── 24-HOUR COOLDOWN CHECK ───────────────────────────────────────────
    // Each purchase can only be collected ONCE every 24 hours.
    // The last_collected_at timestamp is stored per purchase record.
    if (purchase.last_collected_at) {
      const lastCollected = new Date(purchase.last_collected_at).getTime();
      const now = Date.now();
      const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
      const elapsed = now - lastCollected;

      if (elapsed < TWENTY_FOUR_HOURS_MS) {
        const remainingMs = TWENTY_FOUR_HOURS_MS - elapsed;
        const remainingHrs = Math.floor(remainingMs / (60 * 60 * 1000));
        const remainingMins = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
        throw new Error(
          `ይቅርታ! የቀን ገቢ በ 24 ሰዓት ውስጥ አንድ ጊዜ ብቻ ነው የሚሰበሰበው። ቀሪ ጊዜ: ${remainingHrs} ሰዓት ${remainingMins} ደቂቃ ይቀራል።`
        );
      }
    }
    // ──────────────────────────────────────────────────────────────────────

    const newDays = Math.max(0, (purchase.days_remaining || 90) - 1);
    const newTotal = Number((Number(purchase.total_earned || 0) + Number(purchase.daily_return)).toFixed(2));
    const newStatus = newDays <= 0 ? 'completed' : 'active';

    // Update purchase record with new last_collected_at timestamp
    await this.client
      .from('purchases')
      .update({
        days_remaining: newDays,
        total_earned: newTotal,
        last_collected_at: new Date().toISOString(),
        status: newStatus
      })
      .eq('id', purchaseId);

    // Credit user balance
    const user = await this.getUser(userId);
    const newBal = Number((Number(user.balance || 0) + Number(purchase.daily_return)).toFixed(2));

    await this.client
      .from('users')
      .update({ balance: newBal, updated_at: new Date().toISOString() })
      .eq('id', userId);

    return {
      success: true,
      daily_return: purchase.daily_return,
      new_balance: newBal,
      days_remaining: newDays
    };
  }

  // ----------------------------------------------------------------------------
  // 3. DEPOSITS & RECEIPT SCREENSHOT STORAGE
  // ----------------------------------------------------------------------------
  async uploadReceipt(file) {
    if (!file) throw new Error("Please select a screenshot file.");

    const ext = file.name ? file.name.split('.').pop() : 'jpg';
    const filePath = `receipts/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

    const { data, error } = await this.client.storage
      .from('deposit-receipts')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (error) {
      console.warn("Storage upload notice, falling back to base64:", error);
      return await this.fileToBase64(file);
    }

    const { data: publicUrlData } = this.client.storage
      .from('deposit-receipts')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }

  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  async submitDeposit(userId, amount, paymentMethod, screenshotUrl) {
    const amt = Number(amount);
    if (!amt || amt < 50) throw new Error("Minimum deposit is 50 ETB.");
    if (!screenshotUrl) throw new Error("Payment receipt screenshot is required.");

    const depositPayload = {
      user_id: userId,
      amount: amt,
      payment_method: paymentMethod,
      screenshot_url: screenshotUrl,
      status: 'pending' // Manual admin verification
    };

    const { data, error } = await this.client
      .from('deposits')
      .insert([depositPayload])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getDeposits(userId) {
    const { data, error } = await this.client
      .from('deposits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  // ----------------------------------------------------------------------------
  // 4. WITHDRAWALS & CONDITIONAL LOGIC (AT LEAST 1 APPROVED DEPOSIT)
  // ----------------------------------------------------------------------------
  async hasApprovedDeposit(userId) {
    if (!userId) return false;
    try {
      // 1. Check user record first for can_withdraw flag or total_recharged
      const { data: userData } = await this.client
        .from('users')
        .select('can_withdraw, total_recharged')
        .eq('id', userId)
        .maybeSingle();

      if (userData && (userData.can_withdraw === true || Number(userData.total_recharged || 0) > 0)) {
        return true;
      }
    } catch (e) {
      // ignore column missing
    }

    // 2. Check approved deposits table
    const { data, error } = await this.client
      .from('deposits')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'approved')
      .limit(1);

    if (error) {
      console.warn("Check approved deposits notice:", error);
      return false;
    }
    return Boolean(data && data.length > 0);
  }

  async submitWithdrawal(userId, amount, accountNumber, paymentMethod) {
    const amt = Number(amount);
    if (!amt || amt <= 0) throw new Error("Please enter a valid amount.");
    if (!accountNumber) throw new Error("Account number is required.");

    // Check available balance
    const user = await this.getUser(userId);
    const balance = Number(user.balance || 0);
    if (balance < amt) {
      throw new Error(`Insufficient funds: Withdrawable balance is ${balance.toFixed(2)} ETB.`);
    }

    // STRICT BUSINESS RULE: Cannot withdraw welcome bonus or any funds without approved deposit!
    // A user is only permitted to request a withdrawal if they have at least one approved deposit.
    const approved = await this.hasApprovedDeposit(userId);
    if (!approved) {
      throw new Error("ይቅርታ! ገንዘብ ለማውጣት መጀመሪያ ብር አስገብተው በአድሚን ማስረጋገጥ/ማጽደቅ ይኖርብዎታል።");
    }

    // Deduct balance immediately
    const newBal = Number((balance - amt).toFixed(2));
    await this.client
      .from('users')
      .update({ balance: newBal, updated_at: new Date().toISOString() })
      .eq('id', userId);

    // Insert withdrawal with pending status for 24h manual verification
    const withdrawalPayload = {
      user_id: userId,
      amount: amt,
      account_number: accountNumber,
      payment_method: paymentMethod,
      status: 'pending'
    };

    const { data, error } = await this.client
      .from('withdrawals')
      .insert([withdrawalPayload])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { success: true, withdrawal: data, newBalance: newBal };
  }

  async getWithdrawals(userId) {
    const { data, error } = await this.client
      .from('withdrawals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  // ----------------------------------------------------------------------------
  // 5. REFERRAL NETWORK
  // ----------------------------------------------------------------------------
  async getTeamMembers(referralCode) {
    if (!referralCode) return [];
    const { data, error } = await this.client
      .from('users')
      .select('id, phone, balance, created_at')
      .eq('referred_by', referralCode)
      .order('created_at', { ascending: false });

    if (error) return [];
    return (data || []).map(u => ({
      id: u.id,
      phone: u.phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2'),
      created_at: u.created_at
    }));
  }

  // ----------------------------------------------------------------------------
  // 6. ADMIN OPERATIONS (24H MANUAL PAYOUT & DEPOSIT VERIFICATION)
  // ----------------------------------------------------------------------------
  async getAllDeposits() {
    const { data, error } = await this.client
      .from('deposits')
      .select('*, users(phone)')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(d => ({
      ...d,
      user_phone: d.users?.phone || d.user_id.substring(0, 8)
    }));
  }

  async getAllWithdrawals() {
    const { data, error } = await this.client
      .from('withdrawals')
      .select('*, users(phone)')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(w => ({
      ...w,
      user_phone: w.users?.phone || w.user_id.substring(0, 8)
    }));
  }

  async approveDeposit(depositId) {
    const { data: dep, error: dErr } = await this.client
      .from('deposits')
      .select('*')
      .eq('id', depositId)
      .single();

    if (dErr || !dep) throw new Error("Deposit not found.");
    if (dep.status !== 'pending') throw new Error(`Deposit already marked as ${dep.status}.`);

    // Update deposit status
    await this.client
      .from('deposits')
      .update({ status: 'approved' })
      .eq('id', depositId);

    // Credit user balance and unlock withdrawals
    const user = await this.getUser(dep.user_id);
    const newBal = Number((Number(user.balance || 0) + Number(dep.amount)).toFixed(2));
    const newRecharge = Number((Number(user.total_recharged || 0) + Number(dep.amount)).toFixed(2));

    let updatePayload = {
      balance: newBal,
      total_recharged: newRecharge,
      can_withdraw: true,
      updated_at: new Date().toISOString()
    };

    let { error: uErr } = await this.client
      .from('users')
      .update(updatePayload)
      .eq('id', dep.user_id);

    if (uErr && uErr.message && uErr.message.includes('can_withdraw')) {
      delete updatePayload.can_withdraw;
      await this.client
        .from('users')
        .update(updatePayload)
        .eq('id', dep.user_id);
    }

    return { success: true };
  }

  // ----------------------------------------------------------------------------
  // 7. PAYMENT ACCOUNTS (DYNAMIC GATEWAYS)
  // ----------------------------------------------------------------------------
  async getPaymentAccounts(onlyActive = true) {
    try {
      if (!this.client) throw new Error("No supabase client");
      let query = this.client
        .from('payment_accounts')
        .select('*')
        .order('created_at', { ascending: true });

      if (onlyActive) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      if (data && data.length > 0) {
        localStorage.setItem('ethio_payment_accounts', JSON.stringify(data));
        return data;
      }
      return onlyActive ? DEFAULT_PAYMENT_ACCOUNTS.filter(a => a.is_active) : DEFAULT_PAYMENT_ACCOUNTS;
    } catch (err) {
      console.warn("Using payment_accounts fallback cache:", err.message);
      const cached = localStorage.getItem('ethio_payment_accounts');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return onlyActive ? parsed.filter(a => a.is_active) : parsed;
          }
        } catch (e) {}
      }
      return onlyActive ? DEFAULT_PAYMENT_ACCOUNTS.filter(a => a.is_active) : DEFAULT_PAYMENT_ACCOUNTS;
    }
  }

  async seedDefaultPaymentAccounts() {
    try {
      const inserts = DEFAULT_PAYMENT_ACCOUNTS.map(a => ({
        provider_name: a.provider_name,
        account_number: a.account_number,
        account_holder_name: a.account_holder_name,
        is_active: a.is_active
      }));
      await this.client.from('payment_accounts').insert(inserts);
    } catch (e) {
      console.warn('Seeding payment_accounts notice:', e.message);
    }
  }

  async rejectDeposit(depositId) {
    const { error } = await this.client
      .from('deposits')
      .update({ status: 'rejected' })
      .eq('id', depositId);

    if (error) throw new Error(error.message);
    return { success: true };
  }

  async approveWithdrawal(withdrawalId) {
    const { error } = await this.client
      .from('withdrawals')
      .update({ status: 'approved' })
      .eq('id', withdrawalId);

    if (error) throw new Error(error.message);
    return { success: true };
  }

  async rejectWithdrawal(withdrawalId) {
    const { data: wd } = await this.client
      .from('withdrawals')
      .select('*')
      .eq('id', withdrawalId)
      .single();

    if (wd && wd.status === 'pending') {
      // Refund balance
      const user = await this.getUser(wd.user_id);
      const refunded = Number((Number(user.balance || 0) + Number(wd.amount)).toFixed(2));
      await this.client
        .from('users')
        .update({ balance: refunded })
        .eq('id', wd.user_id);

      await this.client
        .from('withdrawals')
        .update({ status: 'rejected' })
        .eq('id', withdrawalId);
    }

    return { success: true };
  }
}

window.supabaseService = new SupabaseService();
window.DEFAULT_PAYMENT_ACCOUNTS = DEFAULT_PAYMENT_ACCOUNTS;
window.getProviderVisuals = getProviderVisuals;

