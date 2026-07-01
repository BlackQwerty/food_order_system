/* -------------------------------------------------------
 * ORDER TRACKING — tracking.js
 * Shows the user's order list and tracks individual orders.
 * ------------------------------------------------------- */

(function () {
  var BADGE_MAP = {
    'Pending':     'badge-pending',
    'In Progress': 'badge-inprogress',
    'Ready':       'badge-ready',
    'Completed':   'badge-completed',
    'Delivered':   'badge-delivered',
    'Cancelled':   'badge-cancelled'
  };

  var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function formatDate(iso) {
    if (!iso) return '-';
    var d = new Date(iso.replace(' ', 'T'));
    if (isNaN(d)) return iso;
    return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }

  function formatDateTime(iso) {
    if (!iso) return '-';
    var d = new Date(iso.replace(' ', 'T'));
    if (isNaN(d)) return iso;
    return d.toLocaleString('en-MY', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  function trackOrder(orderNumber) {
    var errorEl  = document.getElementById('trackError');
    var resultEl = document.getElementById('trackingResult');
    errorEl.textContent = '';

    if (!orderNumber) {
      errorEl.textContent = 'Please enter an order number.';
      resultEl.classList.remove('visible');
      return;
    }

    var url = '/php_backend/api/get-order-status.php?order_number=' + encodeURIComponent(orderNumber);
    fetch(url, { credentials: 'same-origin' })
      .then(function (r) { return r.json().then(function (body) { return { ok: r.ok, body: body }; }); })
      .then(function (res) {
        if (!res.body.success) {
          errorEl.textContent = res.body.message || 'Order not found.';
          resultEl.classList.remove('visible');
          return;
        }
        renderOrder(res.body.order);
      })
      .catch(function () {
        errorEl.textContent = 'Network error. Please try again.';
        resultEl.classList.remove('visible');
      });
  }

  function renderOrder(order) {
    var resultEl = document.getElementById('trackingResult');
    resultEl.classList.add('visible');

    document.getElementById('trackOrderNum').textContent = order.order_number;

    var badge = document.getElementById('trackStatusBadge');
    badge.textContent = order.order_status;
    badge.className = 'badge ' + (BADGE_MAP[order.order_status] || 'badge-pending');

    var currentStep = order.current_step || 1;
    for (var i = 1; i <= 5; i++) {
      var stepEl = document.getElementById('step' + i);
      if (!stepEl) continue;
      stepEl.classList.remove('completed', 'active');
      if (i < currentStep)       stepEl.classList.add('completed');
      else if (i === currentStep) stepEl.classList.add('active');
    }

    var details = document.getElementById('trackOrderDetails');
    if (details) details.style.display = '';
    document.getElementById('trackOrderType').textContent =
      order.order_type === 'walkin'
        ? 'Walk-In (Table ' + (order.table_number || '?') + ')'
        : 'Online Delivery';
    document.getElementById('trackOrderDate').textContent = formatDateTime(order.order_date);
    document.getElementById('trackTotal').textContent = order.total_amount;

    var list = document.getElementById('trackItemsList');
    list.innerHTML = '';
    (order.items || []).forEach(function (it) {
      var li = document.createElement('li');
      li.textContent = it.item_name + ' × ' + it.quantity + '  (RM ' + parseFloat(it.subtotal).toFixed(2) + ')';
      list.appendChild(li);
    });

    resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function loadMyOrders() {
    fetch('/php_backend/api/get-my-orders.php', { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var section = document.getElementById('myOrdersSection');
        var tbody   = document.getElementById('myOrdersBody');
        var empty   = document.getElementById('myOrdersEmpty');
        if (!section || !tbody) return;

        if (!data.success || !data.orders || data.orders.length === 0) {
          section.style.display = '';
          if (empty) empty.style.display = '';
          return;
        }

        section.style.display = '';
        if (empty) empty.style.display = 'none';
        tbody.innerHTML = '';

        data.orders.forEach(function (o) {
          var tr = document.createElement('tr');

          var orderCell = document.createElement('td');
          orderCell.textContent = o.order_number;

          var dateCell = document.createElement('td');
          dateCell.textContent = formatDate(o.order_date);

          var typeCell = document.createElement('td');
          typeCell.textContent = o.order_type === 'walkin'
            ? 'Walk-in (T' + (o.table_number || '?') + ')'
            : 'Online';

          var itemsCell = document.createElement('td');
          itemsCell.textContent = o.items_summary || ('(' + o.item_count + ' items)');
          itemsCell.style.maxWidth = '220px';
          itemsCell.style.fontSize = '13px';
          itemsCell.style.color = '#555';

          var totalCell = document.createElement('td');
          totalCell.textContent = 'RM ' + o.total_amount;

          var statusCell = document.createElement('td');
          var badgeEl = document.createElement('span');
          badgeEl.className = 'badge ' + (BADGE_MAP[o.order_status] || 'badge-pending');
          badgeEl.textContent = o.order_status;
          statusCell.appendChild(badgeEl);

          var actionCell = document.createElement('td');
          var btn = document.createElement('button');
          btn.className = 'btn-link';
          btn.innerHTML = '<i class="fa-solid fa-location-dot"></i> Track';
          btn.setAttribute('data-order', o.order_number);
          btn.addEventListener('click', function () {
            var input = document.getElementById('orderNumberInput');
            if (input) input.value = o.order_number;
            trackOrder(o.order_number);
          });
          actionCell.appendChild(btn);

          tr.appendChild(orderCell);
          tr.appendChild(dateCell);
          tr.appendChild(typeCell);
          tr.appendChild(itemsCell);
          tr.appendChild(totalCell);
          tr.appendChild(statusCell);
          tr.appendChild(actionCell);
          tbody.appendChild(tr);
        });
      })
      .catch(function () {
        var section = document.getElementById('myOrdersSection');
        if (section) section.style.display = '';
        var empty = document.getElementById('myOrdersEmpty');
        if (empty) {
          empty.textContent = 'Could not load orders. Please refresh.';
          empty.style.display = '';
        }
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var burger = document.getElementById('hamburgerBtn');
    if (burger) {
      burger.addEventListener('click', function () {
        var links = document.getElementById('navLinks');
        if (links) links.classList.toggle('open');
      });
    }

    var btn   = document.getElementById('trackBtn');
    var input = document.getElementById('orderNumberInput');
    if (btn && input) {
      btn.addEventListener('click', function () { trackOrder(input.value.trim()); });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') trackOrder(input.value.trim());
      });
    }

    // Auto-track if ?order=CE-... in URL
    var params = new URLSearchParams(window.location.search);
    var auto = params.get('order');
    if (auto && input) {
      input.value = auto;
      trackOrder(auto);
    }

    // Load the user's order list
    loadMyOrders();
  });
})();
