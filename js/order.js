/* -------------------------------------------------------
 * CHECKOUT PAGE — order.js
 * Renders cart summary, handles order-type toggling,
 * validates the form, and posts to order-process.php.
 * ------------------------------------------------------- */

const DELIVERY_FEE = 3.00;
const TAX_RATE = 0.06;

/* Hamburger menu */
document.addEventListener('DOMContentLoaded', function () {
  const burger = document.getElementById('hamburgerBtn');
  if (burger) {
    burger.addEventListener('click', function () {
      const links = document.getElementById('navLinks');
      if (links) links.classList.toggle('open');
    });
  }
  init();
});

/* ---------- Cart ---------- */
function getCart() {
  const data = localStorage.getItem('flavoursCart');
  return data ? JSON.parse(data) : [];
}

function renderCheckout() {
  const cart = getCart();
  const tbody = document.getElementById('checkoutTableBody');
  const emptyMsg = document.getElementById('emptyCheckoutCart');
  const summary = document.getElementById('checkoutSummary');
  if (!tbody) return;

  if (cart.length === 0) {
    if (emptyMsg) emptyMsg.style.display = '';
    if (summary) summary.style.display = 'none';
    return;
  }

  if (emptyMsg) emptyMsg.style.display = 'none';
  if (summary) summary.style.display = '';
  tbody.innerHTML = '';

  let subtotal = 0;
  cart.forEach(function (item) {
    const lineTotal = item.price * item.quantity;
    subtotal += lineTotal;

    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    nameCell.textContent = item.name;
    row.appendChild(nameCell);
    row.insertAdjacentHTML('beforeend', `
      <td>RM ${item.price.toFixed(2)}</td>
      <td>${item.quantity}</td>
      <td>RM ${lineTotal.toFixed(2)}</td>
    `);
    tbody.appendChild(row);
  });

  // Delivery fee only applies when order type is 'online'
  const orderType = document.querySelector('input[name="orderType"]:checked');
  const isOnline = orderType && orderType.value === 'online';
  const deliveryFee = isOnline ? DELIVERY_FEE : 0;

  const tax = subtotal * TAX_RATE;
  const total = subtotal + deliveryFee + tax;

  document.getElementById('coSubtotal').textContent = 'RM ' + subtotal.toFixed(2);
  document.getElementById('coDelivery').textContent = 'RM ' + deliveryFee.toFixed(2);
  document.getElementById('coTax').textContent = 'RM ' + tax.toFixed(2);
  document.getElementById('coTotal').textContent = 'RM ' + Math.max(total, 0).toFixed(2);
}

/* ---------- Order-type / delivery / payment toggling ---------- */
function bindToggles() {
  const walkinRadio = document.getElementById('typeWalkin');
  const onlineRadio = document.getElementById('typeOnline');
  const tableNumberGroup = document.getElementById('tableNumberGroup');
  const deliverySection = document.getElementById('deliverySection');

  function applyOrderType(value) {
    var codOption = document.getElementById('payCod');
    var codWrap = codOption ? codOption.closest('.form-check') : null;

    if (value === 'walkin') {
      if (tableNumberGroup) tableNumberGroup.style.display = '';
      if (deliverySection) deliverySection.classList.remove('visible');
      // Hide COD for dine-in
      if (codWrap) codWrap.style.display = 'none';
      if (codOption && codOption.checked) {
        var cardRadio = document.getElementById('payCard');
        if (cardRadio) { cardRadio.checked = true; cardRadio.dispatchEvent(new Event('change')); }
      }
    } else {
      if (tableNumberGroup) tableNumberGroup.style.display = 'none';
      if (deliverySection) deliverySection.classList.add('visible');
      if (codWrap) codWrap.style.display = '';
    }
    renderCheckout();
  }

  if (walkinRadio) walkinRadio.addEventListener('change', function () { if (this.checked) applyOrderType('walkin'); });
  if (onlineRadio) onlineRadio.addEventListener('change', function () { if (this.checked) applyOrderType('online'); });

  // Apply initial state
  const initial = document.querySelector('input[name="orderType"]:checked');
  if (initial) applyOrderType(initial.value);

  // Payment method toggle
  document.querySelectorAll('input[name="paymentMethod"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      const upload = document.getElementById('receiptUpload');
      if (!upload) return;
      if (this.value === 'receipt') upload.classList.add('visible');
      else upload.classList.remove('visible');
    });
  });
}

