/* =============================================================
 * validation.js  —  ClickEat Form Validation (Assignment 2)
 * Handles: Register · Login · Checkout (order.html)
 * Author : Makdi
 * ============================================================= */

'use strict';

/* -------------------------------------------------------------
 * SHARED UTILITIES
 * ------------------------------------------------------------ */

/**
 * Show or clear an inline error beneath a field.
 * @param {string} fieldId   - id of the <input> / <textarea>
 * @param {string} errorId   - id of the <span class="error-msg">
 * @param {string} message   - error text; empty string = no error
 * @param {object} stateRef  - { isValid } object; set false on error
 */
function setError(fieldId, errorId, message, stateRef) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(errorId);
  if (!field || !error) return;

  if (message) {
    error.textContent = message;
    field.classList.add('input-error');
    field.setAttribute('aria-invalid', 'true');
    stateRef.isValid = false;
  } else {
    error.textContent = '';
    field.classList.remove('input-error');
    field.setAttribute('aria-invalid', 'false');
  }
}

/**
 * Show or clear an error that has no associated input field
 * (e.g. radio groups, checkboxes).
 * @param {string} errorId
 * @param {string} message
 * @param {object} stateRef
 */
function setGroupError(errorId, message, stateRef) {
  const error = document.getElementById(errorId);
  if (!error) return;
  error.textContent = message || '';
  if (message) stateRef.isValid = false;
}

/** Shared email regex — valid for all forms */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Strip non-digit characters and check minimum length */
function validatePhone(raw) {
  return raw.replace(/\D/g, '').length >= 10;
}

/* -------------------------------------------------------------
 * HAMBURGER MENU (used by all pages)
 * ------------------------------------------------------------ */
function initHamburger() {
  const btn = document.getElementById('hamburgerBtn');
  const nav = document.getElementById('navLinks');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }
}

/* =============================================================
 * 1.  REGISTER FORM  (register.html)
 * ============================================================= */
function initRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;   // Not on this page — skip

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const state = { isValid: true };

    /* ---- Full Name ---- */
    const fullName = document.getElementById('fullName').value.trim();
    setError('fullName', 'fullNameError',
      fullName === '' ? 'Please enter your full name.' : '',
      state);

    /* ---- Email ---- */
    const email = document.getElementById('email').value.trim();
    if (email === '') {
      setError('email', 'emailError', 'Please enter your email address.', state);
    } else if (!EMAIL_REGEX.test(email)) {
      setError('email', 'emailError', 'Enter a valid email (e.g. ahmad@example.com).', state);
    } else {
      setError('email', 'emailError', '', state);
    }

    /* ---- Phone ---- */
    const phone = document.getElementById('phone').value.trim();
    if (phone === '') {
      setError('phone', 'phoneError', 'Please enter your phone number.', state);
    } else if (!validatePhone(phone)) {
      setError('phone', 'phoneError', 'Phone must have at least 10 digits (e.g. 0123456789).', state);
    } else {
      setError('phone', 'phoneError', '', state);
    }

    /* ---- Password ---- */
    const password = document.getElementById('password').value;
    if (password === '') {
      setError('password', 'passwordError', 'Please enter a password.', state);
    } else if (password.length < 6) {
      setError('password', 'passwordError', 'Password must be at least 6 characters.', state);
    } else {
      setError('password', 'passwordError', '', state);
    }

    /* ---- Confirm Password ---- */
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (confirmPassword === '') {
      setError('confirmPassword', 'confirmPasswordError', 'Please confirm your password.', state);
    } else if (confirmPassword !== password) {
      setError('confirmPassword', 'confirmPasswordError', 'Passwords do not match.', state);
    } else {
      setError('confirmPassword', 'confirmPasswordError', '', state);
    }

    /* ---- Customer Type (radio group) ---- */
    const customerType = document.querySelector('input[name="customerType"]:checked');
    setGroupError('customerTypeError',
      customerType ? '' : 'Please select a customer type.',
      state);

    /* ---- Terms & Conditions ---- */
    const agreeTerms = document.getElementById('agreeTerms');
    setGroupError('termsError',
      agreeTerms && agreeTerms.checked ? '' : 'You must agree to the Terms & Conditions.',
      state);

    /* ---- Submit ---- */
    if (state.isValid) {
      // Save minimal user data for demo purposes (no real server in Assignment 2)
      localStorage.setItem('clickeatUser', JSON.stringify({
        name: fullName,
        email: email,
        phone: phone,
        type: customerType.value
      }));
      alert('✅ Registration successful! Redirecting to login...');
      window.location.href = 'login.html';
    }
  });
}

/* =============================================================
 * 2.  LOGIN FORM  (login.html)
 * ============================================================= */
function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const state = { isValid: true };

    /* ---- Email ---- */
    const email = document.getElementById('email').value.trim();
    if (email === '') {
      setError('email', 'emailError', 'Please enter your email address.', state);
    } else if (!EMAIL_REGEX.test(email)) {
      setError('email', 'emailError', 'Enter a valid email address.', state);
    } else {
      setError('email', 'emailError', '', state);
    }

    /* ---- Password ---- */
    const password = document.getElementById('password').value;
    setError('password', 'passwordError',
      password === '' ? 'Please enter your password.' : '',
      state);

    /* ---- Submit ---- */
    if (state.isValid) {
      localStorage.setItem('clickeatLoggedIn', 'true');
      alert('✅ Login successful! Welcome back!');
      window.location.href = 'dashboard.html';
    }
  });
}

/* =============================================================
 * 3.  CHECKOUT / ORDER FORM  (order.html)
 * ============================================================= */

/* --- Cart helpers --- */
const DELIVERY_FEE = 3.00;
const TAX_RATE     = 0.06;

