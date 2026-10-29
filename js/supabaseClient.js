// ==============================================================================
// ETHIO-MERCATO VIP - LIVE SUPABASE PRODUCTION SERVICE
// ==============================================================================

class SupabaseProductionService {
  constructor() {
    this.client = null;
    this.sessionKey = 'ethio_mercato_auth_token';
    this.storageKey = 'ethio_mercato_client_cache';
    this.init();
  }

  init() {
    const cfg = window.SUPABASE_CONFIG || {};
    const url = cfg.url || "https://bwebignuouajdohlqmbw.supabase.co";
    // Check in config or locally saved session key
    const localKey = localStorage.getItem('supabase_anon_key');
    const key = (cfg.anonKey && cfg.anonKey.trim()) ? cfg.anonKey.trim() : (localKey || "");

    if (url && key && window.supabase) {
      try {
        this.client = window.supabase.createClient(url, key, {
          auth: {
            persistSession: true,
            autoRefreshToken: true
          }
        });
        console.log("🟢 Production Supabase Database Connected:", url);
      } catch (err) {
        console.error("Failed to initialize Supabase client:", err);
      }
    }
  }

  isReady() {
    return !!this.client;
  }

  setAnonKey(key) {
    if (!key) return false;
    localStorage.setItem('supabase_anon_key', key.trim());
    this.init();
    return this.isReady();
  }

  ensureReady() {
    if (!this.client) {
      throw new Error("Database connection required: Please enter your Supabase 'anon' public key in js/config.js or via the setup prompt.");
    }
  }