/* ---------- Session + flash (errors, prefill) ---------- */
function loadSessionAndFlash() {
  return fetch('/php_backend/api/get-session-user.php', { credentials: 'same-origin' })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      // Prefill delivery details from logged-in user
      if (data.logged_in && data.user) {
        const nameEl = document.getElementById('deliveryName');
        const phoneEl = document.getElementById('deliveryPhone');
        var addressEl = document.getElementById('deliveryAddress');
        if (nameEl && !nameEl.value) nameEl.value = data.user.name || '';
        if (phoneEl && !phoneEl.value) phoneEl.value = data.user.phone || '';
        if (addressEl && !addressEl.value && data.user.address) addressEl.value = data.user.address;
      }

      // Show server-side errors from a previous submission
      if (data.flash && data.flash.type === 'checkout' && data.flash.errors) {
        const banner = document.getElementById('checkoutFlash');
        if (banner) {
          const errs = data.flash.errors;
          const list = Object.keys(errs).map(function (k) { return '• ' + errs[k]; }).join('<br>');
          banner.innerHTML = '<strong>Please fix the following:</strong><br>' + list;
          banner.style.display = '';
          banner.style.background = '#fef2f2';
          banner.style.color = '#991b1b';
          banner.style.border = '1px solid #fecaca';
          banner.style.padding = '12px 16px';
          banner.style.borderRadius = '8px';
          banner.style.marginBottom = '16px';
        }
        // Restore old input values
        const old = data.flash.old || {};
        ['deliveryName', 'deliveryAddress', 'deliveryPhone', 'specialInstructions', 'tableNum']
          .forEach(function (fieldName) {
            const el = document.getElementById(fieldName);
            if (el && old[fieldName]) el.value = old[fieldName];
          });
        if (old.orderType === 'walkin') {
          const w = document.getElementById('typeWalkin');
          if (w) { w.checked = true; w.dispatchEvent(new Event('change')); }
        }
      }
    })
    .catch(function () { /* silent */ });
}

/* ---------- Prefill from menu.js hints (QR walk-in flow) ---------- */
function applyHints() {
  const table = localStorage.getItem('tableNumber');
  const hint  = localStorage.getItem('orderTypeHint');
  if (hint === 'walkin') {
    const walkinRadio = document.getElementById('typeWalkin');
    if (walkinRadio) {
      walkinRadio.checked = true;
      walkinRadio.dispatchEvent(new Event('change'));
    }
    const tableInput = document.getElementById('tableNum');
    if (tableInput && table) tableInput.value = table;
  }
}

/* ---------- Submit validation ---------- */
function bindSubmit() {
  document.getElementById('checkoutForm').addEventListener('submit', function (e) {
    e.preventDefault();
    let isValid = true;

    function setError(fieldId, errorId, message) {
      const field = document.getElementById(fieldId);
      const error = document.getElementById(errorId);
      if (field && error) {
        error.textContent = message || '';
        if (message) { field.classList.add('error'); isValid = false; }
        else { field.classList.remove('error'); }
      }
    }

    const cart = getCart();
    if (cart.length === 0) {
      alert('Your cart is empty. Please add items first.');
      return;
    }

    const orderType = document.querySelector('input[name="orderType"]:checked');
    if (!orderType) {
      document.getElementById('orderTypeError').textContent = 'Please select an order type.';
      isValid = false;
    } else {
      document.getElementById('orderTypeError').textContent = '';
    }

    if (orderType && orderType.value === 'walkin') {
      const tableNum = document.getElementById('tableNum').value.trim();
      if (tableNum === '' || parseInt(tableNum) <= 0) {
        setError('tableNum', 'tableNumError', 'Please enter a valid table number.');
      } else {
        setError('tableNum', 'tableNumError', '');
      }
    }

    if (orderType && orderType.value === 'online') {
      const name = document.getElementById('deliveryName').value.trim();
      setError('deliveryName', 'deliveryNameError', name === '' ? 'Please enter your full name.' : '');

      const address = document.getElementById('deliveryAddress').value.trim();
      setError('deliveryAddress', 'deliveryAddressError', address === '' ? 'Please enter your delivery address.' : '');

      const phone = document.getElementById('deliveryPhone').value.trim();
      const phoneDigits = phone.replace(/\D/g, '');
      if (phone === '') {
        setError('deliveryPhone', 'deliveryPhoneError', 'Please enter your phone number.');
      } else if (phoneDigits.length < 10) {
        setError('deliveryPhone', 'deliveryPhoneError', 'Phone must have at least 10 digits.');
      } else {
        setError('deliveryPhone', 'deliveryPhoneError', '');
      }
    }

    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
    if (paymentMethod && paymentMethod.value === 'receipt') {
      const receiptFile = document.getElementById('receiptFile');
      if (!receiptFile.files || receiptFile.files.length === 0) {
        setError('receiptFile', 'receiptError', 'Please upload your payment receipt.');
      } else {
        setError('receiptFile', 'receiptError', '');
      }
    }

    if (isValid) {
      // Serialize cart (with item_id) to hidden field for PHP
      document.getElementById('cartData').value = JSON.stringify(cart);
      localStorage.removeItem('flavoursCart');
      localStorage.removeItem('orderTypeHint');
      this.submit();
    }
  });
}

/* ---------- Init ---------- */
function init() {
  renderCheckout();
  bindToggles();
  bindSubmit();
  loadSessionAndFlash().then(applyHints);
}
