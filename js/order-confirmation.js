// js/order-confirmation.js
// Loads order info from PHP session.

(function () {
  function load() {
    fetch('/php_backend/api/get-session-user.php', { credentials: 'same-origin' })
      .then(r => r.json())
      .then(session => {
        const orderNumEl = document.getElementById('orderNumberDisplay');
        const totalEl    = document.getElementById('totalDisplay');
        if (session.last_order) {
          if (orderNumEl) orderNumEl.textContent = session.last_order.order_number;
          if (totalEl)    totalEl.textContent    = 'RM ' + parseFloat(session.last_order.total).toFixed(2);
        } else {
          if (orderNumEl) orderNumEl.textContent = 'Order completed';
          if (totalEl)    totalEl.textContent    = 'RM 0.00';
        }
      });
  }

  document.addEventListener('DOMContentLoaded', load);
})();
