/* -------------------------------------------------------
 * MENU PAGE — dynamic data + cart + QR walk-in flow
 * ------------------------------------------------------- */

(function () {
  const CART_KEY = 'flavoursCart';
  const TABLE_KEY = 'tableNumber';

  /* ---------- URL params: QR walk-in support (?table=5) ---------- */
  const urlParams = new URLSearchParams(window.location.search);
  const tableFromUrl = urlParams.get('table');
  if (tableFromUrl && parseInt(tableFromUrl) > 0) {
    localStorage.setItem(TABLE_KEY, tableFromUrl);
    localStorage.setItem('orderTypeHint', 'walkin');
  }

  /* ---------- Cart helpers ---------- */
  function getCart() {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
  function updateCartCount() {
    const cart = getCart();
    const total = cart.reduce(function (s, i) { return s + i.quantity; }, 0);
    document.querySelectorAll('.cart-count').forEach(function (c) {
      c.textContent = total;
    });
  }
  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    if (message) toast.textContent = message;
    toast.classList.add('show');
    setTimeout(function () { toast.classList.remove('show'); }, 1800);
  }

  /* ---------- Fetch menu from backend ---------- */
  function loadMenu() {
    fetch('/php_backend/api/get-menu.php', { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.success) {
          showEmptyMessage('Could not load menu. Please try again.');
          return;
        }
        renderCategories(data.categories || []);
        renderItems(data.items || []);
        bindAddToCart();
        bindCategoryTabs();
      })
      .catch(function () {
        showEmptyMessage('Network error. Please check your connection.');
      });
  }

  function showEmptyMessage(msg) {
    const el = document.getElementById('menuEmptyMsg');
    if (el) {
      el.textContent = msg;
      el.style.display = '';
    }
  }

  function categorySlug(cat) {
    return cat.toLowerCase().replace(/\s+/g, '-');
  }

  function renderCategories(categories) {
    const tabsWrap = document.getElementById('categoryTabs');
    if (!tabsWrap) return;
    categories.forEach(function (cat) {
      const btn = document.createElement('button');
      btn.className = 'category-tab';
      btn.setAttribute('data-category', categorySlug(cat));
      btn.textContent = cat;
      tabsWrap.appendChild(btn);
    });
  }

  function renderItems(items) {
    const grid = document.getElementById('menuGrid');
    if (!grid) return;
    grid.innerHTML = '';
    if (items.length === 0) {
      showEmptyMessage('No menu items available right now.');
      return;
    }
    items.forEach(function (item) {
      const card = document.createElement('div');
      card.className = 'card menu-item';
      card.setAttribute('data-category', categorySlug(item.category));

      const img = document.createElement('img');
      img.src = item.image_url || 'images/.gitkeep';
      img.alt = item.item_name;
      img.loading = 'lazy';
      img.onerror = function () { this.style.display = 'none'; };

      const name = document.createElement('h4');
      name.textContent = item.item_name;

      const desc = document.createElement('p');
      desc.className = 'desc';
      desc.textContent = item.description || '';

      const price = document.createElement('p');
      price.className = 'price';
      price.textContent = 'RM ' + item.price;

      const btn = document.createElement('button');
      btn.className = 'btn-primary add-to-cart';
      btn.setAttribute('data-id', item.item_id);
      btn.setAttribute('data-name', item.item_name);
      btn.setAttribute('data-price', item.price);
      btn.textContent = '+ Add to Cart';

      card.appendChild(img);
      card.appendChild(name);
      card.appendChild(desc);
      card.appendChild(price);
      card.appendChild(btn);
      grid.appendChild(card);
    });
  }

  function bindAddToCart() {
    document.querySelectorAll('.add-to-cart').forEach(function (button) {
      button.addEventListener('click', function () {
        const id    = parseInt(this.getAttribute('data-id'), 10);
        const name  = this.getAttribute('data-name');
        const price = parseFloat(this.getAttribute('data-price'));
        const cart  = getCart();

        const existing = cart.find(function (i) { return i.item_id === id; });
        if (existing) {
          existing.quantity += 1;
        } else {
          cart.push({ item_id: id, name: name, price: price, quantity: 1 });
        }
        saveCart(cart);
        updateCartCount();
        showToast('Added ' + name + '!');
      });
    });
  }

  function bindCategoryTabs() {
    const tabs = document.querySelectorAll('.category-tab');
    const items = document.querySelectorAll('.menu-item');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active-tab'); });
        this.classList.add('active-tab');
        const cat = this.getAttribute('data-category');
        items.forEach(function (item) {
          if (cat === 'all' || item.getAttribute('data-category') === cat) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  /* ---------- QR Modal (walk-in) ---------- */
  function setupQrModal() {
    const modal      = document.getElementById('qrModal');
    const closeBtn   = document.getElementById('closeQrModal');
    const submitBtn  = document.getElementById('submitTableBtn');
    const tableInput = document.getElementById('tableNumber');
    if (!modal) return;

    // If URL had ?table=N, show a friendly confirmation banner
    if (tableFromUrl) {
      showToast('Walk-in mode: Table ' + tableFromUrl);
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        modal.classList.remove('open');
      });
    }
    if (submitBtn && tableInput) {
      submitBtn.addEventListener('click', function () {
        const t = tableInput.value;
        if (t && parseInt(t) > 0) {
          localStorage.setItem(TABLE_KEY, t);
          localStorage.setItem('orderTypeHint', 'walkin');
          alert('Table ' + t + ' selected! Continue ordering from the menu.');
          modal.classList.remove('open');
        } else {
          alert('Please enter a valid table number.');
        }
      });
    }
    modal.addEventListener('click', function (e) {
      if (e.target === this) this.classList.remove('open');
    });
  }

  /* ---------- Hamburger ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    const burger = document.getElementById('hamburgerBtn');
    if (burger) {
      burger.addEventListener('click', function () {
        const links = document.getElementById('navLinks');
        if (links) links.classList.toggle('open');
      });
    }
    setupQrModal();
    loadMenu();
    updateCartCount();

    // Show admin banner if logged in as admin
    fetch('/php_backend/api/get-session-user.php', { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.logged_in && data.user && data.user.role === 'admin') {
          var banner = document.getElementById('adminMenuBanner');
          if (banner) banner.style.display = '';
        }
      })
      .catch(function () {});
  });
})();
