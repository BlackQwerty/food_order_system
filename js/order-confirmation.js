// js/order-confirmation.js
// ============================================================
// ORDER CONFIRMATION — Loads order info from PHP session
// ============================================================

(function () {
  function loadOrderData() {
    const session = window.__clickeatSession;

    if (!session) {
      setTimeout(loadOrderData, 200);
      return;
    }

    const orderNumEl = document.getElementById('orderNumberDisplay');
    const totalEl    = document.getElementById('totalDisplay');

    if (session.last_order) {
      // Order data from PHP session (set by order-process.php)
      if (orderNumEl) orderNumEl.textContent = session.last_order.order_number;
      if (totalEl)    totalEl.textContent    = 'RM ' + parseFloat(session.last_order.total).toFixed(2);
    } else {
      // No order in session — user may have refreshed the page
      if (orderNumEl) orderNumEl.textContent = 'Order completed';
      if (totalEl)    totalEl.textContent    = 'RM 0.00';
    }
  }

  document.addEventListener('DOMContentLoaded', loadOrderData);
})();
