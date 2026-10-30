// ==============================================================================
// ETHIO-MERCATO VIP - APPLICATION CONTROLLER (app.js)
// ==============================================================================

const VIP_PRODUCTS = [
  {
    id: 1,
    title: "Rolex Submariner VIP1",
    amharic: "ሮሌክስ ሳብማሪነር ቪአይፒ 1",
    price: 700,
    daily_return: 42,
    total_return: 3780,
    duration_days: 90,
    badge: "Popular",
    image_url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: 2,
    title: "Rolex Datejust VIP2",
    amharic: "ሮሌክስ ዴትጀስት ቪአይፒ 2",
    price: 1200,
    daily_return: 78,
    total_return: 7020,
    duration_days: 90,
    badge: "Hot 🔥",
    image_url: "https://images.unsplash.com/photo-1547996160-71dfabbce5d7?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: 3,
    title: "Rolex Oyster VIP3",
    amharic: "ሮሌክስ ኦይስተር ቪአይፒ 3",
    price: 2500,
    daily_return: 175,
    total_return: 15750,
    duration_days: 90,
    badge: "High Yield",
    image_url: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: 4,
    title: "Rolex GMT-Master VIP4",
    amharic: "ሮሌክስ ጂኤምቲ-ማስተር ቪአይፒ 4",
    price: 5000,
    daily_return: 375,
    total_return: 33750,
    duration_days: 90,
    badge: "Super Return",
    image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: 5,
    title: "Rolex Daytona VIP5",
    amharic: "ሮሌክስ ዴይቶና ቪአይፒ 5",
    price: 10000,
    daily_return: 800,
    total_return: 72000,
    duration_days: 90,
    badge: "VIP High",
    image_url: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: 6,
    title: "Rolex Sky-Dweller VIP6",
    amharic: "ሮሌክስ ስካይ-ድዌለር ቪአይፒ 6",
    price: 20000,
    daily_return: 1700,
    total_return: 153000,
    duration_days: 90,
    badge: "Premium",
    image_url: "https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: 7,
    title: "Rolex Day-Date Gold VIP7",
    amharic: "ሮሌክስ ጎልድ ፕሬዝደንት ቪአይፒ 7",
    price: 40000,
    daily_return: 3600,
    total_return: 324000,
    duration_days: 90,
    badge: "Ultimate Crown",
    image_url: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=600&auto=format&fit=crop&q=80"
  }
];

// Presets for Screens 7 & 8: Br 700, Br 1000, Br 2000, Br 5000, Br 10000, Br 20000, Br 40000, Br 80000, Br 100000
const DEPOSIT_PRESETS = [700, 1000, 2000, 5000, 10000, 20000, 40000, 80000, 100000];

// Official merchant accounts for Screen 9
const MERCHANTS = {
  telebirr: {
    id: "telebirr",
    title: "Telebirr Wallet (ቴሌብር)",
    name: "Shibabew",
    account: "0943257056",
    label: "Phone Number (ስልክ ቁጥር)",
    icon: "📱",
    color: "#0072bc"
  },
  cbe: {
    id: "cbe",
    title: "Commercial Bank of Ethiopia (CBE / ንግድ ባንክ)",
    name: "Alehegn",
    account: "1000331894994",
    label: "Account Number (የሂሳብ ቁጥር)",
    icon: "🏛️",
    color: "#6b1480"
  },
  abyssinia: {
    id: "abyssinia",
    title: "Bank of Abyssinia (አቢሲኒያ ባንክ)",
    name: "Alehegn",
    account: "157312097",
    label: "Account Number (የሂሳብ ቁጥር)",
    icon: "🏦",
    color: "#f59e0b"
  }
};

class EthioMercatoApplication {
  constructor() {
    this.currentUser = null;
    this.currentScreen = 'screen-auth';
    this.authMode = 'login';
    this.selectedDepositAmount = 700;
    this.paymentAccounts = [];
    this.selectedGatewayAccount = null;
    this.selectedGateway = 'Telebirr';
    this.selectedScreenshotFile = null;
    this.selectedScreenshotDataUrl = null;

    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  async init() {
    console.log("🚀 Ethio-Mercato Application Initialized");

    // Load dynamic payment accounts & setup realtime sync
    await this.loadPaymentAccounts();
    this.setupRealtimeListeners();

    // Check URL parameters for referral code
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      const inviteInput = document.getElementById('auth-invite');
      if (inviteInput) inviteInput.value = ref.trim().toUpperCase();
      this.setAuthTab('register');
      this.showToast(`🎁 Referral code ${ref} applied! 200 ETB bonus awaits you.`, 'info');
      this.navigateTo('screen-auth');
      return;
    }

    // Check active saved session
    const savedUserId = localStorage.getItem('ethio_mercato_uid');
    if (savedUserId) {
      try {
        const user = await window.supabaseService.getUser(savedUserId);
        if (user) {
          this.currentUser = user;
          this.onLoginSuccess(false);
          return;
        }
      } catch (e) {
        console.warn("Session resume notice:", e);
      }
    }

    // Default landing: Home Dashboard with products catalog (auth screen is hidden)
    this.updateUserUI();
    this.navigateTo('screen-home');
  }

  // ----------------------------------------------------------------------------
  // NAVIGATION CONTROLLER
  // ----------------------------------------------------------------------------
  navigateTo(screenId) {
    // Auth-guard for private screens
    const authProtectedScreens = ['screen-my-products', 'screen-profile', 'screen-deposit-amount', 'screen-payment-gateway'];
    if (authProtectedScreens.includes(screenId) && !this.currentUser) {
      this.showToast('እባክዎ መጀመሪያ ይግቡ / Please sign in first', 'info');
      this.navigateTo('screen-auth');
      return;
    }

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
      if (bottomNav) bottomNav.classList.add('hidden');
      if (globalHeader) globalHeader.classList.add('hidden');
    } else {
      if (bottomNav) bottomNav.classList.remove('hidden');
      if (globalHeader) globalHeader.classList.remove('hidden');
    }