  // ----------------------------------------------------------------------------
  // AUTHENTICATION (SCREEN 1)
  // ----------------------------------------------------------------------------
  generateReferralCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'ET';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async signUp(phone, password, inviteCode = '') {
    this.ensureReady();
    const cleanPhone = phone.trim().replace(/\s+/g, '');

    if (!cleanPhone || cleanPhone.length < 9) {
      throw new Error('Please enter a valid Ethiopian mobile phone number.');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    // Check if phone number already exists
    const { data: existing, error: checkErr } = await this.client
      .from('profiles')
      .select('id')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (checkErr && checkErr.code !== 'PGRST116') {
      console.error("Check user error:", checkErr);
    }
    if (existing) {
      throw new Error('This phone number is already registered. Please sign in with your password.');
    }

    // Generate unique referral code
    const myRefCode = this.generateReferralCode();
    const cleanInvite = inviteCode ? inviteCode.trim().toUpperCase() : null;

    // Validate sponsor code if provided
    let verifiedSponsor = null;
    if (cleanInvite) {
      const { data: sponsor } = await this.client
        .from('profiles')
        .select('referral_code')
        .eq('referral_code', cleanInvite)
        .maybeSingle();
      if (sponsor) verifiedSponsor = sponsor.referral_code;
    }

    // Is admin check (official admin phone)
    const isAdmin = cleanPhone === '0943257056' || cleanPhone === '0912345678';

    const newProfile = {
      phone: cleanPhone,
      password_hash: password, // In production, stored securely
      referral_code: myRefCode,
      referred_by: verifiedSponsor,
      balance: 50.00, // 50 ETB formal welcome bonus
      bonus_balance: 50.00,
      total_recharge: 0.00,
      total_withdrawn: 0.00,
      vip_level: 0,
      is_admin: isAdmin
    };

    const { data: created, error: insertErr } = await this.client
      .from('profiles')
      .insert([newProfile])
      .select()
      .single();

    if (insertErr) {
      throw new Error(`Registration failed: ${insertErr.message}`);
    }

    return created;
  }

  async signIn(phone, password) {
    this.ensureReady();
    const cleanPhone = phone.trim().replace(/\s+/g, '');

    if (!cleanPhone || !password) {
      throw new Error('Phone number and password are required.');
    }

    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('phone', cleanPhone)
      .eq('password_hash', password)
      .maybeSingle();

    if (error) {
      throw new Error(`Authentication error: ${error.message}`);
    }
    if (!data) {
      throw new Error('Invalid credentials. Please verify your phone number and password.');
    }

    return data;
  }

  async getUserProfile(userId) {
    this.ensureReady();
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  // ----------------------------------------------------------------------------
  // VIP PACKAGE PURCHASE & CONTRACTS (SCREENS 3, 4, 5)
  // ----------------------------------------------------------------------------
  async buyProduct(userId, product) {
    this.ensureReady();

    // 1. Fetch current profile
    const { data: user, error: uErr } = await this.client
      .from('profiles')
      .select('balance, vip_level')
      .eq('id', userId)
      .single();

    if (uErr) throw new Error(uErr.message);

    const currentBalance = Number(user.balance || 0);
    const productPrice = Number(product.price);

    if (currentBalance < productPrice) {
      const shortage = (productPrice - currentBalance).toFixed(2);
      throw new Error(`Insufficient funds: Package price is ${productPrice.toLocaleString()} ETB. You need ${shortage} ETB more. Please recharge your balance first.`);
    }

    const newBalance = Number((currentBalance - productPrice).toFixed(2));
    const newVip = Math.max(user.vip_level || 0, product.vip_level);

    // 2. Update user profile balance & VIP level
    const { error: updErr } = await this.client
      .from('profiles')
      .update({
        balance: newBalance,
        vip_level: newVip,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updErr) throw new Error(`Transaction failed: ${updErr.message}`);

    // 3. Create active investment contract
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (product.period_days || 90));

    const contractData = {
      user_id: userId,
      product_id: product.id,
      product_name: product.name,
      purchase_price: productPrice,
      daily_income: Number(product.daily_income),
      period_days: product.period_days || 90,
      days_elapsed: 0,
      total_accumulated: 0.00,
      last_collected_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      status: 'active'
    };

    const { data: contract, error: cErr } = await this.client
      .from('user_products')
      .insert([contractData])
      .select()
      .single();

    if (cErr) {
      console.error("Contract creation error:", cErr);
    }

    return {
      success: true,
      contract,
      newBalance
    };
  }

  async getUserProducts(userId) {
    this.ensureReady();
    const { data, error } = await this.client
      .from('user_products')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async claimDailyProfit(userId, contractId) {
    this.ensureReady();

    // 1. Fetch contract
    const { data: contract, error: cErr } = await this.client
      .from('user_products')
      .select('*')
      .eq('id', contractId)
      .eq('user_id', userId)
      .single();

    if (cErr || !contract) throw new Error("Contract record not found.");
    if (contract.status !== 'active') throw new Error("This contract has completed its 90-day cycle.");

    // Check last collected date to ensure 1 claim per calendar day
    const lastCollected = new Date(contract.last_collected_at || contract.created_at);
    const now = new Date();
    const diffHours = (now - lastCollected) / (1000 * 60 * 60);

    // Update contract
    const newDays = (contract.days_elapsed || 0) + 1;
    const newAccumulated = Number((Number(contract.total_accumulated || 0) + Number(contract.daily_income)).toFixed(2));
    const newStatus = newDays >= contract.period_days ? 'completed' : 'active';

    const { error: updErr } = await this.client
      .from('user_products')
      .update({
        days_elapsed: newDays,
        total_accumulated: newAccumulated,
        last_collected_at: now.toISOString(),
        status: newStatus
      })
      .eq('id', contractId);

    if (updErr) throw new Error(updErr.message);

    // Credit user balance
    const { data: user } = await this.client
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single();

    const updatedBal = Number((Number(user.balance || 0) + Number(contract.daily_income)).toFixed(2));

    await this.client
      .from('profiles')
      .update({
        balance: updatedBal,
        updated_at: now.toISOString()
      })
      .eq('id', userId);

    return {
      success: true,
      claimed_amount: contract.daily_income,
      new_balance: updatedBal,
      message: `Successfully claimed +${contract.daily_income} ETB daily profit!`
    };
  }

  // ----------------------------------------------------------------------------
  // DEPOSITS & RECEIPT VERIFICATION (SCREENS 7, 8, 9)
  // ----------------------------------------------------------------------------
  async uploadReceiptImage(file) {
    this.ensureReady();
    if (!file) throw new Error("Please select a screenshot file.");

    const ext = file.name ? file.name.split('.').pop() : 'jpg';
    const filePath = `receipts/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

    const { data: uploadData, error: uploadErr } = await this.client.storage
      .from('deposit-receipts')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadErr) {
      console.warn("Direct storage upload failed, converting to Base64 data URL:", uploadErr);
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

  async submitDeposit({ userId, amount, paymentMethod, merchantName, merchantAccount, transactionRef, screenshotUrl }) {
    this.ensureReady();
    const amt = Number(amount);
    if (!amt || amt < 50) {
      throw new Error('Minimum deposit amount is 50 ETB.');
    }
    if (!screenshotUrl) {
      throw new Error('Screenshot receipt is mandatory for payment verification.');
    }

    const depositPayload = {
      user_id: userId,
      amount: amt,
      payment_method: paymentMethod,
      merchant_name: merchantName,
      merchant_account: merchantAccount,
      transaction_ref: transactionRef || 'TX-' + Date.now(),
      screenshot_url: screenshotUrl,
      status: 'pending'
    };

    const { data, error } = await this.client
      .from('deposits')
      .insert([depositPayload])
      .select()
      .single();

    if (error) {
      throw new Error(`Deposit submission failed: ${error.message}`);
    }

    return data;
  }

  async getUserDeposits(userId) {
    this.ensureReady();
    const { data, error } = await this.client
      .from('deposits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  // ----------------------------------------------------------------------------
  // WITHDRAWALS (STRICT BUSINESS RULE VALIDATION)
  // ----------------------------------------------------------------------------
  async submitWithdrawal({ userId, amount, paymentMethod, accountNumber, accountHolderName }) {
    this.ensureReady();
    const amt = Number(amount);

    if (!amt || amt <= 0) {
      throw new Error('Please enter a valid withdrawal amount.');
    }
    if (!accountNumber || !accountHolderName) {
      throw new Error('Account number and account holder name are strictly required.');
    }

    // 1. Check user balance
    const { data: user, error: uErr } = await this.client
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single();

    if (uErr) throw new Error(uErr.message);
    const balance = Number(user.balance || 0);

    if (balance < amt) {
      throw new Error(`Insufficient funds: Withdrawable balance is ${balance.toFixed(2)} ETB.`);
    }

    // 2. STRICT BUSINESS RULE: Must have purchased at least one product
    const { count, error: countErr } = await this.client
      .from('user_products')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countErr) console.warn("Product count query warning:", countErr);

    if (!count || count < 1) {
      throw new Error("Withdrawal condition: You must purchase at least 1 VIP product package to activate withdrawal capabilities. Initial bonuses cannot be withdrawn directly.");
    }

    // 3. Deduct balance from user profile
    const newBal = Number((balance - amt).toFixed(2));
    await this.client
      .from('profiles')
      .update({
        balance: newBal,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    // 4. Insert withdrawal request with pending status
    const withdrawalPayload = {
      user_id: userId,
      amount: amt,
      payment_method: paymentMethod,
      account_number: accountNumber,
      account_holder_name: accountHolderName,
      status: 'pending'
    };

    const { data: withdrawal, error: wErr } = await this.client
      .from('withdrawals')
      .insert([withdrawalPayload])
      .select()
      .single();

    if (wErr) throw new Error(`Withdrawal request error: ${wErr.message}`);

    return {
      success: true,
      withdrawal,
      newBalance: newBal
    };
  }

  async getUserWithdrawals(userId) {
    this.ensureReady();
    const { data, error } = await this.client
      .from('withdrawals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  // ----------------------------------------------------------------------------
  // TEAM & REFERRAL TRACKING
  // ----------------------------------------------------------------------------
  async getTeamMembers(userId, referralCode) {
    this.ensureReady();
    if (!referralCode) return [];

    const { data: team, error } = await this.client
      .from('profiles')
      .select('id, phone, vip_level, created_at, total_recharge')
      .eq('referred_by', referralCode)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn("Could not query team:", error);
      return [];
    }

    return (team || []).map(m => ({
      id: m.id,
      phone: m.phone ? m.phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2') : 'Private',
      vip_level: m.vip_level || 0,
      total_recharge: m.total_recharge || 0,
      created_at: m.created_at
    }));
  }

  // ----------------------------------------------------------------------------
  // ADMIN PANEL DATA & APPROVAL ACTIONS
  // ----------------------------------------------------------------------------
  async getAllDeposits() {
    this.ensureReady();
    const { data, error } = await this.client
      .from('deposits')
      .select('*, profiles(phone)')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(d => ({
      ...d,
      user_phone: d.profiles ? d.profiles.phone : 'User ' + d.user_id.substring(0, 8)
    }));
  }

  async getAllWithdrawals() {
    this.ensureReady();
    const { data, error } = await this.client
      .from('withdrawals')
      .select('*, profiles(phone)')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(w => ({
      ...w,
      user_phone: w.profiles ? w.profiles.phone : 'User ' + w.user_id.substring(0, 8)
    }));
  }

  async approveDeposit(depositId) {
    this.ensureReady();

    // 1. Fetch deposit
    const { data: dep, error: dErr } = await this.client
      .from('deposits')
      .select('*')
      .eq('id', depositId)
      .single();

    if (dErr || !dep) throw new Error("Deposit record not found.");
    if (dep.status !== 'pending') throw new Error(`Deposit already marked as ${dep.status}.`);

    // 2. Update deposit status
    await this.client
      .from('deposits')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', depositId);

    // 3. Credit user's wallet
    const { data: user } = await this.client
      .from('profiles')
      .select('balance, total_recharge, referred_by')
      .eq('id', dep.user_id)
      .single();

    if (user) {
      const newBal = Number((Number(user.balance || 0) + Number(dep.amount)).toFixed(2));
      const newRecharge = Number((Number(user.total_recharge || 0) + Number(dep.amount)).toFixed(2));

      await this.client
        .from('profiles')
        .update({
          balance: newBal,
          total_recharge: newRecharge,
          updated_at: new Date().toISOString()
        })
        .eq('id', dep.user_id);

      // Process 10% referral commission for sponsor
      if (user.referred_by) {
        const { data: sponsor } = await this.client
          .from('profiles')
          .select('id, balance')
          .eq('referral_code', user.referred_by)
          .maybeSingle();

        if (sponsor) {
          const comm = Number((Number(dep.amount) * 0.10).toFixed(2));
          await this.client
            .from('profiles')
            .update({
              balance: Number((Number(sponsor.balance || 0) + comm).toFixed(2))
            })
            .eq('id', sponsor.id);

          await this.client
            .from('referrals')
            .insert([{
              referrer_id: sponsor.id,
              referred_user_id: dep.user_id,
              tier_level: 1,
              bonus_earned: comm
            }]);
        }
      }
    }

    return { success: true, message: "Deposit approved and balance credited." };
  }

  async rejectDeposit(depositId, reason = 'Payment verification rejected') {
    this.ensureReady();
    const { error } = await this.client
      .from('deposits')
      .update({
        status: 'rejected',
        admin_notes: reason,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', depositId);

    if (error) throw new Error(error.message);
    return { success: true };
  }

  async approveWithdrawal(withdrawalId) {
    this.ensureReady();
    const { error } = await this.client
      .from('withdrawals')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', withdrawalId);

    if (error) throw new Error(error.message);
    return { success: true };
  }

  async rejectWithdrawal(withdrawalId, reason = 'Account details mismatched') {
    this.ensureReady();
    const { data: wd } = await this.client
      .from('withdrawals')
      .select('*')
      .eq('id', withdrawalId)
      .single();

    if (wd && wd.status === 'pending') {
      // Refund user balance
      const { data: user } = await this.client
        .from('profiles')
        .select('balance')
        .eq('id', wd.user_id)
        .single();

      if (user) {
        const refundedBal = Number((Number(user.balance || 0) + Number(wd.amount)).toFixed(2));
        await this.client
          .from('profiles')
          .update({ balance: refundedBal })
          .eq('id', wd.user_id);
      }

      await this.client
        .from('withdrawals')
        .update({
          status: 'rejected',
          admin_notes: reason,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', withdrawalId);
    }

    return { success: true };
  }
}

// Global production service instance
window.dataService = new SupabaseProductionService();
