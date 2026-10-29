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
    this.selectedGateway = 'telebirr';
    this.selectedScreenshotFile = null;
    this.selectedScreenshotDataUrl = null;

    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  async init() {
    console.log("🚀 Ethio-Mercato Application Initialized");

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

            ${p.status === 'active' ? `
              <button onclick="app.claimDaily('${p.id}')" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-1.5 transition">
                <span>🎁 የቀን ገቢ ሰብስብ (+${p.daily_return} ETB)</span>
              </button>
            ` : `
              <p class="text-center text-[11px] text-slate-400 font-medium py-1">የ 90 ቀናት ዑደት ተጠናቋል።</p>
            `}
          </div>
        `;
      }).join('');
    } catch (err) {
      container.innerHTML = `<div class="text-center py-6 text-xs text-red-400">Error: ${err.message}</div>`;
    }
  }

  async claimDaily(purchaseId) {
    try {
      const res = await window.supabaseService.claimDaily(purchaseId, this.currentUser.id);
      this.showToast(`✅ +${res.daily_return} ETB የቀን ገቢ ወደ ሂሳብዎ ገብቷል!`, 'success');
      await this.refreshUser();
      this.renderPurchases();
    } catch (err) {
      this.showToast(err.message, 'error');
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
  // SCREEN 9: PAYMENT GATEWAYS & SCREENSHOT UPLOAD
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

    const gateway = MERCHANTS[this.selectedGateway];
    if (!gateway) return;

    container.innerHTML = `
      <div class="flex items-center space-x-3 mb-4">
        <div class="w-10 h-10 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center text-xl">
          ${gateway.icon}
        </div>
        <div>
          <h4 class="text-sm font-black text-white">${gateway.title}</h4>
          <span class="text-[10px] text-amber-400 font-semibold">የተረጋገጠ ይፋዊ የክፍያ አካውንት</span>
        </div>
      </div>

      <div class="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
        <div class="flex justify-between items-center pb-2 border-b border-slate-800/80">
          <div>
            <span class="text-[10px] text-slate-400 block">የስም ባለቤት / Recipient Name</span>
            <span class="font-extrabold text-white text-sm">${gateway.name}</span>
          </div>
          <button onclick="app.copyText('${gateway.name}', 'ስም')" class="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700">
            Copy
          </button>
        </div>

        <div class="flex justify-between items-center pt-1">
          <div>
            <span class="text-[10px] text-slate-400 block">${gateway.label}</span>
            <span class="font-mono font-black text-amber-400 text-base tracking-wider">${gateway.account}</span>
          </div>
          <button onclick="app.copyText('${gateway.account}', '${gateway.label}')" class="text-xs font-black px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 shadow">
            ቁጥሩን ኮፒ አድርግ
          </button>
        </div>
      </div>

      <p class="text-[11px] text-slate-400 mt-3 flex items-start space-x-1.5">
        <span class="text-amber-400">ℹ️</span>
        <span>ከላይ በተጠቀሰው አካውንት ትክክለኛውን የብር መጠን ካስተላለፉ በኋላ ደረሰኙን ስክሪንሾት በማድረግ ከስር ያያይዙ።</span>
      </p>
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

      await window.supabaseService.submitDeposit(
        this.currentUser.id,
        this.selectedDepositAmount,
        this.selectedGateway,
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
  // WITHDRAWALS (CONDITIONAL LOGIC ENFORCED)
  // ----------------------------------------------------------------------------
  async openWithdrawModal() {
    if (!this.currentUser) {
      this.showToast('እባክዎ መጀመሪያ ይግቡ / Please sign in first', 'info');
      this.navigateTo('screen-auth');
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