    // Active Tab button state
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
      this.renderCatalog();
      this.refreshUser();
    } else if (screenId === 'screen-my-products') {
      this.renderPurchases();
    } else if (screenId === 'screen-profile') {
      this.renderProfile();
    } else if (screenId === 'screen-invite') {
      this.renderInvite();
    } else if (screenId === 'screen-payment-gateway') {
      this.renderGatewayTabs();
      this.renderMerchantCard();
    }
  }

  // ----------------------------------------------------------------------------
  // SCREEN 1: AUTHENTICATION
  // ----------------------------------------------------------------------------
  setAuthTab(mode) {
    this.authMode = mode;
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const inviteBox = document.getElementById('auth-invite-container');
    const submitBtn = document.getElementById('btn-auth-submit');

    if (mode === 'login') {
      tabLogin.className = "flex-1 py-2.5 text-xs font-bold rounded-xl transition text-slate-950 bg-amber-500 shadow";
      tabRegister.className = "flex-1 py-2.5 text-xs font-bold rounded-xl transition text-slate-400 hover:text-white";
      inviteBox.classList.add('hidden');
      submitBtn.textContent = "አሁን ይግቡ/ይመዝገቡ";
    } else {
      tabRegister.className = "flex-1 py-2.5 text-xs font-bold rounded-xl transition text-slate-950 bg-amber-500 shadow";
      tabLogin.className = "flex-1 py-2.5 text-xs font-bold rounded-xl transition text-slate-400 hover:text-white";
      inviteBox.classList.remove('hidden');
      submitBtn.textContent = "አሁን ይግቡ/ይመዝገቡ (+200 ETB Bonus)";
    }
  }

  async handleAuthSubmit(event) {
    event.preventDefault();
    const phoneInput = document.getElementById('auth-phone');
    const passwordInput = document.getElementById('auth-password');
    const inviteInput = document.getElementById('auth-invite');
    const submitBtn = document.getElementById('btn-auth-submit');

    const phone = phoneInput.value.trim();
    const password = passwordInput.value;
    const inviteCode = inviteInput ? inviteInput.value.trim() : '';

    const orig = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "በማረጋገጥ ላይ...";

    try {
      let user;
      if (this.authMode === 'login') {
        user = await window.supabaseService.signIn(phone, password);
        this.showToast(`እንኳን ደህና መጡ, ${user.phone}!`, 'success');
      } else {
        user = await window.supabaseService.signUp(phone, password, inviteCode);
        this.showToast(`🎉 እንኳን ደስ አለዎት! 200 ETB የቦነስ ሂሳብ ገብቷል።`, 'success');
      }

      this.currentUser = user;
      localStorage.setItem('ethio_mercato_uid', user.id);
      this.onLoginSuccess(true);
    } catch (err) {
      this.showToast(err.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = orig;
    }
  }

  onLoginSuccess(showTelegramModal = true) {
    this.updateUserUI();
    this.navigateTo('screen-home');

    // SCREEN 2: Automatic Telegram Popup Modal upon login
    if (showTelegramModal) {
      setTimeout(() => {
        this.openTelegramModal();
      }, 400);
    }
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('ethio_mercato_uid');
    this.updateUserUI();
    this.showToast("በተሳካ ሁኔታ ወጥተዋል።", "info");
    this.navigateTo('screen-home');
  }

  async refreshUser() {
    if (!this.currentUser) return;
    try {
      const fresh = await window.supabaseService.getUser(this.currentUser.id);
      if (fresh) {
        this.currentUser = fresh;
        this.updateUserUI();
      }
    } catch (e) {
      console.warn("Refresh user notice:", e);
    }
  }

  updateUserUI() {
    const balEl = document.getElementById('home-balance-amount');
    const loginBtn = document.getElementById('btn-header-login');

    if (!this.currentUser) {
      if (balEl) balEl.textContent = '0.00';
      if (loginBtn) loginBtn.classList.remove('hidden');
      return;
    }

    if (loginBtn) loginBtn.classList.add('hidden');
    if (balEl) balEl.textContent = Number(this.currentUser.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // ----------------------------------------------------------------------------
  // SCREEN 2: TELEGRAM MODAL (የቴሌግራም መግለጫ)
  // ----------------------------------------------------------------------------
  openTelegramModal() {
    document.getElementById('modal-telegram').classList.remove('hidden');
  }

  closeTelegramModal() {
    document.getElementById('modal-telegram').classList.add('hidden');
  }

  // ----------------------------------------------------------------------------
  // SCREEN 3: HOME / DASHBOARD & PRODUCT CATALOG
  // ----------------------------------------------------------------------------
  renderCatalog() {
    const container = document.getElementById('products-catalog-container');
    if (!container) return;

    container.innerHTML = VIP_PRODUCTS.map(item => `
      <div class="glass-panel rounded-3xl p-4 border border-slate-800 hover:border-amber-500/50 transition relative overflow-hidden group shadow-lg">
        <span class="absolute top-3 right-3 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
          ${item.badge}
        </span>

        <div class="flex items-center space-x-3.5">
          <div class="w-20 h-20 rounded-2xl overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-800 relative shadow-inner">
            <img src="${item.image_url}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-110 transition duration-300">
            <span class="absolute bottom-1 left-1 bg-black/80 text-amber-400 font-black text-[9px] px-1.5 py-0.2 rounded">
              VIP ${item.id}
            </span>
          </div>

          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-black text-white truncate">${item.title}</h4>
            <p class="text-[11px] text-amber-400 font-semibold truncate">${item.amharic}</p>

            <div class="grid grid-cols-2 gap-2 mt-2 text-[11px] bg-slate-950/70 p-2 rounded-xl border border-slate-800">
              <div>
                <p class="text-slate-400 text-[10px]">ዋጋ / Price</p>
                <p class="font-black text-white">${item.price.toLocaleString()} ETB</p>
              </div>
              <div>
                <p class="text-slate-400 text-[10px]">የቀን ገቢ / Daily</p>
                <p class="font-black text-emerald-400">+${item.daily_return} ETB</p>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div class="text-[10px] text-slate-400">
            <span>ጊዜ: <strong class="text-slate-200">${item.duration_days} ቀናት</strong></span> • 
            <span>ጠቅላላ: <strong class="text-amber-400">${item.total_return.toLocaleString()} ETB</strong></span>
          </div>

          <!-- Screen 4 trigger button -->
          <button onclick="app.openPurchaseModal(${item.id})" class="px-4 py-2 rounded-xl btn-gold text-xs font-black shadow-md shadow-amber-500/10">
            ግዛ
          </button>
        </div>
      </div>
    `).join('');
  }

  // ----------------------------------------------------------------------------
  // SCREEN 4: PURCHASE MODAL ("ግዛ" & "ሰርዝ")
  // ----------------------------------------------------------------------------
  openPurchaseModal(productId) {
    const product = VIP_PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const userBal = Number(this.currentUser ? this.currentUser.balance : 0);
    const hasEnough = userBal >= product.price;

    const modalContent = document.getElementById('modal-product-content');
    modalContent.innerHTML = `
      <div class="text-center mb-4">
        <div class="w-20 h-20 rounded-3xl overflow-hidden mx-auto mb-2.5 border-2 border-amber-500 shadow-xl relative">
          <img src="${product.image_url}" class="w-full h-full object-cover">
          <span class="absolute bottom-1 right-1 bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full">
            VIP ${product.id}
          </span>
        </div>
        <h3 class="text-base font-black text-white">${product.title}</h3>
        <p class="text-xs text-amber-400 font-bold">${product.amharic}</p>
      </div>

      <!-- Financial Details Grid -->
      <div class="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2 mb-4 text-xs">
        <div class="flex justify-between items-center text-slate-300">
          <span>Item Price / የፓኬጅ ዋጋ:</span>
          <span class="font-black text-white text-sm">${product.price.toLocaleString()} ETB</span>
        </div>
        <div class="flex justify-between items-center text-slate-300">
          <span>Daily Return / የቀን ገቢ:</span>
          <span class="font-extrabold text-emerald-400">+${product.daily_return} ETB / ቀን</span>
        </div>
        <div class="flex justify-between items-center text-slate-300">
          <span>Total Cycle / የጊዜ ቆይታ:</span>
          <span class="font-bold text-white">${product.duration_days} Days (ቀናት)</span>
        </div>
        <div class="flex justify-between items-center text-slate-300 pt-2 border-t border-slate-800">
          <span>Total Return / ጠቅላላ ገቢ:</span>
          <span class="font-black text-amber-400 text-sm">${product.total_return.toLocaleString()} ETB</span>
        </div>
      </div>

      <div class="bg-slate-900 p-2.5 rounded-xl border ${hasEnough ? 'border-emerald-500/30' : 'border-red-500/30'} flex justify-between items-center text-xs mb-4">
        <span class="text-slate-400">የአሁኑ ቀሪ ሂሳብ:</span>
        <span class="font-bold ${hasEnough ? 'text-emerald-400' : 'text-red-400'}">${userBal.toFixed(2)} ETB</span>
      </div>

      ${!this.currentUser ? `
        <div class="space-y-2">
          <p class="text-[11px] text-amber-400 text-center font-bold">⚠️ ይህንን ፓኬጅ ለመግዛት እባክዎ መጀመሪያ ይግቡ ወይም ይመዝገቡ።</p>
          <div class="grid grid-cols-2 gap-2.5">
            <button onclick="app.closePurchaseModal()" class="py-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs transition">
              ሰርዝ
            </button>
            <button onclick="app.closePurchaseModal(); app.navigateTo('screen-auth');" class="py-3 rounded-xl btn-gold text-xs font-black">
              ይግቡ / Sign In
            </button>
          </div>
        </div>
      ` : hasEnough ? `
        <!-- Direct "ግዛ" & "ሰርዝ" Buttons -->
        <div class="grid grid-cols-2 gap-2.5">
          <button onclick="app.closePurchaseModal()" class="py-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs transition">
            ሰርዝ
          </button>
          <button onclick="app.confirmPurchase(${product.id})" id="btn-confirm-buy" class="py-3 rounded-xl btn-gold text-xs font-black shadow-lg shadow-amber-500/20">
            ግዛ
          </button>
        </div>
      ` : `
        <div class="space-y-2">
          <p class="text-[11px] text-red-400 text-center font-bold">⚠️ በቂ ቀሪ ሂሳብ የለዎትም። እባክዎ መጀመሪያ ሂሳብ ያስገቡ።</p>
          <div class="grid grid-cols-2 gap-2.5">
            <button onclick="app.closePurchaseModal()" class="py-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs transition">
              ሰርዝ
            </button>
            <button onclick="app.closePurchaseModal(); app.navigateTo('screen-deposit-amount'); app.selectDepositPreset(${product.price});" class="py-3 rounded-xl btn-gold text-xs font-black">
              አስገባ (${product.price} ETB)
            </button>
          </div>
        </div>
      `}
    `;

    document.getElementById('modal-product-detail').classList.remove('hidden');
  }

  closePurchaseModal() {
    document.getElementById('modal-product-detail').classList.add('hidden');
  }

  async confirmPurchase(productId) {
    const product = VIP_PRODUCTS.find(p => p.id === productId);
    if (!product || !this.currentUser) return;

    const btn = document.getElementById('btn-confirm-buy');
    if (btn) {
      btn.disabled = true;
      btn.textContent = "በመግዛት ላይ...";
    }

    try {
      await window.supabaseService.buyProduct(this.currentUser.id, product);
      this.closePurchaseModal();
      this.showToast(`🎉 እንኳን ደስ አለዎት! ${product.title} በተሳካ ሁኔታ ገዝተዋል።`, 'success');
      await this.refreshUser();
      this.navigateTo('screen-my-products');
    } catch (err) {
      this.showToast(err.message, 'error');
      if (btn) {
        btn.disabled = false;
        btn.textContent = "ግዛ";
      }
    }
  }

  // ----------------------------------------------------------------------------
  // SCREEN 5: MY PRODUCTS SCREEN
  // ----------------------------------------------------------------------------

  /**
   * Calculate the 24-hour cooldown status for a purchase.
   * Returns { canCollect, remainingMs, remainingText }
   */
  getCooldownStatus(purchase) {
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

    if (!purchase.last_collected_at) {
      return { canCollect: true, remainingMs: 0, remainingText: '' };
    }

    const lastCollected = new Date(purchase.last_collected_at).getTime();
    const now = Date.now();
    const elapsed = now - lastCollected;

    if (elapsed >= TWENTY_FOUR_HOURS_MS) {
      return { canCollect: true, remainingMs: 0, remainingText: '' };
    }

    const remainingMs = TWENTY_FOUR_HOURS_MS - elapsed;
    const hrs = Math.floor(remainingMs / (60 * 60 * 1000));
    const mins = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
    const secs = Math.floor((remainingMs % (60 * 1000)) / 1000);

    const remainingText = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    return { canCollect: false, remainingMs, remainingText };
  }

  async renderPurchases() {
    if (!this.currentUser) return;
    const container = document.getElementById('my-products-list');
    const activeCountEl = document.getElementById('summary-active-count');
    const totalCollectedEl = document.getElementById('summary-total-collected');
    if (!container) return;

    container.innerHTML = `<div class="text-center py-8 text-xs text-slate-400">የተገዙ እቃዎችን በመጫን ላይ...</div>`;

    try {
      const purchases = await window.supabaseService.getPurchases(this.currentUser.id);
      const activePurchases = purchases.filter(p => p.status === 'active');
      const totalEarned = purchases.reduce((acc, cur) => acc + Number(cur.total_earned || 0), 0);

      if (activeCountEl) activeCountEl.textContent = activePurchases.length;
      if (totalCollectedEl) totalCollectedEl.innerHTML = `${totalEarned.toFixed(2)} <span class="text-xs font-normal">ETB</span>`;

      if (purchases.length === 0) {
        container.innerHTML = `
          <div class="glass-panel rounded-3xl p-8 text-center border border-slate-800">
            <div class="text-4xl mb-3">🛍️</div>
            <h4 class="text-sm font-bold text-white mb-1">እስካሁን የተገዛ እቃ የለም</h4>
            <p class="text-xs text-slate-400 mb-4">የቀን ገቢ ለማግኘት የቪአይፒ ፓኬጅ ይግዙ።</p>
            <button onclick="app.navigateTo('screen-home')" class="px-5 py-2.5 rounded-xl btn-gold text-xs font-black">
              ፓኬጆችን ይመልከቱ
            </button>
          </div>
        `;
        return;
      }

      container.innerHTML = purchases.map(p => {
        const prod = VIP_PRODUCTS.find(item => item.id === p.product_id) || { title: `VIP Package ${p.product_id}` };
        const daysRemaining = p.days_remaining !== undefined ? p.days_remaining : 90;

        // ─── 24-HOUR COOLDOWN STATUS ───────────────────────────────
        const cooldown = this.getCooldownStatus(p);
        let actionButtonHtml = '';

        if (p.status === 'active') {
          if (cooldown.canCollect) {
            // Ready to collect — green active button
            actionButtonHtml = `
              <button onclick="app.claimDaily('${p.id}')" id="claim-btn-${p.id}"
                class="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-1.5 transition active:scale-95">
                <span>🎁</span>
                <span>የቀን ገቢ ሰብስብ (+${p.daily_return} ETB)</span>
              </button>
            `;
          } else {
            // Locked — show countdown timer
            actionButtonHtml = `
              <div class="w-full py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 text-xs font-bold flex items-center justify-center space-x-2 cursor-not-allowed select-none"
                   id="cooldown-display-${p.id}" data-last-collected="${p.last_collected_at}">
                <svg class="w-4 h-4 text-amber-400 flex-shrink-0 animate-spin" style="animation-duration: 3s;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>⏳ ቀሪ ጊዜ: <span class="countdown-timer text-amber-400 font-mono" data-purchase-id="${p.id}">${cooldown.remainingText}</span></span>
              </div>
              <p class="text-center text-[10px] text-slate-500 mt-1.5">የቀን ገቢ በ 24 ሰዓት ውስጥ አንድ ጊዜ ብቻ ነው</p>
            `;
          }
        } else {
          actionButtonHtml = `
            <p class="text-center text-[11px] text-slate-400 font-medium py-1">የ 90 ቀናት ዑደት ተጠናቋል።</p>
          `;
        }
        // ──────────────────────────────────────────────────────────

        return `
          <div class="glass-panel rounded-3xl p-4 border border-slate-800 shadow-lg">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-black text-white">${prod.title}</span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${p.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-300'}">
                ${p.status.toUpperCase()}
              </span>
            </div>

            <div class="grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 text-center my-3">
              <div>
                <p class="text-[9px] text-slate-400">የቀን ገቢ</p>
                <p class="text-xs font-black text-emerald-400">+${p.daily_return} ETB</p>
              </div>
              <div>
                <p class="text-[9px] text-slate-400">ጠቅላላ የተገኘ</p>
                <p class="text-xs font-black text-amber-400">${p.total_earned || 0} ETB</p>
              </div>
              <div>
                <p class="text-[9px] text-slate-400">የቀሩ ቀናት</p>
                <p class="text-xs font-black text-white">${daysRemaining} Days</p>
              </div>
            </div>

            ${actionButtonHtml}
          </div>
        `;
      }).join('');

      // Start the live countdown timers for any locked packages
      this.startCooldownTimers();

    } catch (err) {
      container.innerHTML = `<div class="text-center py-6 text-xs text-red-400">Error: ${err.message}</div>`;
    }
  }

  /**
   * Start live countdown timers that update every second.
   * When a timer reaches 0, it auto-refreshes the purchases list to show the collect button.
   */
  startCooldownTimers() {
    // Clear any previous interval
    if (this._cooldownInterval) {
      clearInterval(this._cooldownInterval);
      this._cooldownInterval = null;
    }

    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

    this._cooldownInterval = setInterval(() => {
      const timerElements = document.querySelectorAll('.countdown-timer');
      if (timerElements.length === 0) {
        clearInterval(this._cooldownInterval);
        this._cooldownInterval = null;
        return;
      }

      let anyExpired = false;

      timerElements.forEach(el => {
        const parentDiv = el.closest('[data-last-collected]');
        if (!parentDiv) return;

        const lastCollectedStr = parentDiv.getAttribute('data-last-collected');
        if (!lastCollectedStr) return;

        const lastCollected = new Date(lastCollectedStr).getTime();
        const now = Date.now();
        const elapsed = now - lastCollected;
        const remainingMs = TWENTY_FOUR_HOURS_MS - elapsed;

        if (remainingMs <= 0) {
          anyExpired = true;
          return;
        }

        const hrs = Math.floor(remainingMs / (60 * 60 * 1000));
        const mins = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
        const secs = Math.floor((remainingMs % (60 * 1000)) / 1000);
        el.textContent = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      });

      // If any timer expired, re-render to show the collect button
      if (anyExpired) {
        clearInterval(this._cooldownInterval);
        this._cooldownInterval = null;
        this.renderPurchases();
      }
    }, 1000);
  }

  async claimDaily(purchaseId) {
    // Disable the button immediately to prevent double-clicks
    const btn = document.getElementById(`claim-btn-${purchaseId}`);
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span>⏳ እየሰበሰበ ነው...</span>`;
      btn.classList.add('opacity-60', 'cursor-not-allowed');
    }

    try {
      const res = await window.supabaseService.claimDaily(purchaseId, this.currentUser.id);
      this.showToast(`✅ +${res.daily_return} ETB የቀን ገቢ ወደ ሂሳብዎ ገብቷል!`, 'success');
      await this.refreshUser();
      this.renderPurchases();
    } catch (err) {
      this.showToast(err.message, 'error');
      // Re-render to restore correct button state
      this.renderPurchases();
    }
  }

  // ----------------------------------------------------------------------------
  // SCREEN 6: MINE (PROFILE) PAGE
  // ----------------------------------------------------------------------------
  async renderProfile() {
    if (!this.currentUser) return;
    await this.refreshUser();

    const phoneEl = document.getElementById('profile-phone');
    const uidEl = document.getElementById('profile-uid');
    const refcodeEl = document.getElementById('profile-refcode');
    const walletEl = document.getElementById('profile-wallet-bal');
    const rechargeEl = document.getElementById('profile-recharge-total');
    const withdrawEl = document.getElementById('profile-withdraw-total');

    if (phoneEl) phoneEl.textContent = this.currentUser.phone;
    if (uidEl) uidEl.textContent = this.currentUser.id.substring(0, 8);
    if (refcodeEl) refcodeEl.textContent = this.currentUser.referral_code || 'ETH777';
    if (walletEl) walletEl.textContent = Number(this.currentUser.balance || 0).toFixed(2);
    if (rechargeEl) rechargeEl.textContent = Number(this.currentUser.total_recharged || 0).toFixed(2);
    if (withdrawEl) withdrawEl.textContent = Number(this.currentUser.total_withdrawn || 0).toFixed(2);
  }

  // ----------------------------------------------------------------------------
  // INVITE / TEAM SCREEN
  // ----------------------------------------------------------------------------
  async renderInvite() {
    if (!this.currentUser) return;
    const codeEl = document.getElementById('invite-code-display');
    const countEl = document.getElementById('team-member-count');
    const listEl = document.getElementById('team-members-list');

    if (codeEl) codeEl.textContent = this.currentUser.referral_code || 'ETH777';

    try {
      const team = await window.supabaseService.getTeamMembers(this.currentUser.referral_code);
      if (countEl) countEl.textContent = team.length;

      if (!listEl) return;
      if (team.length === 0) {
        listEl.innerHTML = `
          <div class="glass-panel rounded-2xl p-6 text-center text-xs text-slate-400 border border-slate-800">
            የግብዣ ኮድዎን ለጓደኞች በማጋራት የቡድን አባላትን ያፍሩና 10% ፈጣን ኮሚሽን ያግኙ!
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
              <p class="text-[10px] text-slate-400">${new Date(m.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <span class="text-[10px] text-emerald-400 font-bold">10% Tier 1</span>
        </div>
      `).join('');
    } catch (err) {
      console.warn("Team query notice:", err);
    }
  }

  copyReferralCode() {
    if (!this.currentUser) return;
    const code = this.currentUser.referral_code || 'ETH777';
    navigator.clipboard.writeText(code).then(() => {
      this.showToast(`የግብዣ ኮድ ኮፒ ተደርጓል: ${code}`, 'success');
    }).catch(() => {
      this.showToast(`ኮድ: ${code}`, 'info');
    });
  }

  copyReferralLink() {
    if (!this.currentUser) return;
    const code = this.currentUser.referral_code || 'ETH777';
    const link = `${window.location.origin}${window.location.pathname}?ref=${code}`;
    navigator.clipboard.writeText(link).then(() => {
      this.showToast("የግብዣ ሊንክ ኮፒ ተደርጓል!", 'success');
    }).catch(() => {
      this.showToast(`ሊንክ: ${link}`, 'info');
    });
  }

  // ----------------------------------------------------------------------------
  // SCREENS 7 & 8: DEPOSIT AMOUNT SELECTION
  // (Br 700, Br 1000, Br 2000, Br 5000, Br 10000, Br 20000, Br 40000, Br 80000, Br 100000)
  // ----------------------------------------------------------------------------
  selectDepositPreset(amount) {
    this.selectedDepositAmount = amount;
    const input = document.getElementById('deposit-input-amount');
    if (input) input.value = amount;

    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.classList.remove('border-amber-500', 'bg-amber-500/20', 'text-amber-400');
      btn.classList.add('border-slate-700', 'bg-slate-950', 'text-slate-300');
    });

    const activeBtn = Array.from(document.querySelectorAll('.preset-btn')).find(b => b.textContent.includes(amount.toLocaleString()));
    if (activeBtn) {
      activeBtn.classList.add('border-amber-500', 'bg-amber-500/20', 'text-amber-400');
    }
  }

  proceedToGateway() {
    const input = document.getElementById('deposit-input-amount');
    const amt = Number(input ? input.value : this.selectedDepositAmount);

    if (!amt || amt < 50) {
      this.showToast("ዝቅተኛው የተቀማጭ መጠን 50 ETB ነው።", 'error');
      return;
    }

    this.selectedDepositAmount = amt;
    const displayEl = document.getElementById('gateway-amount-display');
    if (displayEl) displayEl.textContent = amt.toLocaleString();

    this.navigateTo('screen-payment-gateway');
  }

  // ----------------------------------------------------------------------------
  // DYNAMIC PAYMENT ACCOUNTS (FETCH, REALTIME SYNC & GATEWAY RENDERING)
  // ----------------------------------------------------------------------------
  async loadPaymentAccounts(forceRender = false) {
    try {
      const accounts = await window.supabaseService.getPaymentAccounts(true);
      this.paymentAccounts = accounts || [];

      // Ensure valid selection
      if (this.paymentAccounts.length > 0) {
        const found = this.paymentAccounts.find(a => this.selectedGatewayAccount && a.id === this.selectedGatewayAccount.id);
        if (!found) {
          this.selectedGatewayAccount = this.paymentAccounts[0];
          this.selectedGateway = this.selectedGatewayAccount.provider_name;
        } else {
          this.selectedGatewayAccount = found;
          this.selectedGateway = found.provider_name;
        }
      }

      this.updateWithdrawalMethodsDropdown();

      if (forceRender || this.currentScreen === 'screen-payment-gateway') {
        this.renderGatewayTabs();
        this.renderMerchantCard();
      }
    } catch (err) {
      console.warn("loadPaymentAccounts notice:", err);
    }
  }

  setupRealtimeListeners() {
    if (window.supabaseService?.client) {
      try {
        window.supabaseService.client
          .channel('payment_accounts_user_sync')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'payment_accounts' }, (payload) => {
            console.log("⚡ [Realtime] Payment accounts updated on server:", payload);
            this.loadPaymentAccounts(true);
          })
          .subscribe();
      } catch (err) {
        console.warn("Realtime subscription notice:", err);
      }
    }

    // Cross-tab/window storage sync
    window.addEventListener('storage', (e) => {
      if (e.key === 'ethio_payment_accounts') {
        console.log("⚡ [Storage] Payment accounts updated locally across tabs");
        this.loadPaymentAccounts(true);
      }
    });
  }

  updateWithdrawalMethodsDropdown() {
    const select = document.getElementById('withdraw-method');
    if (!select || !this.paymentAccounts || this.paymentAccounts.length === 0) return;

    const currentVal = select.value;
    select.innerHTML = this.paymentAccounts.map(acc => {
      const visuals = window.getProviderVisuals ? window.getProviderVisuals(acc.provider_name) : { icon: '🏦' };
      return `<option value="${acc.provider_name}">${visuals.icon} ${acc.provider_name}</option>`;
    }).join('');

    if (currentVal && Array.from(select.options).some(o => o.value === currentVal)) {
      select.value = currentVal;
    }
  }

  // ----------------------------------------------------------------------------
  // SCREEN 9: DYNAMIC PAYMENT GATEWAYS & SCREENSHOT UPLOAD
  // ----------------------------------------------------------------------------
  selectGatewayTab(accountId) {
    if (!this.paymentAccounts || this.paymentAccounts.length === 0) return;

    const acc = this.paymentAccounts.find(a => String(a.id) === String(accountId)) ||
                this.paymentAccounts.find(a => a.provider_name.toLowerCase() === String(accountId).toLowerCase());

    if (acc) {
      this.selectedGatewayAccount = acc;
      this.selectedGateway = acc.provider_name;
    }

    this.renderGatewayTabs();
    this.renderMerchantCard();
  }

  renderGatewayTabs() {
    const container = document.getElementById('gateway-tabs-container');
    if (!container) return;

    if (!this.paymentAccounts || this.paymentAccounts.length === 0) {
      container.innerHTML = `
        <div class="col-span-3 text-center py-3 text-xs text-slate-400 bg-slate-900/60 rounded-xl border border-slate-800">
          ምንም ንቁ የክፍያ አማራጭ አልተገኘም
        </div>
      `;
      return;
    }

    // Adjust grid columns dynamically based on number of active accounts
    const count = this.paymentAccounts.length;
    if (count <= 2) {
      container.className = "grid grid-cols-2 gap-2 mb-4";
    } else if (count === 3) {
      container.className = "grid grid-cols-3 gap-2 mb-4";
    } else {
      container.className = "grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4";
    }

    container.innerHTML = this.paymentAccounts.map(acc => {
      const visuals = window.getProviderVisuals ? window.getProviderVisuals(acc.provider_name) : {
        icon: '🏦',
        activeTabClass: 'border-amber-500 bg-amber-500/20 text-amber-300 shadow-lg shadow-amber-500/20',
        inactiveTabClass: 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200'
      };

      const isSelected = this.selectedGatewayAccount && (
        String(this.selectedGatewayAccount.id) === String(acc.id) ||
        this.selectedGatewayAccount.provider_name === acc.provider_name
      );

      const tabClass = isSelected
        ? `py-2.5 px-1.5 rounded-xl text-[11px] font-black border ${visuals.activeTabClass} flex flex-col items-center transition transform scale-[1.02] shadow`
        : `py-2.5 px-1.5 rounded-xl text-[11px] font-medium border ${visuals.inactiveTabClass} flex flex-col items-center transition hover:border-slate-700`;

      // Smart short display name for tab
      let shortName = acc.provider_name;
      if (shortName.includes('Commercial Bank')) shortName = 'CBE';
      else if (shortName.includes('Bank of Abyssinia')) shortName = 'Abyssinia';
      else if (shortName.length > 12) shortName = shortName.substring(0, 11) + '…';

      return `
        <button type="button" onclick="app.selectGatewayTab('${acc.id}')" id="gateway-tab-${acc.id}" class="${tabClass}">
          <span class="text-xl mb-0.5">${visuals.icon}</span>
          <span class="truncate max-w-full font-bold">${shortName}</span>
        </button>
      `;
    }).join('');
  }

  renderMerchantCard() {
    const container = document.getElementById('merchant-account-card');
    if (!container) return;

    const acc = this.selectedGatewayAccount || (this.paymentAccounts && this.paymentAccounts[0]);
    if (!acc) {
      container.innerHTML = `<div class="text-center py-4 text-xs text-slate-500">የክፍያ አካውንት በመጫን ላይ...</div>`;
      return;
    }

    const visuals = window.getProviderVisuals ? window.getProviderVisuals(acc.provider_name) : {
      icon: '🏦',
      label: 'የሂሳብ ቁጥር (Account Number)',
      tagColor: 'text-amber-400',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    };

    container.innerHTML = `
      <div class="flex items-center space-x-3 mb-4">
        <div class="w-11 h-11 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center text-2xl shadow-inner">
          ${visuals.icon}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2">
            <h4 class="text-sm font-black text-white truncate">${acc.provider_name}</h4>
            <span class="text-[9px] px-1.5 py-0.5 rounded ${visuals.badgeClass || 'bg-amber-500/10 text-amber-300 border border-amber-500/20'} font-bold flex-shrink-0">ይፋዊ</span>
          </div>
          <span class="text-[10px] text-amber-400 font-semibold flex items-center space-x-1 mt-0.5">
            <svg class="w-3 h-3 text-emerald-400 inline flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span class="truncate">የተረጋገጠ ይፋዊ የክፍያ አካውንት (Active Gateway)</span>
          </span>
        </div>
      </div>

      <div class="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs shadow-inner">
        <div class="flex justify-between items-center pb-2.5 border-b border-slate-800/80">
          <div class="pr-2">
            <span class="text-[10px] text-slate-400 block font-medium">የስም ባለቤት / Recipient Name</span>
            <span class="font-extrabold text-white text-sm">${acc.account_holder_name}</span>
          </div>
          <button type="button" onclick="app.copyText('${acc.account_holder_name.replace(/'/g, "\\'")}', 'ስም')"
            class="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center space-x-1 flex-shrink-0">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
            <span>Copy</span>
          </button>
        </div>

        <div class="flex justify-between items-center pt-1">
          <div class="pr-2 min-w-0">
            <span class="text-[10px] text-slate-400 block font-medium">${visuals.label || 'የሂሳብ ቁጥር (Account Number)'}</span>
            <span class="font-mono font-black text-amber-400 text-base tracking-wider truncate block">${acc.account_number}</span>
          </div>
          <button type="button" onclick="app.copyText('${acc.account_number}', '${visuals.label || 'ቁጥር'}')"
            class="text-xs font-black px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition flex items-center space-x-1.5 flex-shrink-0">
            <svg class="w-3.5 h-3.5 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
            </svg>
            <span>ቁጥሩን ኮፒ አድርግ</span>
          </button>
        </div>
      </div>

      <div class="text-[11px] text-slate-400 mt-3 flex items-start space-x-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
        <span class="text-amber-400 text-sm flex-shrink-0">ℹ️</span>
        <span class="leading-relaxed">በ <strong class="text-white">${acc.provider_name}</strong> ወደ ሂሳብ ቁጥር <strong class="text-amber-300 font-mono">${acc.account_number}</strong> (${acc.account_holder_name}) ትክክለኛውን የብር መጠን ካስተላለፉ በኋላ የደረሰኝ ስክሪንሾት ከስር ያያይዙ።</span>
      </div>
    `;
  }

  copyText(text, label) {
    navigator.clipboard.writeText(text).then(() => {
      this.showToast(`ኮፒ ተደርጓል (${label}): ${text}`, 'success');
    }).catch(() => {
      this.showToast(`${text}`, 'info');
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
      this.showToast("የደረሰኝ ስክሪንሾት በተሳካ ሁኔታ ተመርጧል።", 'info');
    };
    reader.readAsDataURL(file);
  }

  async submitDepositForm() {
    if (!this.currentUser) return;

    if (!this.selectedScreenshotDataUrl && !this.selectedScreenshotFile) {
      this.showToast("እባክዎ የተከፈለበትን የደረሰኝ ስክሪንሾት ያያይዙ።", 'error');
      return;
    }

    const btn = document.getElementById('btn-submit-deposit');
    const orig = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span>ደረሰኙ ወደ ሰርቨር እየተላከ ነው...</span>`;

    try {
      let screenshotUrl = this.selectedScreenshotDataUrl;
      if (this.selectedScreenshotFile) {
        screenshotUrl = await window.supabaseService.uploadReceipt(this.selectedScreenshotFile);
      }

      const paymentMethod = this.selectedGatewayAccount
        ? this.selectedGatewayAccount.provider_name
        : (this.selectedGateway || 'Telebirr');

      await window.supabaseService.submitDeposit(
        this.currentUser.id,
        this.selectedDepositAmount,
        paymentMethod,
        screenshotUrl
      );

      this.showToast("✅ የተቀማጭ ጥያቄዎ ገብቷል! በአድሚን ተረጋግጦ በቅርቡ ይፀድቃል።", 'success');

      // Reset
      this.selectedScreenshotFile = null;
      this.selectedScreenshotDataUrl = null;
      const preview = document.getElementById('screenshot-preview');
      const placeholder = document.getElementById('upload-placeholder');
      if (preview) preview.classList.add('hidden');
      if (placeholder) placeholder.classList.remove('hidden');

      this.openHistoryModal('deposits');
    } catch (err) {
      this.showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = orig;
    }
  }

  // ----------------------------------------------------------------------------
  // WITHDRAWALS (CONDITIONAL LOGIC ENFORCED: MUST HAVE APPROVED DEPOSIT)
  // ----------------------------------------------------------------------------
  async openWithdrawModal() {
    if (!this.currentUser) {
      this.showToast('እባክዎ መጀመሪያ ይግቡ / Please sign in first', 'info');
      this.navigateTo('screen-auth');
      return;
    }

    // Real-time status checking from Supabase to verify if user has at least one approved deposit
    try {
      const hasApproved = await window.supabaseService.hasApprovedDeposit(this.currentUser.id);
      if (!hasApproved) {
        alert("ይቅርታ! ገንዘብ ለማውጣት መጀመሪያ ብር አስገብተው በአድሚን ማስረጋገጥ/ማጽደቅ ይኖርብዎታል።");
        this.showToast("ይቅርታ! ገንዘብ ለማውጣት መጀመሪያ ብር አስገብተው በአድሚን ማስረጋገጥ/ማጽደቅ ይኖርብዎታል።", 'error');
        return;
      }
    } catch (err) {
      console.warn("Check approved deposit error:", err);
      alert("ይቅርታ! ገንዘብ ለማውጣት መጀመሪያ ብር አስገብተው በአድሚን ማስረጋገጥ/ማጽደቅ ይኖርብዎታል።");
      this.showToast("ይቅርታ! ገንዘብ ለማውጣት መጀመሪያ ብር አስገብተው በአድሚን ማስረጋገጥ/ማጽደቅ ይኖርብዎታል።", 'error');
      return;
    }

    await this.refreshUser();

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

    const amount = Number(amountInput.value);
    const method = methodInput.value;
    const accNum = accNumInput.value.trim();

    try {
      await window.supabaseService.submitWithdrawal(
        this.currentUser.id,
        amount,
        accNum,
        method
      );

      this.closeWithdrawModal();
      this.showToast(`✅ የ ${amount} ETB የወጪ ጥያቄ ቀርቧል! በ 24 ሰዓት ውስጥ ይከፈላል።`, 'success');
      await this.refreshUser();
      this.openHistoryModal('withdrawals');
    } catch (err) {
      alert(err.message);
      this.showToast(err.message, 'error');
    }
  }

  // ----------------------------------------------------------------------------
  // TRANSACTION LEDGER MODAL
  // ----------------------------------------------------------------------------
  async openHistoryModal(type) {
    if (!this.currentUser) return;
    const titleEl = document.getElementById('history-modal-title');
    const contentEl = document.getElementById('history-modal-content');
    if (!contentEl) return;

    document.getElementById('modal-history').classList.remove('hidden');
    contentEl.innerHTML = `<div class="text-center py-6 text-xs text-slate-400">ታሪክ በመጫን ላይ...</div>`;

    if (type === 'deposits') {
      titleEl.textContent = "Deposit Records / የተቀማጭ ታሪክ";
      const records = await window.supabaseService.getDeposits(this.currentUser.id);
      if (records.length === 0) {
        contentEl.innerHTML = `<div class="text-center py-6 text-xs text-slate-400">ምንም የተቀማጭ ታሪክ አልተገኘም።</div>`;
        return;
      }

      contentEl.innerHTML = records.map(r => `
        <div class="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs space-y-1.5">
          <div class="flex justify-between items-center">
            <span class="font-black text-white text-sm">+${r.amount} ETB</span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${r.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : (r.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30')}">
              ${r.status}
            </span>
          </div>
          <div class="text-[10px] text-slate-400 flex justify-between">
            <span>መንገድ: ${r.payment_method.toUpperCase()}</span>
            <span>${new Date(r.created_at).toLocaleDateString()}</span>
          </div>
          ${r.screenshot_url ? `
            <div class="pt-1">
              <a href="${r.screenshot_url}" target="_blank" class="text-[10px] text-amber-400 hover:underline flex items-center space-x-1">
                <span>የተላከውን ደረሰኝ ይመልከቱ ↗</span>
              </a>
            </div>
          ` : ''}
        </div>
      `).join('');
    } else {
      titleEl.textContent = "Withdrawal Records / የወጪ ታሪክ";
      const records = await window.supabaseService.getWithdrawals(this.currentUser.id);
      if (records.length === 0) {
        contentEl.innerHTML = `<div class="text-center py-6 text-xs text-slate-400">ምንም የወጪ ታሪክ አልተገኘም።</div>`;
        return;
      }

      contentEl.innerHTML = records.map(w => `
        <div class="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs space-y-1.5">
          <div class="flex justify-between items-center">
            <span class="font-black text-red-400 text-sm">-${w.amount} ETB</span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${w.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}">
              ${w.status}
            </span>
          </div>
          <div class="text-[10px] text-slate-400 flex justify-between">
            <span>ወደ: ${w.payment_method.toUpperCase()} (${w.account_number})</span>
            <span>${new Date(w.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      `).join('');
    }
  }

  closeHistoryModal() {
    document.getElementById('modal-history').classList.add('hidden');
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

// Instantiate global app
window.app = new EthioMercatoApplication();

