// ==============================================================================
// ETHIO-MERCATO VIP - PRODUCTION CONTROLLER
// ==============================================================================

class EthioMercatoApp {
  constructor() {
    this.currentUser = null;
    this.currentScreen = 'screen-auth';
    this.authMode = 'login';
    this.selectedDepositAmount = 700;
    this.selectedGateway = 'telebirr';
    this.selectedScreenshotFile = null;
    this.selectedScreenshotDataUrl = null;
    this.adminTab = 'deposits';

    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  async init() {
    console.log("💎 Ethio-Mercato VIP Platform initializing...");

    // Check database connection status
    this.updateConnectionStatus();

    // Check URL referral code (?ref=ETH777)
    this.checkReferralParam();

    // Check active session
    const savedUserId = localStorage.getItem('ethio_mercato_auth_user_id');
    if (savedUserId && window.dataService.isReady()) {
      try {
        const user = await window.dataService.getUserProfile(savedUserId);
        if (user) {
          this.currentUser = user;
          this.onLoginSuccess(false);
          return;
        }
      } catch (err) {
        console.warn("Session resume notice:", err);
      }
    }

    // Default to screen-auth
    this.navigateTo('screen-auth');
  }

  updateConnectionStatus() {
    const dot = document.getElementById('connection-dot');
    const text = document.getElementById('connection-text');
    if (!dot || !text) return;

    if (window.dataService && window.dataService.isReady()) {
      dot.className = "w-2 h-2 rounded-full bg-emerald-400";
      text.textContent = "Live Database";
    } else {
      dot.className = "w-2 h-2 rounded-full bg-amber-400 animate-pulse";
      text.textContent = "Setup Required";
    }
  }

  checkConnectionOrPrompt() {
    if (!window.dataService || !window.dataService.isReady()) {
      document.getElementById('modal-db-setup').classList.remove('hidden');
    } else {
      this.showToast("🟢 Connected to Live Supabase Production Database", "success");
    }
  }

  handleSaveAnonKey(event) {
    event.preventDefault();
    const keyInput = document.getElementById('setup-anon-key');
    const key = keyInput ? keyInput.value.trim() : '';

    if (!key) {
      this.showToast("Please enter your Supabase 'anon' public key.", "error");
      return;
    }

    const success = window.dataService.setAnonKey(key);
    if (success) {
      document.getElementById('modal-db-setup').classList.add('hidden');
      this.updateConnectionStatus();
      this.showToast("🟢 Database successfully connected!", "success");
    } else {
      this.showToast("Could not connect. Please verify your anon key.", "error");
    }
  }

  // ----------------------------------------------------------------------------
  // REFERRAL CODE AUTO-FILL
  // ----------------------------------------------------------------------------
  checkReferralParam() {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      const inviteInput = document.getElementById('auth-invite');
      if (inviteInput) {
        inviteInput.value = ref.trim().toUpperCase();
      }
      this.setAuthTab('register');
      this.showToast(`🎁 Referral code ${ref} applied! Register to get your 50 ETB welcome bonus.`, 'info');
    }
  }

  // ----------------------------------------------------------------------------
  // NAVIGATION CONTROLLER
  // ----------------------------------------------------------------------------
  navigateTo(screenId) {
    const screens = document.querySelectorAll('.screen-view');
    screens.forEach(s => s.classList.remove('active'));

    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
      this.currentScreen = screenId;
      window.scrollTo(0, 0);
    }

    const bottomNav = document.getElementById('global-bottom-nav');
    const globalHeader = document.getElementById('global-header');

    if (screenId === 'screen-auth') {
      bottomNav.classList.add('hidden');
      globalHeader.classList.add('hidden');
    } else {
      bottomNav.classList.remove('hidden');
      globalHeader.classList.remove('hidden');
    }

    const navMapping = {
      'screen-home': 'nav-btn-home',
      'screen-my-products': 'nav-btn-products',
      'screen-invite': 'nav-btn-invite',
      'screen-profile': 'nav-btn-profile'
    };

    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    if (navMapping[screenId]) {
      const activeNavBtn = document.getElementById(navMapping[screenId]);
      if (activeNavBtn) activeNavBtn.classList.add('active');
    }