function getCart() {
  try {
    return JSON.parse(localStorage.getItem('clickeatCart')) || [];
  } catch (_) {
    return [];
  }
}

/** Render cart items and price breakdown into the checkout table */
function renderCheckoutSummary() {
  const cart    = getCart();
  const tbody   = document.getElementById('checkoutTableBody');
  const emptyEl = document.getElementById('emptyCheckoutCart');
  const summaryEl = document.getElementById('checkoutSummary');

  if (!tbody) return;   // Not on checkout page

  if (cart.length === 0) {
    if (emptyEl)   emptyEl.style.display   = '';
    if (summaryEl) summaryEl.style.display = 'none';
    tbody.innerHTML = '';
    return;
  }

  if (emptyEl)   emptyEl.style.display   = 'none';
  if (summaryEl) summaryEl.style.display = '';

  let subtotal = 0;
  tbody.innerHTML = '';
  cart.forEach(function (item) {
    const line = item.price * item.quantity;
    subtotal += line;
    const row = document.createElement('tr');
    row.innerHTML =
      '<td>' + item.name + '</td>' +
      '<td>RM ' + item.price.toFixed(2) + '</td>' +
      '<td>' + item.quantity + '</td>' +
      '<td>RM ' + line.toFixed(2) + '</td>';
    tbody.appendChild(row);
  });

  const tax   = subtotal * TAX_RATE;
  const total = subtotal + DELIVERY_FEE + tax;

  setText('coSubtotal', 'RM ' + subtotal.toFixed(2));
  setText('coDelivery', 'RM ' + DELIVERY_FEE.toFixed(2));
  setText('coTax',      'RM ' + tax.toFixed(2));
  setText('coTotal',    'RM ' + total.toFixed(2));
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/** Toggle table-number field vs delivery section based on order type */
function initOrderTypeToggle() {
  const walkin   = document.getElementById('typeWalkin');
  const online   = document.getElementById('typeOnline');
  const tableGrp = document.getElementById('tableNumberGroup');
  const delivery = document.getElementById('deliverySection');
  if (!walkin || !online) return;

  function update() {
    const isWalkin = walkin.checked;
    if (tableGrp) tableGrp.style.display = isWalkin ? '' : 'none';
    if (delivery) {
      if (isWalkin) delivery.classList.remove('visible');
      else          delivery.classList.add('visible');
    }
  }

  walkin.addEventListener('change', update);
  online.addEventListener('change', update);
  update();   // run on page load to match default checked state
}

/** Toggle receipt upload section */
function initPaymentToggle() {
  document.querySelectorAll('input[name="paymentMethod"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      const upload = document.getElementById('receiptUpload');
      if (!upload) return;
      if (this.value === 'receipt') upload.classList.add('visible');
      else                          upload.classList.remove('visible');
    });
  });
}

/** Main checkout form validation */
function initCheckoutForm() {
  const form = document.getElementById('checkoutForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const state = { isValid: true };

    /* ---- Cart must not be empty ---- */
    if (getCart().length === 0) {
      alert('Your cart is empty. Please add items before checking out.');
      return;
    }

    /* ---- Order Type ---- */
    const orderType = document.querySelector('input[name="orderType"]:checked');
    setGroupError('orderTypeError',
      orderType ? '' : 'Please select an order type.',
      state);

    /* ---- Walk-in: table number ---- */
    if (orderType && orderType.value === 'walkin') {
      const tableNum = document.getElementById('tableNum').value.trim();
      setError('tableNum', 'tableNumError',
        (tableNum === '' || parseInt(tableNum, 10) <= 0)
          ? 'Please enter a valid table number.'
          : '',
        state);
    }

    /* ---- Online delivery: name, address, phone ---- */
    if (orderType && orderType.value === 'online') {
      const dName = document.getElementById('deliveryName').value.trim();
      setError('deliveryName', 'deliveryNameError',
        dName === '' ? 'Please enter your full name.' : '',
        state);

      const dAddr = document.getElementById('deliveryAddress').value.trim();
      setError('deliveryAddress', 'deliveryAddressError',
        dAddr === '' ? 'Please enter your delivery address.' : '',
        state);

      const dPhone = document.getElementById('deliveryPhone').value.trim();
      if (dPhone === '') {
        setError('deliveryPhone', 'deliveryPhoneError', 'Please enter your phone number.', state);
      } else if (!validatePhone(dPhone)) {
        setError('deliveryPhone', 'deliveryPhoneError', 'Phone must have at least 10 digits.', state);
      } else {
        setError('deliveryPhone', 'deliveryPhoneError', '', state);
      }
    }

    /* ---- Payment: receipt file required if receipt chosen ---- */
    const payMethod = document.querySelector('input[name="paymentMethod"]:checked');
    if (payMethod && payMethod.value === 'receipt') {
      const file = document.getElementById('receiptFile');
      setError('receiptFile', 'receiptError',
        (!file || !file.files || file.files.length === 0)
          ? 'Please upload your payment receipt.'
          : '',
        state);
    }

    /* ---- Submit ---- */
    if (state.isValid) {
      const orderNumber = 'CE-' + Date.now().toString().slice(-8);
      localStorage.setItem('lastOrderNumber', orderNumber);
      localStorage.setItem('lastOrderTotal',
        document.getElementById('coTotal')
          ? document.getElementById('coTotal').textContent
          : 'RM 0.00');
      localStorage.removeItem('clickeatCart');
      window.location.href = 'order-confirmation.html';
    }
  });
}

/* =============================================================
 * INIT — runs when DOM is ready
 * ============================================================= */
document.addEventListener('DOMContentLoaded', function () {
  initHamburger();
  initRegisterForm();
  initLoginForm();
  renderCheckoutSummary();
  initOrderTypeToggle();
  initPaymentToggle();
  initCheckoutForm();
});