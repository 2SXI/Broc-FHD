/**
 * BROC FITTINGS & HARDWARE — app.js  v5.0
 * ─────────────────────────────────────────────────────────────
 * Fully responsive popup cart drawer + all page interactions.
 * Works on every screen: 320 px phone → 4K desktop.
 * ─────────────────────────────────────────────────────────────
 */
'use strict';

/* ═══════════════════════════════════════════════════════════════
   SUPABASE CONFIG
═══════════════════════════════════════════════════════════════ */
const SUPABASE_URL      = 'https://nasbxjharopveynnwgrg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_io0oLODozq0xdUJiNT37tQ_u2PWURX0';
const WA_NUMBER         = '263780793585';

/* ═══════════════════════════════════════════════════════════════
   ENQUIRY FORM → SUPABASE
═══════════════════════════════════════════════════════════════ */
async function submitToSupabase(data) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/enquiries`, {
      method : 'POST',
      headers: {
        'apikey'       : SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type' : 'application/json',
        'Prefer'       : 'return=representation',
      },
      body: JSON.stringify(data),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, error: result };
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function submitEnquiry(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('cfSubmitBtn');
  const successEl = document.getElementById('cfSuccess');
  const errorEl   = document.getElementById('cfError');
  const name      = document.getElementById('cf-name')?.value?.trim();
  const phone     = document.getElementById('cf-phone')?.value?.trim();
  const email     = document.getElementById('cf-email')?.value?.trim();
  const type      = document.getElementById('cf-type')?.value;
  const cat       = document.getElementById('cf-cat')?.value;
  const message   = document.getElementById('cf-message')?.value?.trim();

  if (!name || !phone || !type || !message) { showToast('Please fill in all required fields.'); return; }

  submitBtn.textContent = 'Submitting...';
  submitBtn.disabled    = true;
  if (successEl) successEl.style.display = 'none';
  if (errorEl)   errorEl.style.display   = 'none';

  const result = await submitToSupabase({
    name, phone,
    email   : email || null,
    subject : type + (cat ? ' · ' + cat : ''),
    message,
  });

  submitBtn.textContent = 'Submit Enquiry →';
  submitBtn.disabled    = false;

  if (result.success) {
    if (successEl) successEl.style.display = 'block';
    e.target.reset();
  } else {
    console.error('[BROC enquiry]', result.error);
    if (errorEl) errorEl.style.display = 'block';
  }
}

/* ═══════════════════════════════════════════════════════════════
   CATEGORY FILTER / SORT
═══════════════════════════════════════════════════════════════ */
function filterCat(btn, cat) {
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.product-card').forEach(card => {
    const show = cat === 'all' || card.dataset.cat === cat;
    card.classList.toggle('hidden', !show);
    if (show) card.style.animation = 'fadeIn 0.3s ease forwards';
  });
}

function showAllProducts() {
  const btn = document.querySelector('.cat-btn[data-cat="all"]');
  if (btn) filterCat(btn, 'all');
  document.querySelector('.products-section')?.scrollIntoView({ behavior: 'smooth' });
}

function sortProducts(value) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll('.product-card'));
  const getPrice = c => parseFloat(c.dataset.price || 0);
  const getName  = c => (c.querySelector('.pc-name')?.textContent || '').trim();
  if      (value === 'name')       cards.sort((a,b) => getName(a).localeCompare(getName(b)));
  else if (value === 'price-asc')  cards.sort((a,b) => getPrice(a) - getPrice(b));
  else if (value === 'price-desc') cards.sort((a,b) => getPrice(b) - getPrice(a));
  else if (value === 'new')        cards.sort((a,b) => (b.querySelector('.pc-badge.new')?1:0) - (a.querySelector('.pc-badge.new')?1:0));
  else cards.sort((a,b) => parseInt(a.dataset.originalIndex||0) - parseInt(b.dataset.originalIndex||0));
  cards.forEach(c => grid.appendChild(c));
}

/* ═══════════════════════════════════════════════════════════════
   WISHLIST — event delegation (works with dynamically loaded cards)
═══════════════════════════════════════════════════════════════ */
function initWishlists() {
  const grid = document.getElementById('productsGrid');
  if (!grid || grid.dataset.wishlistInit) return;
  grid.dataset.wishlistInit = '1';
  grid.addEventListener('click', e => {
    const btn = e.target.closest('.pc-wishlist');
    if (!btn) return;
    e.stopPropagation();
    const wished = btn.dataset.wished === '1';
    btn.dataset.wished = wished ? '0' : '1';
    btn.style.color    = wished ? '' : '#e8453c';
    btn.innerHTML = wished
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>'
      : '<svg width="14" height="14" viewBox="0 0 24 24" fill="#e8453c" stroke="#e8453c" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
    showToast(wished ? 'Removed from saved items' : 'Saved to wishlist');
  });
}

/* ═══════════════════════════════════════════════════════════════
   CART UI — fully responsive popup drawer
   ─────────────────────────────────────────────────────────────
   Breakpoints handled entirely in JS + inline styles so it works
   even when styles.css cart overrides are missing/stale.
═══════════════════════════════════════════════════════════════ */
const CartUI = {

  /* ── open / close / toggle ─────────────────────────────── */
  open() {
    this._build();
    const d = document.getElementById('brocCartDrawer');
    const o = document.getElementById('brocCartOverlay');
    if (!d || !o) return;
    // Force layout before adding open so transition fires
    d.getBoundingClientRect();
    d.classList.add('bcd-open');
    o.classList.add('bcd-open');
    document.body.style.overflow = 'hidden';
    this.render();
  },

  close() {
    const d = document.getElementById('brocCartDrawer');
    const o = document.getElementById('brocCartOverlay');
    if (d) d.classList.remove('bcd-open');
    if (o) o.classList.remove('bcd-open');
    document.body.style.overflow = '';
  },

  toggle() {
    const d = document.getElementById('brocCartDrawer');
    d?.classList.contains('bcd-open') ? this.close() : this.open();
  },

  /* ── build DOM once ────────────────────────────────────── */
  _built: false,
  _build() {
    if (this._built) return;
    this._built = true;

    /* Inject all cart CSS into <head> — self-contained, no external dep */
    const style = document.createElement('style');
    style.textContent = `