    if (screenId === 'screen-home') {
      this.renderProductsCatalog();
      this.refreshUserData();
    } else if (screenId === 'screen-my-products') {
      this.refreshMyProducts();
    } else if (screenId === 'screen-profile') {
      this.renderProfileScreen();
    } else if (screenId === 'screen-invite') {
      this.renderInviteScreen();
    } else if (screenId === 'screen-payment-gateway') {
      this.renderMerchantCard();
    }
  }

  // ----------------------------------------------------------------------------
  // AUTHENTICATION (SCREEN 1)
  // ----------------------------------------------------------------------------
  setAuthTab(tab) {
    this.authMode = tab;
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const inviteContainer = document.getElementById('auth-invite-container');
    const submitBtn = document.getElementById('btn-auth-submit');

    if (tab === 'login') {
      tabLogin.className = "flex-1 py-2.5 text-xs font-bold rounded-xl transition text-slate-950 bg-amber-500 shadow";
      tabRegister.className = "flex-1 py-2.5 text-xs font-bold rounded-xl transition text-slate-400 hover:text-white";
      inviteContainer.classList.add('hidden');
      submitBtn.textContent = "Sign In / ግባ";
    } else {
      tabRegister.className = "flex-1 py-2.5 text-xs font-bold rounded-xl transition text-slate-950 bg-amber-500 shadow";
      tabLogin.className = "flex-1 py-2.5 text-xs font-bold rounded-xl transition text-slate-400 hover:text-white";
      inviteContainer.classList.remove('hidden');
      submitBtn.textContent = "Create Account / ተመዝገብ (+50 ETB Bonus)";
    }
  }

  async handleAuthSubmit(event) {
    event.preventDefault();
    if (!window.dataService.isReady()) {
      document.getElementById('modal-db-setup').classList.remove('hidden');
      return;
    }

    const phoneInput = document.getElementById('auth-phone');
    const passwordInput = document.getElementById('auth-password');
    const inviteInput = document.getElementById('auth-invite');
    const submitBtn = document.getElementById('btn-auth-submit');

    const phone = phoneInput.value.trim();
    const password = passwordInput.value;
    const inviteCode = inviteInput ? inviteInput.value.trim() : '';

    const origText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Verifying with server...";

    try {
      let user;
      if (this.authMode === 'login') {
        user = await window.dataService.signIn(phone, password);
        this.showToast(`Welcome back, ${user.phone}!`, 'success');
      } else {
        user = await window.dataService.signUp(phone, password, inviteCode);
        this.showToast(`🎉 Registration successful! 50 ETB welcome bonus credited.`, 'success');
      }

      this.currentUser = user;
      localStorage.setItem('ethio_mercato_auth_user_id', user.id);
      this.onLoginSuccess(true);
    } catch (err) {
      this.showToast(err.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = origText;
    }
  }

  onLoginSuccess(showTelegramPopup = true) {
    this.updateUserHeaderUI();
    this.navigateTo('screen-home');

    if (showTelegramPopup) {
      setTimeout(() => {
        this.openTelegramModal();
      }, 400);
    }
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('ethio_mercato_auth_user_id');
    this.showToast("Signed out successfully.", "info");
    this.navigateTo('screen-auth');
  }

  // ----------------------------------------------------------------------------
  // USER BALANCE & HEADER REFRESH
  // ----------------------------------------------------------------------------
  async refreshUserData() {
    if (!this.currentUser || !window.dataService.isReady()) return;
    try {
      const freshUser = await window.dataService.getUserProfile(this.currentUser.id);
      if (freshUser) {
        this.currentUser = freshUser;
        this.updateUserHeaderUI();
      }
    } catch (err) {
      console.warn("User refresh notice:", err);
    }
  }

  updateUserHeaderUI() {
    if (!this.currentUser) return;

    const balEl = document.getElementById('home-balance-amount');
    const vipEl = document.getElementById('home-vip-badge');
    if (balEl) balEl.textContent = Number(this.currentUser.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (vipEl) vipEl.textContent = `VIP ${this.currentUser.vip_level || 0}`;

    const adminPill = document.getElementById('btn-admin-pill');
    if (adminPill) {
      if (this.currentUser.is_admin) {
        adminPill.classList.remove('hidden');
      } else {
        adminPill.classList.add('hidden');
      }
    }
  }

  // ----------------------------------------------------------------------------
  // SCREEN 3: HOME PRODUCT CATALOG
  // ----------------------------------------------------------------------------
  renderProductsCatalog() {
    const container = document.getElementById('products-catalog-container');
    if (!container) return;

    container.innerHTML = PRODUCTS_DATA.map(item => `
      <div class="glass-panel rounded-3xl p-4 border border-slate-800 hover:border-amber-500/50 transition relative overflow-hidden group shadow-lg">
        <span class="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
          ${item.badge}
        </span>

        <div class="flex items-center space-x-3.5">
          <div class="w-20 h-20 rounded-2xl overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-800 relative shadow-inner">
            <img src="${item.image_url}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-110 transition duration-300">
            <span class="absolute bottom-1 left-1 bg-black/80 text-amber-400 font-black text-[9px] px-1.5 py-0.2 rounded">
              VIP ${item.vip_level}
            </span>
          </div>

          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-bold text-white truncate">${item.name}</h4>
            <p class="text-[11px] text-amber-400 font-medium truncate">${item.amharic_name}</p>

            <div class="grid grid-cols-2 gap-2 mt-2 text-[11px] bg-slate-950/70 p-2 rounded-xl border border-slate-800">
              <div>
                <p class="text-slate-400 text-[10px]">Price / ዋጋ</p>
                <p class="font-extrabold text-white">${item.price.toLocaleString()} ETB</p>
              </div>
              <div>
                <p class="text-slate-400 text-[10px]">Daily Return / በቀን</p>
                <p class="font-extrabold text-emerald-400">+${item.daily_income} ETB</p>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div class="text-[10px] text-slate-400">
            <span>Cycle: <strong class="text-slate-200">90 Days</strong></span> • 
            <span>Total: <strong class="text-amber-400">${item.total_return.toLocaleString()} ETB</strong></span>
          </div>

          <button onclick="app.openProductDetail(${item.id})" class="px-4 py-2 rounded-xl btn-gold text-xs font-bold shadow-md shadow-amber-500/10">
            Buy Package / ይግዙ
          </button>
        </div>
      </div>
    `).join('');
  }

  // ----------------------------------------------------------------------------
  // SCREEN 4: PRODUCT DETAIL / PURCHASE MODAL
  // ----------------------------------------------------------------------------
  openProductDetail(productId) {
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (!product) return;

    const userBal = Number(this.currentUser ? this.currentUser.balance : 0);
    const hasEnough = userBal >= product.price;

    const modalContent = document.getElementById('modal-product-content');
    modalContent.innerHTML = `
      <div class="text-center mb-4">
        <div class="w-24 h-24 rounded-3xl overflow-hidden mx-auto mb-3 border-2 border-amber-500 shadow-xl relative">
          <img src="${product.image_url}" class="w-full h-full object-cover">
          <span class="absolute bottom-1 right-1 bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full">
            VIP ${product.vip_level}
          </span>
        </div>
        <h3 class="text-base font-extrabold text-white">${product.name}</h3>
        <p class="text-xs text-amber-400 font-medium">${product.amharic_name}</p>
        <p class="text-[11px] text-slate-300 mt-2">${product.description}</p>
      </div>

      <div class="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2 mb-4 text-xs">
        <div class="flex justify-between items-center text-slate-300">
          <span>Package Price / የፓኬጅ ዋጋ:</span>
          <span class="font-extrabold text-white text-sm">${product.price.toLocaleString()} ETB</span>
        </div>
        <div class="flex justify-between items-center text-slate-300">
          <span>Daily Income / የቀን ገቢ:</span>
          <span class="font-bold text-emerald-400">+${product.daily_income} ETB / day</span>
        </div>
        <div class="flex justify-between items-center text-slate-300">
          <span>Contract Period / የጊዜ ቆይታ:</span>
          <span class="font-bold text-white">90 Days (ቀናት)</span>
        </div>
        <div class="flex justify-between items-center text-slate-300 pt-2 border-t border-slate-800">
          <span>Total Expected Return:</span>
          <span class="font-extrabold text-amber-400 text-sm">${product.total_return.toLocaleString()} ETB</span>
        </div>
      </div>

      <div class="bg-slate-900 p-2.5 rounded-xl border ${hasEnough ? 'border-emerald-500/30' : 'border-red-500/30'} flex justify-between items-center text-xs mb-4">
        <span class="text-slate-400">Your Current Balance:</span>
        <span class="font-bold ${hasEnough ? 'text-emerald-400' : 'text-red-400'}">${userBal.toFixed(2)} ETB</span>
      </div>

      ${hasEnough ? `
        <button onclick="app.confirmPurchase(${product.id})" id="btn-confirm-buy" class="w-full py-3.5 rounded-xl btn-gold text-xs font-bold shadow-lg shadow-amber-500/20">
          Confirm Purchase / ግዢውን አረጋግጥ (${product.price} ETB)
        </button>
      ` : `
        <div class="space-y-2">
          <p class="text-[11px] text-red-400 text-center font-medium">⚠️ Insufficient balance to buy this package.</p>
          <button onclick="app.closeProductModal(); app.navigateTo('screen-deposit-amount'); app.selectDepositPreset(${product.price});" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20">
            Deposit ${product.price} ETB Now / አስገባ
          </button>
        </div>
      `}
    `;

    document.getElementById('modal-product-detail').classList.remove('hidden');
  }

  closeProductModal() {
    document.getElementById('modal-product-detail').classList.add('hidden');
  }

  async confirmPurchase(productId) {
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (!product || !this.currentUser) return;

    const btn = document.getElementById('btn-confirm-buy');
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Processing transaction with database...";
    }

    try {
      await window.dataService.buyProduct(this.currentUser.id, product);
      this.closeProductModal();
      this.showToast(`🎉 Congratulations! You successfully acquired ${product.name}!`, 'success');
      await this.refreshUserData();
      this.navigateTo('screen-my-products');
    } catch (err) {
      this.showToast(err.message, 'error');
      if (btn) {
        btn.disabled = false;
        btn.textContent = `Confirm Purchase (${product.price} ETB)`;
      }
    }
  }

  // ----------------------------------------------------------------------------
  // SCREEN 5: MY PRODUCTS SCREEN
  // ----------------------------------------------------------------------------
  async refreshMyProducts() {
    if (!this.currentUser || !window.dataService.isReady()) return;
    const container = document.getElementById('my-products-list');
    const activeCountEl = document.getElementById('summary-active-count');
    const collectedEl = document.getElementById('summary-total-collected');
    if (!container) return;

    container.innerHTML = `<div class="text-center py-8 text-xs text-slate-400">Fetching live active contracts...</div>`;

    try {
      const contracts = await window.dataService.getUserProducts(this.currentUser.id);
      const activeContracts = contracts.filter(c => c.status === 'active');
      const totalCollected = contracts.reduce((acc, cur) => acc + Number(cur.total_accumulated || 0), 0);

      if (activeCountEl) activeCountEl.textContent = activeContracts.length;
      if (collectedEl) collectedEl.innerHTML = `${totalCollected.toFixed(2)} <span class="text-xs font-normal">ETB</span>`;

      if (contracts.length === 0) {
        container.innerHTML = `
          <div class="glass-panel rounded-3xl p-8 text-center border border-slate-800">
            <div class="text-4xl mb-3">🛍️</div>
            <h4 class="text-sm font-bold text-white mb-1">No Active Packages Found</h4>
            <p class="text-xs text-slate-400 mb-4">Invest in a VIP package to begin receiving guaranteed daily profit returns credited directly to your account.</p>
            <button onclick="app.navigateTo('screen-home')" class="px-5 py-2.5 rounded-xl btn-gold text-xs font-bold">
              Explore Packages / ፓኬጆችን ይመልከቱ
            </button>
          </div>
        `;
        return;
      }

      container.innerHTML = contracts.map(c => {
        const daysLeft = Math.max(0, (c.period_days || 90) - (c.days_elapsed || 0));
        const progressPct = Math.min(100, Math.round(((c.days_elapsed || 0) / (c.period_days || 90)) * 100));

        return `
          <div class="glass-panel rounded-3xl p-4 border border-slate-800 shadow-lg">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-extrabold text-white">${c.product_name}</span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${c.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-300'}">
                ${c.status.toUpperCase()}
              </span>
            </div>

            <div class="grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 text-center my-3">
              <div>
                <p class="text-[9px] text-slate-400">Daily Return</p>
                <p class="text-xs font-extrabold text-emerald-400">+${c.daily_income} ETB</p>
              </div>
              <div>
                <p class="text-[9px] text-slate-400">Total Earned</p>
                <p class="text-xs font-extrabold text-amber-400">${c.total_accumulated || 0} ETB</p>
              </div>
              <div>
                <p class="text-[9px] text-slate-400">Days Remaining</p>
                <p class="text-xs font-extrabold text-white">${daysLeft} Days</p>
              </div>
            </div>

            <div class="mb-3">
              <div class="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Contract Progress</span>
                <span>${c.days_elapsed} / ${c.period_days} Days (${progressPct}%)</span>
              </div>
              <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full" style="width: ${progressPct}%"></div>
              </div>
            </div>

            ${c.status === 'active' ? `
              <button onclick="app.claimDaily('${c.id}')" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-1.5 transition">
                <span>🎁 Claim Today's Profit (+${c.daily_income} ETB)</span>
              </button>
            ` : `
              <p class="text-center text-[11px] text-slate-400 font-medium py-1">Contract 90-day cycle fully completed.</p>
            `}
          </div>
        `;
      }).join('');
    } catch (err) {
      container.innerHTML = `<div class="text-center py-6 text-xs text-red-400">Error: ${err.message}</div>`;
    }
  }

  async claimDaily(contractId) {
    try {
      const res = await window.dataService.claimDailyProfit(this.currentUser.id, contractId);
      this.showToast(res.message, 'success');
      await this.refreshUserData();
      this.refreshMyProducts();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  }

  // ----------------------------------------------------------------------------
  // SCREEN 6: MINE (PROFILE) PAGE
  // ----------------------------------------------------------------------------
  async renderProfileScreen() {
    if (!this.currentUser) return;
    await this.refreshUserData();

    const phoneEl = document.getElementById('profile-phone');
    const vipEl = document.getElementById('profile-vip-pill');
    const uidEl = document.getElementById('profile-uid');
    const refcodeEl = document.getElementById('profile-refcode');
    const walletEl = document.getElementById('profile-wallet-bal');
    const rechargeEl = document.getElementById('profile-recharge-total');
    const withdrawEl = document.getElementById('profile-withdraw-total');

    if (phoneEl) phoneEl.textContent = this.currentUser.phone;
    if (vipEl) vipEl.textContent = `VIP ${this.currentUser.vip_level || 0}`;
    if (uidEl) uidEl.textContent = this.currentUser.id.substring(0, 8);
    if (refcodeEl) refcodeEl.textContent = this.currentUser.referral_code || 'ETH777';

    if (walletEl) walletEl.textContent = Number(this.currentUser.balance || 0).toFixed(2);
    if (rechargeEl) rechargeEl.textContent = Number(this.currentUser.total_recharge || 0).toFixed(2);
    if (withdrawEl) withdrawEl.textContent = Number(this.currentUser.total_withdrawn || 0).toFixed(2);
  }

  // ----------------------------------------------------------------------------
  // INVITE / TEAM SCREEN
  // ----------------------------------------------------------------------------
  async renderInviteScreen() {
    if (!this.currentUser || !window.dataService.isReady()) return;
    const codeEl = document.getElementById('invite-code-display');
    const countEl = document.getElementById('team-member-count');
    const listEl = document.getElementById('team-members-list');

    if (codeEl) codeEl.textContent = this.currentUser.referral_code || 'ETH777';

    try {
      const team = await window.dataService.getTeamMembers(this.currentUser.id, this.currentUser.referral_code);
      if (countEl) countEl.textContent = team.length;

      if (!listEl) return;
      if (team.length === 0) {
        listEl.innerHTML = `
          <div class="glass-panel rounded-2xl p-6 text-center text-xs text-slate-400 border border-slate-800">
            Share your invitation code with prospective investors to build your network and earn 10% direct commission instantly.
          </div>
        `;
        return;
      }

      listEl.innerHTML = team.map(m => `
        <div class="glass-panel rounded-2xl p-3 border border-slate-800 flex items-center justify-between text-xs">
          <div class="flex items-center space-x-2.5">
            <div class="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-amber-400">
              👥
            </div>
            <div>
              <p class="font-bold text-white">${m.phone}</p>
              <p class="text-[10px] text-slate-400">Registered: ${new Date(m.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <div class="text-right">
            <span class="vip-badge text-[9px] px-2 py-0.5 rounded-full">VIP ${m.vip_level}</span>
            <p class="text-[10px] text-emerald-400 font-semibold mt-1">10% Tier 1</p>
          </div>
        </div>
      `).join('');
    } catch (err) {
      console.warn("Could not load team:", err);
    }
  }

  copyReferralCode() {
    if (!this.currentUser) return;
    const code = this.currentUser.referral_code || 'ETH777';
    navigator.clipboard.writeText(code).then(() => {
      this.showToast(`Invitation code copied: ${code}`, 'success');
    }).catch(() => {
      this.showToast(`Code: ${code}`, 'info');
    });
  }

  copyReferralLink() {
    if (!this.currentUser) return;
    const code = this.currentUser.referral_code || 'ETH777';
    const link = `${window.location.origin}${window.location.pathname}?ref=${code}`;
    navigator.clipboard.writeText(link).then(() => {
      this.showToast("Referral link copied to clipboard!", 'success');
    }).catch(() => {
      this.showToast(`Link: ${link}`, 'info');
    });
  }

  // ----------------------------------------------------------------------------
  // SCREENS 7 & 8: DEPOSIT AMOUNT SELECTION
  // ----------------------------------------------------------------------------
  selectDepositPreset(amount) {
    this.selectedDepositAmount = amount;
    const input = document.getElementById('deposit-input-amount');
    if (input) input.value = amount;

    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.classList.remove('border-amber-500', 'bg-amber-500/10', 'text-amber-400');
      btn.classList.add('border-slate-700', 'bg-slate-950', 'text-slate-300');
    });

    const activeBtn = Array.from(document.querySelectorAll('.preset-btn')).find(b => b.textContent.includes(amount.toLocaleString()));
    if (activeBtn) {
      activeBtn.classList.add('border-amber-500', 'bg-amber-500/10', 'text-amber-400');
    }
  }

  proceedToGatewayScreen() {
    const input = document.getElementById('deposit-input-amount');
    const amt = Number(input ? input.value : this.selectedDepositAmount);

    if (!amt || amt < 50) {
      this.showToast("Minimum deposit is 50 ETB.", 'error');
      return;
    }

    this.selectedDepositAmount = amt;
    const displayEl = document.getElementById('gateway-amount-display');
    if (displayEl) displayEl.textContent = amt.toLocaleString();

    this.navigateTo('screen-payment-gateway');
  }

  // ----------------------------------------------------------------------------
  // SCREEN 9: PAYMENT GATEWAY & SCREENSHOT UPLOAD
  // ----------------------------------------------------------------------------
  selectGatewayTab(gatewayId) {
    this.selectedGateway = gatewayId;

    ['telebirr', 'cbe', 'abyssinia'].forEach(id => {
      const tab = document.getElementById(`gateway-tab-${id}`);
      if (!tab) return;
      if (id === gatewayId) {
        tab.className = "py-2.5 px-1 rounded-xl text-xs font-bold border border-amber-500 bg-amber-500/20 text-amber-300 transition flex flex-col items-center shadow";
      } else {
        tab.className = "py-2.5 px-1 rounded-xl text-xs font-bold border border-slate-700 bg-slate-950 text-slate-400 transition flex flex-col items-center";
      }
    });

    this.renderMerchantCard();
  }

  renderMerchantCard() {
    const container = document.getElementById('merchant-account-card');
    if (!container) return;

    const gateway = OFFICIAL_PAYMENT_GATEWAYS[this.selectedGateway];
    if (!gateway) return;

    container.innerHTML = `
      <div class="flex items-center space-x-3 mb-4">
        <div class="p-2.5 rounded-2xl bg-slate-950 border border-slate-700">
          ${gateway.icon_svg}
        </div>
        <div>
          <h4 class="text-sm font-bold text-white">${gateway.title}</h4>
          <span class="text-[10px] text-amber-400 font-semibold">Verified Official Merchant Gateway</span>
        </div>
      </div>

      <div class="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
        <div class="flex justify-between items-center pb-2 border-b border-slate-800/80">
          <div>
            <span class="text-[10px] text-slate-400 block">Recipient Account Name / የስም ባለቤት</span>
            <span class="font-bold text-white text-sm">${gateway.name}</span>
          </div>
          <button onclick="app.copyText('${gateway.name}', 'Account Name')" class="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700">
            Copy
          </button>
        </div>

        <div class="flex justify-between items-center pt-1">
          <div>
            <span class="text-[10px] text-slate-400 block">${gateway.account_label}</span>
            <span class="font-mono font-black text-amber-400 text-base tracking-wider">${gateway.account}</span>
          </div>
          <button onclick="app.copyText('${gateway.account}', '${gateway.account_label}')" class="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 shadow">
            Copy Number
          </button>
        </div>
      </div>

      <p class="text-[11px] text-slate-400 mt-3 flex items-start space-x-1.5">
        <span class="text-amber-400">ℹ️</span>
        <span>${gateway.instructions}</span>
      </p>
    `;
  }

  copyText(text, label) {
    navigator.clipboard.writeText(text).then(() => {
      this.showToast(`Copied ${label}: ${text}`, 'success');
    }).catch(() => {
      this.showToast(`${label}: ${text}`, 'info');
    });
  }

  handleScreenshotSelected(event) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedScreenshotFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.selectedScreenshotDataUrl = e.target.result;
      const preview = document.getElementById('screenshot-preview');
      const placeholder = document.getElementById('upload-placeholder');
      if (preview && placeholder) {
        preview.src = e.target.result;
        preview.classList.remove('hidden');
        placeholder.classList.add('hidden');
      }
      this.showToast("Payment receipt screenshot loaded.", 'info');
    };
    reader.readAsDataURL(file);
  }

  async submitDepositForm() {
    if (!this.currentUser) return;

    if (!this.selectedScreenshotDataUrl && !this.selectedScreenshotFile) {
      this.showToast("Please attach a photo of your payment screenshot.", 'error');
      return;
    }

    const gateway = OFFICIAL_PAYMENT_GATEWAYS[this.selectedGateway];
    const txRefInput = document.getElementById('deposit-tx-ref');
    const txRef = txRefInput ? txRefInput.value.trim() : '';

    const btn = document.getElementById('btn-submit-deposit');
    const origText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span>Uploading Receipt to Supabase...</span>`;

    try {
      let screenshotUrl = this.selectedScreenshotDataUrl;
      if (this.selectedScreenshotFile) {
        screenshotUrl = await window.dataService.uploadReceiptImage(this.selectedScreenshotFile);
      }

      await window.dataService.submitDeposit({
        userId: this.currentUser.id,
        amount: this.selectedDepositAmount,
        paymentMethod: this.selectedGateway,
        merchantName: gateway.name,
        merchantAccount: gateway.account,
        transactionRef: txRef,
        screenshotUrl: screenshotUrl
      });

      this.showToast("✅ Deposit submitted! Awaiting administrator verification.", 'success');

      this.selectedScreenshotFile = null;
      this.selectedScreenshotDataUrl = null;
      const preview = document.getElementById('screenshot-preview');
      const placeholder = document.getElementById('upload-placeholder');
      if (preview) preview.classList.add('hidden');
      if (placeholder) placeholder.classList.remove('hidden');
      if (txRefInput) txRefInput.value = '';

      this.openHistoryModal('deposits');
    } catch (err) {
      this.showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = origText;
    }
  }

  // ----------------------------------------------------------------------------
  // WITHDRAWALS (STRICT BUSINESS RULE ENFORCEMENT)
  // ----------------------------------------------------------------------------
  async openWithdrawModal() {
    if (!this.currentUser) return;
    await this.refreshUserData();

    const availEl = document.getElementById('withdraw-available-bal');
    if (availEl) availEl.textContent = Number(this.currentUser.balance || 0).toFixed(2);

    document.getElementById('modal-withdraw').classList.remove('hidden');
  }

  closeWithdrawModal() {
    document.getElementById('modal-withdraw').classList.add('hidden');
  }

  async handleWithdrawSubmit(event) {
    event.preventDefault();
    if (!this.currentUser) return;

    const amountInput = document.getElementById('withdraw-amount');
    const methodInput = document.getElementById('withdraw-method');
    const accNumInput = document.getElementById('withdraw-acc-num');
    const accNameInput = document.getElementById('withdraw-acc-name');

    const amount = Number(amountInput.value);
    const method = methodInput.value;
    const accNum = accNumInput.value.trim();
    const accName = accNameInput.value.trim();

    try {
      await window.dataService.submitWithdrawal({
        userId: this.currentUser.id,
        amount: amount,
        paymentMethod: method,
        accountNumber: accNum,
        accountHolderName: accName
      });

      this.closeWithdrawModal();
      this.showToast(`✅ Withdrawal of ${amount} ETB registered! Payout is processing.`, 'success');
      await this.refreshUserData();
      this.openHistoryModal('withdrawals');
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  }

  // ----------------------------------------------------------------------------
  // TRANSACTION HISTORY MODAL (DEPOSITS & WITHDRAWALS)
  // ----------------------------------------------------------------------------
  async openHistoryModal(type) {
    if (!this.currentUser || !window.dataService.isReady()) return;
    const titleEl = document.getElementById('history-modal-title');
    const contentEl = document.getElementById('history-modal-content');
    if (!contentEl) return;

    document.getElementById('modal-history').classList.remove('hidden');
    contentEl.innerHTML = `<div class="text-center py-6 text-xs text-slate-400">Loading ledger records...</div>`;

    if (type === 'deposits') {
      titleEl.textContent = "Deposit Records / የተቀማጭ ታሪክ";
      const records = await window.dataService.getUserDeposits(this.currentUser.id);
      if (records.length === 0) {
        contentEl.innerHTML = `<div class="text-center py-6 text-xs text-slate-400">No deposit records found.</div>`;
        return;
      }

      contentEl.innerHTML = records.map(r => `
        <div class="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs space-y-1.5">
          <div class="flex justify-between items-center">
            <span class="font-bold text-white text-sm">+${r.amount} ETB</span>
            <span class="status-${r.status} text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
              ${r.status}
            </span>
          </div>
          <div class="text-[10px] text-slate-400 flex justify-between">
            <span>Gateway: ${r.payment_method.toUpperCase()}</span>
            <span>${new Date(r.created_at).toLocaleString()}</span>
          </div>
          <div class="text-[10px] text-slate-500 truncate">
            Ref: ${r.transaction_ref || 'N/A'}
          </div>
          ${r.screenshot_url ? `
            <div class="pt-1">
              <a href="${r.screenshot_url}" target="_blank" class="text-[10px] text-amber-400 hover:underline flex items-center space-x-1">
                <span>View Uploaded Receipt ↗</span>
              </a>
            </div>
          ` : ''}
        </div>
      `).join('');
    } else {
      titleEl.textContent = "Withdrawal Records / የወጪ ታሪክ";
      const records = await window.dataService.getUserWithdrawals(this.currentUser.id);
      if (records.length === 0) {
        contentEl.innerHTML = `<div class="text-center py-6 text-xs text-slate-400">No withdrawal records found.</div>`;
        return;
      }

      contentEl.innerHTML = records.map(w => `
        <div class="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs space-y-1.5">
          <div class="flex justify-between items-center">
            <span class="font-bold text-red-400 text-sm">-${w.amount} ETB</span>
            <span class="status-${w.status} text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
              ${w.status}
            </span>
          </div>
          <div class="text-[10px] text-slate-400 flex justify-between">
            <span>To: ${w.payment_method.toUpperCase()} (${w.account_number})</span>
            <span>${new Date(w.created_at).toLocaleString()}</span>
          </div>
          <div class="text-[10px] text-slate-400">
            Name: ${w.account_holder_name}
          </div>
        </div>
      `).join('');
    }
  }

  closeHistoryModal() {
    document.getElementById('modal-history').classList.add('hidden');
  }

  // ----------------------------------------------------------------------------
  // SCREEN 2: TELEGRAM CHANNEL POPUP MODAL
  // ----------------------------------------------------------------------------
  openTelegramModal() {
    document.getElementById('modal-telegram').classList.remove('hidden');
  }

  closeTelegramModal() {
    document.getElementById('modal-telegram').classList.add('hidden');
  }

  // ----------------------------------------------------------------------------
  // ADMIN PANEL CONTROLLER
  // ----------------------------------------------------------------------------
  async openAdminModal() {
    document.getElementById('modal-admin').classList.remove('hidden');
    this.refreshAdminPanel();
  }

  closeAdminModal() {
    document.getElementById('modal-admin').classList.add('hidden');
  }

  setAdminTab(tab) {
    this.adminTab = tab;
    const depTab = document.getElementById('admin-tab-deposits');
    const wdTab = document.getElementById('admin-tab-withdrawals');

    if (tab === 'deposits') {
      depTab.className = "flex-1 py-1.5 text-xs font-bold rounded-lg bg-amber-500 text-slate-950 transition";
      wdTab.className = "flex-1 py-1.5 text-xs font-bold rounded-lg text-slate-400 hover:text-white transition";
    } else {
      wdTab.className = "flex-1 py-1.5 text-xs font-bold rounded-lg bg-amber-500 text-slate-950 transition";
      depTab.className = "flex-1 py-1.5 text-xs font-bold rounded-lg text-slate-400 hover:text-white transition";
    }

    this.refreshAdminPanel();
  }

  async refreshAdminPanel() {
    const contentEl = document.getElementById('admin-modal-content');
    const pendingDepCountEl = document.getElementById('admin-pending-dep-count');
    const pendingWdCountEl = document.getElementById('admin-pending-wd-count');

    try {
      const deposits = await window.dataService.getAllDeposits();
      const withdrawals = await window.dataService.getAllWithdrawals();

      const pendingDeps = deposits.filter(d => d.status === 'pending');
      const pendingWds = withdrawals.filter(w => w.status === 'pending');

      if (pendingDepCountEl) pendingDepCountEl.textContent = pendingDeps.length;
      if (pendingWdCountEl) pendingWdCountEl.textContent = pendingWds.length;

      if (this.adminTab === 'deposits') {
        if (deposits.length === 0) {
          contentEl.innerHTML = `<div class="text-center py-6 text-slate-400">No deposits submitted yet.</div>`;
          return;
        }

        contentEl.innerHTML = deposits.map(d => `
          <div class="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
            <div class="flex justify-between items-start">
              <div>
                <p class="font-bold text-white text-sm">+${d.amount} ETB</p>
                <p class="text-[10px] text-slate-400">User: ${d.user_phone}</p>
                <p class="text-[10px] text-slate-400">Gateway: ${d.payment_method.toUpperCase()} (${d.transaction_ref || 'No ref'})</p>
              </div>
              <span class="status-${d.status} text-[9px] px-2 py-0.5 rounded-full capitalize font-bold">
                ${d.status}
              </span>
            </div>

            ${d.screenshot_url ? `
              <div class="my-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                <p class="text-[9px] text-slate-400 mb-1">Receipt Screenshot:</p>
                <a href="${d.screenshot_url}" target="_blank">
                  <img src="${d.screenshot_url}" class="w-full h-32 object-contain bg-black rounded-lg" alt="Receipt">
                </a>
              </div>
            ` : ''}

            ${d.status === 'pending' ? `
              <div class="flex space-x-2 pt-1">
                <button onclick="app.adminApproveDeposit('${d.id}')" class="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition">
                  ✓ Verify & Credit Balance
                </button>
                <button onclick="app.adminRejectDeposit('${d.id}')" class="px-3 py-2 rounded-xl bg-red-600/20 text-red-400 hover:bg-red-600/30 font-bold text-[11px] transition">
                  ✕ Reject
                </button>
              </div>
            ` : ''}
          </div>
        `).join('');
      } else {
        if (withdrawals.length === 0) {
          contentEl.innerHTML = `<div class="text-center py-6 text-slate-400">No withdrawal requests yet.</div>`;
          return;
        }

        contentEl.innerHTML = withdrawals.map(w => `
          <div class="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
            <div class="flex justify-between items-start">
              <div>
                <p class="font-bold text-red-400 text-sm">-${w.amount} ETB</p>
                <p class="text-[10px] text-slate-400">User: ${w.user_phone}</p>
                <p class="text-[10px] text-amber-400">Pay to: ${w.payment_method.toUpperCase()} (${w.account_number})</p>
                <p class="text-[10px] text-slate-300">Name: ${w.account_holder_name}</p>
              </div>
              <span class="status-${w.status} text-[9px] px-2 py-0.5 rounded-full capitalize font-bold">
                ${w.status}
              </span>
            </div>

            ${w.status === 'pending' ? `
              <div class="flex space-x-2 pt-1">
                <button onclick="app.adminApproveWithdrawal('${w.id}')" class="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition">
                  ✓ Mark Paid & Approved
                </button>
                <button onclick="app.adminRejectWithdrawal('${w.id}')" class="px-3 py-2 rounded-xl bg-red-600/20 text-red-400 hover:bg-red-600/30 font-bold text-[11px] transition">
                  ✕ Reject & Refund
                </button>
              </div>
            ` : ''}
          </div>
        `).join('');
      }
    } catch (err) {
      contentEl.innerHTML = `<div class="text-center py-6 text-red-400 text-xs">Error: ${err.message}</div>`;
    }
  }

  async adminApproveDeposit(id) {
    try {
      await window.dataService.approveDeposit(id);
      this.showToast("Deposit approved and balance credited!", 'success');
      this.refreshAdminPanel();
      this.refreshUserData();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  }

  async adminRejectDeposit(id) {
    try {
      await window.dataService.rejectDeposit(id, 'Admin rejected after manual verification');
      this.showToast("Deposit rejected.", 'info');
      this.refreshAdminPanel();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  }

  async adminApproveWithdrawal(id) {
    try {
      await window.dataService.approveWithdrawal(id);
      this.showToast("Withdrawal marked as approved & sent!", 'success');
      this.refreshAdminPanel();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  }

  async adminRejectWithdrawal(id) {
    try {
      await window.dataService.rejectWithdrawal(id, 'Mismatched account holder name');
      this.showToast("Withdrawal rejected and balance refunded to user.", 'info');
      this.refreshAdminPanel();
      this.refreshUserData();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  }

  // ----------------------------------------------------------------------------
  // TOAST NOTIFICATIONS
  // ----------------------------------------------------------------------------
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const colors = {
      success: 'bg-emerald-950 border-emerald-500/50 text-emerald-200',
      error: 'bg-red-950 border-red-500/50 text-red-200',
      info: 'bg-slate-900 border-amber-500/40 text-amber-200'
    };

    const icons = {
      success: '✅',
      error: '⚠️',
      info: '🔔'
    };

    toast.className = `p-3 rounded-2xl border shadow-2xl flex items-center space-x-2 text-xs backdrop-blur-md transform transition-all duration-300 opacity-0 translate-y-2 ${colors[type] || colors.info}`;
    toast.innerHTML = `
      <span class="text-base">${icons[type] || '🔔'}</span>
      <span class="flex-1 font-medium">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('opacity-0', 'translate-y-2');
    }, 10);

    setTimeout(() => {
      toast.classList.add('opacity-0', '-translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
}

// Global production app instance
window.app = new EthioMercatoApp();
