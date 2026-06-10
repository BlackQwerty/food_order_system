// Hamburger menu toggle
document.getElementById('hamburgerBtn').addEventListener('click', function() {
  document.getElementById('navLinks').classList.toggle('open');
});

/* -------------------------------------------------------
 * LOAD CART DATA & RENDER ORDER SUMMARY
 * ------------------------------------------------------- */
const DELIVERY_FEE = 3.00;
const TAX_RATE = 0.06;

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
  cart.forEach(function(item) {
    const lineTotal = item.price * item.quantity;
    subtotal += lineTotal;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>RM ${item.price.toFixed(2)}</td>
      <td>${item.quantity}</td>
      <td>RM ${lineTotal.toFixed(2)}</td>
    `;
    tbody.appendChild(row);
  });

  const tax = subtotal * TAX_RATE;
  const total = subtotal + DELIVERY_FEE + tax;

  document.getElementById('coSubtotal').textContent = 'RM ' + subtotal.toFixed(2);
  document.getElementById('coDelivery').textContent = 'RM ' + DELIVERY_FEE.toFixed(2);
  document.getElementById('coTax').textContent = 'RM ' + tax.toFixed(2);
  document.getElementById('coTotal').textContent = 'RM ' + Math.max(total, 0).toFixed(2);
}

renderCheckout();

/* -------------------------------------------------------
 * TOGGLE: Table Number vs Delivery Details
 * ------------------------------------------------------- */
const walkinRadio = document.getElementById('typeWalkin');
const onlineRadio = document.getElementById('typeOnline');
const tableNumberGroup = document.getElementById('tableNumberGroup');
const deliverySection = document.getElementById('deliverySection');

if (walkinRadio && onlineRadio) {
  walkinRadio.addEventListener('change', function() {
    if (this.checked) {
      if (tableNumberGroup) tableNumberGroup.style.display = '';
      if (deliverySection) deliverySection.classList.remove('visible');
    }
  });

  onlineRadio.addEventListener('change', function() {
    if (this.checked) {
      if (tableNumberGroup) tableNumberGroup.style.display = 'none';
      if (deliverySection) deliverySection.classList.add('visible');
    }
  });
}

/* -------------------------------------------------------
 * TOGGLE: Receipt Upload
 * ------------------------------------------------------- */
document.querySelectorAll('input[name="paymentMethod"]').forEach(function(radio) {
  radio.addEventListener('change', function() {
    const upload = document.getElementById('receiptUpload');
    if (this.value === 'receipt') {
      upload.classList.add('visible');
    } else {
      upload.classList.remove('visible');
    }
  });
});

/* -------------------------------------------------------
 * FORM VALIDATION & SUBMIT
 * ------------------------------------------------------- */
document.getElementById('checkoutForm').addEventListener('submit', function(e) {
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
    const orderNumber = 'FH-' + Date.now().toString().slice(-8);
    localStorage.setItem('lastOrderNumber', orderNumber);
    localStorage.setItem('lastOrderTotal', document.getElementById('coTotal').textContent);
    localStorage.removeItem('flavoursCart');
    window.location.href = 'order-confirmation.html';
  }
});