/* ── Cart Overlay ───────────────────────────────────────────── */
#brocCartOverlay{
  position:fixed;inset:0;z-index:1098;
  background:rgba(0,0,0,.55);
  backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);
  opacity:0;visibility:hidden;
  transition:opacity .32s ease,visibility .32s ease;
}
#brocCartOverlay.bcd-open{opacity:1;visibility:visible;}

/* ── Cart Drawer ─────────────────────────────────────────────── */
#brocCartDrawer{
  position:fixed;top:0;right:0;
  width:min(420px,100vw);
  height:100%;height:100dvh;
  background:#0d0d0d;
  border-left:1px solid rgba(90,90,90,.22);
  box-shadow:none;
  z-index:1099;
  display:flex;flex-direction:column;
  transform:translateX(100%);
  transition:transform .32s cubic-bezier(.4,0,.2,1);
  will-change:transform;
}
#brocCartDrawer.bcd-open{transform:translateX(0);box-shadow:-16px 0 56px rgba(0,0,0,.4);}

/* ── Header ──────────────────────────────────────────────────── */
.bcd-hdr{
  display:flex;align-items:center;justify-content:space-between;
  padding:18px 20px 16px;
  border-bottom:1px solid rgba(90,90,90,.15);
  flex-shrink:0;
  gap:12px;
}
.bcd-hdr-left{display:flex;align-items:center;gap:10px;min-width:0;}
.bcd-title{
  font-family:'Barlow Condensed',sans-serif;
  font-size:17px;font-weight:900;text-transform:uppercase;
  letter-spacing:1.5px;color:#e2e2e2;white-space:nowrap;
}
.bcd-badge{
  background:#e85d26;color:#fff;
  font-family:'DM Mono',monospace;font-size:9px;font-weight:700;
  padding:2px 7px;letter-spacing:.5px;
  min-width:18px;text-align:center;
  display:none;flex-shrink:0;
}
.bcd-badge.vis{display:inline-block;}
.bcd-close{
  width:34px;height:34px;min-width:34px;
  display:flex;align-items:center;justify-content:center;
  background:none;border:1px solid rgba(90,90,90,.2);
  color:rgba(226,226,226,.5);cursor:pointer;
  transition:all .2s;flex-shrink:0;
}
.bcd-close:hover{color:#e2e2e2;border-color:rgba(90,90,90,.5);}

/* ── Empty state ─────────────────────────────────────────────── */
.bcd-empty{
  flex:1;display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  gap:10px;text-align:center;padding:32px 24px;
}
.bcd-empty-icon{color:rgba(90,90,90,.22);margin-bottom:4px;}
.bcd-empty-title{
  font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:800;
  text-transform:uppercase;letter-spacing:1px;color:rgba(226,226,226,.22);
}
.bcd-empty-sub{font-size:12px;color:rgba(226,226,226,.15);line-height:1.7;}
.bcd-empty-cta{
  margin-top:8px;padding:11px 22px;
  background:transparent;border:1px solid rgba(90,90,90,.3);
  color:#5a5a5a;cursor:pointer;
  font-family:'Barlow Condensed',sans-serif;
  font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;
  transition:all .2s;
}
.bcd-empty-cta:hover{background:rgba(90,90,90,.1);color:#e2e2e2;}

/* ── Items list ──────────────────────────────────────────────── */
.bcd-items{
  flex:1;overflow-y:auto;overflow-x:hidden;
  padding:0;
  /* Smooth momentum scrolling on iOS */
  -webkit-overflow-scrolling:touch;
  overscroll-behavior:contain;
}
.bcd-items::-webkit-scrollbar{width:3px;}
.bcd-items::-webkit-scrollbar-thumb{background:rgba(90,90,90,.3);}

/* ── Item row ────────────────────────────────────────────────── */
.bcd-item{
  display:grid;
  grid-template-columns:56px 1fr;
  gap:12px;
  align-items:start;
  padding:14px 20px;
  border-bottom:1px solid rgba(90,90,90,.07);
  transition:background .18s;
}
.bcd-item:last-child{border-bottom:none;}
.bcd-item:hover{background:rgba(90,90,90,.04);}

.bcd-thumb{
  width:56px;height:56px;min-width:56px;
  background:rgba(226,226,226,.04);
  border:1px solid rgba(90,90,90,.12);
  display:flex;align-items:center;justify-content:center;
  overflow:hidden;flex-shrink:0;
}
.bcd-thumb img{width:100%;height:100%;object-fit:cover;display:block;}
.bcd-thumb-ph{color:rgba(90,90,90,.2);}

.bcd-info{min-width:0;}
.bcd-iname{
  font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;
  text-transform:uppercase;letter-spacing:.3px;color:#e2e2e2;
  line-height:1.2;margin-bottom:2px;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.bcd-iprice{
  font-family:'DM Mono',monospace;font-size:9px;
  color:rgba(226,226,226,.32);margin-bottom:9px;
}
.bcd-qty-row{display:flex;align-items:center;gap:0;flex-wrap:nowrap;}
.bcd-qbtn{
  width:28px;height:28px;min-width:28px;
  display:flex;align-items:center;justify-content:center;
  background:rgba(90,90,90,.1);
  border:1px solid rgba(90,90,90,.22);
  color:#e2e2e2;font-size:16px;line-height:1;
  cursor:pointer;transition:background .15s;flex-shrink:0;
  /* Big enough tap target on mobile */
  touch-action:manipulation;
}
.bcd-qbtn:hover:not(:disabled){background:rgba(90,90,90,.25);}
.bcd-qbtn:disabled{opacity:.3;cursor:not-allowed;}
.bcd-qnum{
  min-width:32px;text-align:center;
  font-family:'DM Mono',monospace;font-size:11px;color:#e2e2e2;
  border-top:1px solid rgba(90,90,90,.2);
  border-bottom:1px solid rgba(90,90,90,.2);
  background:rgba(226,226,226,.02);
  height:28px;display:flex;align-items:center;justify-content:center;
  padding:0 4px;user-select:none;
}
.bcd-itotal{
  font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:800;
  color:#e2e2e2;white-space:nowrap;padding-top:2px;
}
.bcd-iright{
  display:flex;flex-direction:column;align-items:flex-end;
  gap:4px;flex-shrink:0;
}
.bcd-remove{
  background:none;border:none;
  font-family:'DM Mono',monospace;font-size:8px;letter-spacing:1px;
  text-transform:uppercase;color:rgba(232,93,38,.4);
  cursor:pointer;padding:0;transition:color .15s;
  touch-action:manipulation;
}
.bcd-remove:hover{color:#e85d26;}

/* ── Footer ──────────────────────────────────────────────────── */
.bcd-footer{
  border-top:1px solid rgba(90,90,90,.15);
  padding:16px 20px 20px;
  flex-shrink:0;
  /* Safe area on iPhone X+ */
  padding-bottom:max(20px,env(safe-area-inset-bottom));
}

/* Free delivery bar */
.bcd-ship{margin-bottom:14px;}
.bcd-ship-lbl{
  display:flex;justify-content:space-between;
  font-family:'DM Mono',monospace;font-size:8px;letter-spacing:1.5px;
  text-transform:uppercase;color:rgba(226,226,226,.28);
  margin-bottom:5px;
}
.bcd-ship-track{height:3px;background:rgba(90,90,90,.14);position:relative;overflow:hidden;}
.bcd-ship-fill{
  position:absolute;left:0;top:0;height:100%;
  background:#25D366;transition:width .5s ease;
}

/* Summary rows */
.bcd-sum{margin-bottom:12px;}
.bcd-sum-row{
  display:flex;justify-content:space-between;align-items:baseline;
  padding:3px 0;font-size:11px;color:rgba(226,226,226,.38);
}
.bcd-sum-row.total{
  border-top:1px solid rgba(90,90,90,.14);
  margin-top:6px;padding-top:10px;
}
.bcd-slbl{
  font-family:'DM Mono',monospace;font-size:8px;
  letter-spacing:1.5px;text-transform:uppercase;
}
.bcd-sval{
  font-family:'Barlow Condensed',sans-serif;font-size:12px;
  font-weight:700;color:rgba(226,226,226,.6);
}
.bcd-sum-row.total .bcd-sval{
  font-size:24px;font-weight:900;color:#e2e2e2;
}

/* Buttons */
.bcd-checkout{
  width:100%;padding:14px 12px;
  background:#e85d26;color:#fff;border:none;
  font-family:'Barlow Condensed',sans-serif;
  font-size:14px;font-weight:900;letter-spacing:2px;text-transform:uppercase;
  cursor:pointer;transition:opacity .2s;
  display:flex;align-items:center;justify-content:center;gap:10px;
  margin-bottom:8px;
  touch-action:manipulation;
  /* Prevent text wrapping on small screens */
  white-space:nowrap;overflow:hidden;
}
.bcd-checkout:hover{opacity:.88;}
.bcd-wa{
  width:100%;padding:11px 12px;
  background:rgba(37,211,102,.1);
  border:1px solid rgba(37,211,102,.3);
  color:#25D366;cursor:pointer;
  font-family:'Barlow Condensed',sans-serif;
  font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;
  transition:all .2s;margin-bottom:8px;
  display:flex;align-items:center;justify-content:center;gap:8px;
  white-space:nowrap;overflow:hidden;
  touch-action:manipulation;
}
.bcd-wa:hover{background:rgba(37,211,102,.18);border-color:#25D366;}
.bcd-clr{
  width:100%;padding:7px;
  background:transparent;border:none;
  color:rgba(226,226,226,.16);cursor:pointer;
  font-family:'DM Mono',monospace;font-size:8px;
  letter-spacing:1.5px;text-transform:uppercase;
  transition:color .2s;
  touch-action:manipulation;
}
.bcd-clr:hover{color:rgba(232,93,38,.55);}

/* ── Cart count pop animation ────────────────────────────────── */
@keyframes bcdPop{0%{transform:scale(1)}45%{transform:scale(1.4)}100%{transform:scale(1)}}
.bcd-count-pop{animation:bcdPop .32s ease;}

/* ── Responsive: narrow phones (< 390 px) ────────────────────── */
@media(max-width:389px){
  #brocCartDrawer{width:100vw;}
  .bcd-item{padding:12px 14px;gap:10px;}
  .bcd-thumb{width:48px;height:48px;min-width:48px;}
  .bcd-footer{padding:14px 14px max(16px,env(safe-area-inset-bottom));}
  .bcd-hdr{padding:14px 14px 12px;}
  .bcd-checkout{font-size:12px;letter-spacing:1.5px;}
  .bcd-wa{font-size:10px;}
}

/* ── Safe-area on notched phones ─────────────────────────────── */
@supports(padding-bottom:env(safe-area-inset-bottom)){
  .bcd-footer{
    padding-bottom:max(20px,env(safe-area-inset-bottom));
  }
}
    `;
    document.head.appendChild(style);

    /* Overlay */
    const overlay = document.createElement('div');
    overlay.id = 'brocCartOverlay';
    overlay.addEventListener('click', () => this.close());
    document.body.appendChild(overlay);

    /* Drawer */
    const drawer = document.createElement('div');
    drawer.id   = 'brocCartDrawer';
    drawer.setAttribute('role','dialog');
    drawer.setAttribute('aria-modal','true');
    drawer.setAttribute('aria-label','Shopping cart');
    drawer.innerHTML = `
      <div class="bcd-hdr">
        <div class="bcd-hdr-left">
          <span class="bcd-title">Your Cart</span>
          <span class="bcd-badge" id="bcdBadge">0</span>
        </div>
        <button class="bcd-close" id="bcdClose" aria-label="Close cart">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div id="bcdBody" style="flex:1;display:flex;flex-direction:column;overflow:hidden;min-height:0;"></div>
      <div class="bcd-footer" id="bcdFooter" style="display:none;"></div>`;
    document.body.appendChild(drawer);

    /* Close button */
    drawer.querySelector('#bcdClose').addEventListener('click', () => this.close());

    /* Qty / remove delegation */
    drawer.addEventListener('click', e => {
      const qb = e.target.closest('.bcd-qbtn');
      if (qb) {
        e.stopPropagation();
        if (typeof Cart !== 'undefined') Cart.updateQty(qb.dataset.id, parseInt(qb.dataset.delta, 10));
        return;
      }
      const rb = e.target.closest('.bcd-remove');
      if (rb) {
        e.stopPropagation();
        if (typeof Cart !== 'undefined') Cart.remove(rb.dataset.id);
      }
    });

    /* Swipe-to-close on mobile */
    let _touchX = 0;
    drawer.addEventListener('touchstart', e => { _touchX = e.touches[0].clientX; }, { passive: true });
    drawer.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - _touchX;
      if (dx > 60) this.close(); // swipe right → close
    }, { passive: true });

    /* Escape key */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && drawer.classList.contains('bcd-open')) this.close();
    });
  },

  /* ── render contents ───────────────────────────────────── */
  render() {
    this._build();
    const items  = (typeof Cart !== 'undefined') ? Cart._items  : [];
    const total  = (typeof Cart !== 'undefined') ? Cart.total   : 0;
    const count  = (typeof Cart !== 'undefined') ? Cart.count   : 0;

    /* Badge */
    const badge = document.getElementById('bcdBadge');
    if (badge) { badge.textContent = count; badge.classList.toggle('vis', count > 0); }

    const body   = document.getElementById('bcdBody');
    const footer = document.getElementById('bcdFooter');
    if (!body || !footer) return;

    /* ── Empty ── */
    if (!items.length) {
      footer.style.display = 'none';
      body.innerHTML = `
        <div class="bcd-empty">
          <div class="bcd-empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity=".35">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <div class="bcd-empty-title">Cart is empty</div>
          <div class="bcd-empty-sub">Add products from our catalogue<br>to build your order.</div>
          <button class="bcd-empty-cta" onclick="CartUI.close();if(document.getElementById('products')){document.getElementById('products').scrollIntoView({behavior:'smooth'});}else{window.location.href='products.html';}">
            Browse Products
          </button>
        </div>`;
      return;
    }

    /* ── Items ── */
    body.innerHTML = `<div class="bcd-items">${items.map(i => this._item(i)).join('')}</div>`;

    /* ── Footer ── */
    const FREE_THRESHOLD = 50;
    const towards = Math.max(0, FREE_THRESHOLD - total);
    const pct     = Math.min(100, (total / FREE_THRESHOLD) * 100).toFixed(1);
    const shipMsg = towards <= 0
      ? 'Free delivery unlocked ✓'
      : `USD ${towards.toFixed(2)} away from free delivery`;

    footer.style.display = '';
    footer.innerHTML = `
      <div class="bcd-ship">
        <div class="bcd-ship-lbl">
          <span>${_e(shipMsg)}</span>
          <span>${towards > 0 ? '$' + FREE_THRESHOLD : ''}</span>
        </div>
        <div class="bcd-ship-track">
          <div class="bcd-ship-fill" style="width:${pct}%"></div>
        </div>
      </div>
      <div class="bcd-sum">
        <div class="bcd-sum-row">
          <span class="bcd-slbl">Subtotal (${count} item${count!==1?'s':''})</span>
          <span class="bcd-sval">USD ${total.toFixed(2)}</span>
        </div>
        <div class="bcd-sum-row">
          <span class="bcd-slbl">Delivery</span>
          <span class="bcd-sval">${towards<=0?'Free':'At checkout'}</span>
        </div>
        <div class="bcd-sum-row total">
          <span class="bcd-slbl">Total</span>
          <span class="bcd-sval">USD ${total.toFixed(2)}</span>
        </div>
      </div>
      <button class="bcd-checkout" id="bcdCheckoutBtn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0">
          <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
        Checkout — USD ${total.toFixed(2)}
      </button>
      <button class="bcd-wa" id="bcdWaBtn">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
        </svg>
        Order via WhatsApp
      </button>
      <button class="bcd-clr" id="bcdClrBtn">Clear cart</button>`;

    document.getElementById('bcdCheckoutBtn')?.addEventListener('click', () => {
      this.close();
      if (typeof Checkout !== 'undefined') Checkout.open();
      else showToast('Checkout coming soon — use WhatsApp for now.');
    });
    document.getElementById('bcdWaBtn')?.addEventListener('click', () => {
      Cart?.sendViaWhatsApp?.();
    });
    document.getElementById('bcdClrBtn')?.addEventListener('click', () => {
      Cart?.clear();
      this.render();
    });
  },

  _item(item) {
    const thumb = item.image
      ? `<img src="${_e(item.image)}" alt="${_e(item.name)}" loading="lazy">`
      : `<div class="bcd-thumb-ph"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".35"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></div>`;
    return `
      <div class="bcd-item">
        <div class="bcd-thumb">${thumb}</div>
        <div class="bcd-info">
          <div class="bcd-iname" title="${_e(item.name)}">${_e(item.name)}</div>
          <div class="bcd-iprice">USD ${item.price.toFixed(2)} each</div>
          <div class="bcd-qty-row">
            <button class="bcd-qbtn" data-id="${_e(item.id)}" data-delta="-1"
              ${item.qty <= 1 ? 'disabled' : ''} aria-label="Decrease">−</button>
            <span class="bcd-qnum">${item.qty}</span>
            <button class="bcd-qbtn" data-id="${_e(item.id)}" data-delta="1"
              aria-label="Increase">+</button>
          </div>
        </div>
        <div class="bcd-iright">
          <span class="bcd-itotal">USD ${(item.price * item.qty).toFixed(2)}</span>
          <button class="bcd-remove" data-id="${_e(item.id)}" aria-label="Remove ${_e(item.name)}">Remove</button>
        </div>
      </div>`;
  },

  /* ── public: refresh when already open ─────────────────── */
  refresh() {
    const d = document.getElementById('brocCartDrawer');
    if (d?.classList.contains('bcd-open')) this.render();
    this.syncCount();
  },

  /* ── sync nav badge ─────────────────────────────────────── */
  syncCount() {
    const count   = (typeof Cart !== 'undefined') ? Cart.count : 0;
    const counter = document.getElementById('cartCount');
    if (!counter) return;
    const prev = parseInt(counter.textContent || '0', 10);
    counter.textContent = count;
    counter.style.background = count > 0 ? '#e85d26' : 'rgba(255,255,255,0.25)';
    /* Pop animation when count increases */
    if (count > prev) {
      counter.classList.remove('bcd-count-pop');
      void counter.offsetWidth; // reflow
      counter.classList.add('bcd-count-pop');
      setTimeout(() => counter.classList.remove('bcd-count-pop'), 360);
    }
  },
};

/* ── Shims so broc-shop.js keeps working ─────────────────────── */
function toggleSidebar()    { CartUI.toggle(); }
function clearEnquiry()     { typeof Cart !== 'undefined' && Cart.clear(); }
function sendEnquiryViaWA() { typeof Cart !== 'undefined' && Cart.sendViaWhatsApp?.(); }

/* ═══════════════════════════════════════════════════════════════
   NAV SCROLL
═══════════════════════════════════════════════════════════════ */
function initNavScroll() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;
  let last = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 60);
    const scrollBtn = document.getElementById('scrollTop');
    if (scrollBtn) scrollBtn.classList.toggle('visible', y > 500);
    last = y;
  }, { passive: true });
}

/* ═══════════════════════════════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════════════════════════════ */
function initRevealObserver() {
  const els = document.querySelectorAll('.reveal-section, .reveal, .reveal-up');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));

  const af = document.querySelectorAll('.af-row');
  if (af.length) {
    const ioAf = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) { setTimeout(() => entry.target.classList.add('visible'), i * 100); ioAf.unobserve(entry.target); }
      });
    }, { threshold: 0.1 });
    af.forEach(el => ioAf.observe(el));
  }
}

/* ═══════════════════════════════════════════════════════════════
   COUNTER ANIMATION
═══════════════════════════════════════════════════════════════ */
function animateCount(el, target, duration = 2000) {
  const start = performance.now();
  const run = time => {
    const p = Math.min((time - start) / duration, 1);
    const v = Math.round((1 - Math.pow(1-p, 3)) * target);
    el.childNodes[0].textContent = v.toLocaleString();
    if (p < 1) requestAnimationFrame(run);
  };
  requestAnimationFrame(run);
}
function initCounters() {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { animateCount(e.target, parseInt(e.target.dataset.count)); io.unobserve(e.target); } });
  }, { threshold: 0.5 });
  els.forEach(el => io.observe(el));
}

/* ═══════════════════════════════════════════════════════════════
   MOBILE NAV
═══════════════════════════════════════════════════════════════ */
function initMobileNav() {
  const hamburger = document.getElementById('navHamburger');
  if (!hamburger) return;
  let panel = document.querySelector('.mobile-nav-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.className = 'mobile-nav-panel';
    panel.innerHTML = `
      <nav>
        <a href="about.html"      class="mnp-link" onclick="closeMobileNav()">About</a>
        <a href="products.html"   class="mnp-link" onclick="closeMobileNav()">Products</a>
        <a href="portfolio.html"  class="mnp-link" onclick="closeMobileNav()">Portfolio</a>
        <a href="trade.html"      class="mnp-link" onclick="closeMobileNav()">Trade Accounts</a>
        <a href="contact.html"    class="mnp-link" onclick="closeMobileNav()">Contact</a>
      </nav>
      <div class="mnp-actions">
        <a href="https://wa.me/${WA_NUMBER}" class="mnp-wa" target="_blank" rel="noopener">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
          </svg>
          WhatsApp Us
        </a>
        <a href="contact.html" class="mnp-contact" onclick="closeMobileNav()">Get a Quote</a>
      </div>`;
    document.body.appendChild(panel);
  }
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.contains('open');
    hamburger.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(!open));
    panel.classList.toggle('open');
    document.body.style.overflow = open ? '' : 'hidden';
  });
}
window.closeMobileNav = function() {
  const h = document.getElementById('navHamburger');
  const p = document.querySelector('.mobile-nav-panel');
  if (h) { h.classList.remove('open'); h.setAttribute('aria-expanded','false'); }
  if (p) p.classList.remove('open');
  document.body.style.overflow = '';
};

/* ═══════════════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════════════ */
function showToast(msg, duration = 2800) {
  document.querySelectorAll('.broc-toast').forEach(t => t.remove());
  const t = document.createElement('div');
  t.className = 'broc-toast';
  t.textContent = msg;
  t.style.cssText = [
    'position:fixed',
    'bottom:88px',
    'left:50%',
    'transform:translateX(-50%) translateY(20px)',
    'background:#0d0d0d',
    'color:#e2e2e2',
    'padding:11px 22px',
    "font-family:'DM Mono',monospace",
    'font-size:11px',
    'letter-spacing:1px',
    'border:1px solid rgba(90,90,90,.3)',
    'box-shadow:0 8px 24px rgba(0,0,0,.28)',
    'z-index:9999',
    'opacity:0',
    'transition:all .3s ease',
    'white-space:nowrap',
    'pointer-events:none',
    'max-width:calc(100vw - 40px)',
    'overflow:hidden',
    'text-overflow:ellipsis',
  ].join(';');
  document.body.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity='1'; t.style.transform='translateX(-50%) translateY(0)'; });
  setTimeout(() => {
    t.style.opacity='0'; t.style.transform='translateX(-50%) translateY(10px)';
    setTimeout(() => t.remove(), 360);
  }, duration);
}

/* ═══════════════════════════════════════════════════════════════
   SEARCH
═══════════════════════════════════════════════════════════════ */
function initSearch() {
  const btn     = document.getElementById('searchToggle');
  const overlay = document.getElementById('searchOverlay');
  const input   = document.getElementById('searchInput');
  if (!btn || !overlay) return;
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const open = overlay.classList.toggle('open');
    if (open && input) setTimeout(() => input.focus(), 100);
  });
  document.addEventListener('click', e => {
    if (!overlay.contains(e.target) && e.target !== btn) overlay.classList.remove('open');
  });
  if (input) {
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase().trim();
      document.querySelectorAll('.product-card').forEach(card => {
        if (!q) { card.classList.remove('hidden'); return; }
        const text = ((card.querySelector('.pc-name')?.textContent||'') + ' ' + (card.querySelector('.pc-sku')?.textContent||'')).toLowerCase();
        card.classList.toggle('hidden', !text.includes(q));
      });
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') overlay.classList.remove('open');
    });
  }
}
window.closeSearch = () => document.getElementById('searchOverlay')?.classList.remove('open');

/* ═══════════════════════════════════════════════════════════════
   CART BUTTON
═══════════════════════════════════════════════════════════════ */
function initCartButton() {
  document.getElementById('cartBtn')?.addEventListener('click', () => CartUI.toggle());
}

/* ═══════════════════════════════════════════════════════════════
   ACTIVE NAV
═══════════════════════════════════════════════════════════════ */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');
  if (!sections.length || !links.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
      }
    });
  }, { threshold: 0.3 });
  sections.forEach(s => io.observe(s));
}

/* ═══════════════════════════════════════════════════════════════
   COOKIE NOTICE
═══════════════════════════════════════════════════════════════ */
function initCookieNotice() {
  if (localStorage.getItem('broc_cookies_accepted')) return;
  const el = document.getElementById('cookieNotice');
  if (el) setTimeout(() => el.classList.add('show'), 1500);
}
window.acceptCookies = function() {
  localStorage.setItem('broc_cookies_accepted','1');
  const el = document.getElementById('cookieNotice');
  if (el) { el.style.transform='translateY(100%)'; setTimeout(() => el.remove(), 400); }
};

/* ═══════════════════════════════════════════════════════════════
   PRODUCT INDEX (for sort reset)
═══════════════════════════════════════════════════════════════ */
function initProductIndex() {
  document.querySelectorAll('.product-card').forEach((c,i) => { c.dataset.originalIndex = i; });
}

/* ═══════════════════════════════════════════════════════════════
   UTILITY
═══════════════════════════════════════════════════════════════ */
function _e(s) {
  if (s == null) return '';
  const d = document.createElement('div');
  d.textContent = String(s);
  return d.innerHTML;
}
function escapeHtml(s) { return _e(s); }

/* ═══════════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initRevealObserver();
  initCounters();
  initNavScroll();
  initMobileNav();
  initSearch();
  initCartButton();
  initActiveNav();
  initWishlists();
  initProductIndex();
  initCookieNotice();

  /* Pre-build the cart drawer so first open is instant */
  CartUI._build();

  /* Expose globals */
  window.CartUI          = CartUI;
  window.toggleSidebar   = toggleSidebar;
  window.clearEnquiry    = clearEnquiry;
  window.sendEnquiryViaWA= sendEnquiryViaWA;
  window.filterCat       = filterCat;
  window.showAllProducts = showAllProducts;
  window.sortProducts    = sortProducts;
  window.submitEnquiry   = submitEnquiry;
  window.closeSearch     = closeSearch;
  window.showToast       = showToast;
  window.escapeHtml      = escapeHtml;

  console.log('%cBROC Fittings & Hardware', 'font-size:18px;font-weight:bold;color:#5a5a5a;');
  console.log('%cZimbabwe\'s Premier Hardware Supplier', 'color:#6a6a6a;');
});
