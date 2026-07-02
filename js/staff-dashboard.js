/* -------------------------------------------------------
 * STAFF DASHBOARD — staff-dashboard.js
 * Position-aware: Waiter vs Kitchen show different views.
 * Auto-refreshes every 30 seconds.
 * ------------------------------------------------------- */
(function () {

  var BADGE_MAP = {
    'Pending':    'badge-pending',
    'In Progress':'badge-inprogress',
    'Ready':      'badge-ready',
    'Completed':  'badge-completed',
    'Delivered':  'badge-delivered',
    'Cancelled':  'badge-cancelled'
  };

  var currentFilter = 'all';
  var refreshTimer  = null;
  var userPosition  = '';   // 'Kitchen', 'Waiter', 'Manager', etc.
  var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // ── Auth guard + position setup ───────────────────────────────
  fetch('/php_backend/api/get-session-user.php', { credentials: 'same-origin' })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (!data.logged_in || !data.user) { window.location.href = '/login.html'; return; }
      var role = data.user.role;
      if (role !== 'staff' && role !== 'admin') {
        window.location.href = '/login.html';
        return;
      }

      userPosition = data.user.position || '';

      var nameEl = document.getElementById('staffNameDisplay');
      if (nameEl) nameEl.textContent = data.user.name + ' (' + (userPosition || role) + ')';

      applyPositionUI();
      loadOrders();
      startAutoRefresh();
    })
    .catch(function () { window.location.href = '/login.html'; });

  // ── Customise UI based on position ────────────────────────────
  function applyPositionUI() {
    var isKitchen = (userPosition === 'Kitchen');

    // Hero cards
    var heroTake   = document.getElementById('heroTakeOrder');
    var heroLabel  = document.getElementById('heroManageLabel');
    var heroDesc   = document.getElementById('heroManageDesc');
    var heroIcon   = document.querySelector('#heroManageOrders .ac-icon');

    if (isKitchen) {
      // Hide "Take Order" — kitchen doesn't place orders
      if (heroTake) heroTake.style.display = 'none';
      if (heroLabel) heroLabel.textContent = 'Kitchen Queue';
      if (heroDesc)  heroDesc.textContent  = 'See incoming orders below — mark In Progress when cooking, Ready when done';
      if (heroIcon)  heroIcon.className    = 'fa-solid fa-fire ac-icon';

      // Default filter: Pending (new tickets)
      setActiveFilter('Pending');

      // Hide filter buttons irrelevant to kitchen (Delivered, Completed)
      hideFilterBtn('Delivered');
      hideFilterBtn('Completed');

    } else {
      // Waiter
      if (heroLabel) heroLabel.textContent = 'Manage Orders';
      if (heroDesc)  heroDesc.textContent  = 'See Ready orders below — deliver food, then mark Completed when customer pays';

      // Default filter: Ready (food to serve)
      setActiveFilter('Ready');

      // Hide filter buttons irrelevant to waiter (Pending, In Progress)
      hideFilterBtn('Pending');
      hideFilterBtn('In Progress');
    }
  }

  function setActiveFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(function (b) {
      b.classList.toggle('active-filter', b.getAttribute('data-filter') === filter);
    });
  }

  function hideFilterBtn(filter) {
    document.querySelectorAll('.filter-btn').forEach(function (b) {
      if (b.getAttribute('data-filter') === filter) b.style.display = 'none';
    });
  }

  // ── Filter buttons ─────────────────────────────────────────────
  document.querySelectorAll('.filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter-btn').forEach(function (b) {
        b.classList.remove('active-filter');
      });
      this.classList.add('active-filter');
      currentFilter = this.getAttribute('data-filter');
      loadOrders();
    });
  });

  // ── Refresh button ─────────────────────────────────────────────
  document.getElementById('refreshBtn').addEventListener('click', function () {
    loadOrders();
  });

  // ── Auto-refresh every 30 s ────────────────────────────────────
  function startAutoRefresh() {
    clearInterval(refreshTimer);
    refreshTimer = setInterval(function () { loadOrders(true); }, 30000);
  }

  // ── Load orders ────────────────────────────────────────────────
  function loadOrders(silent) {
    if (!silent) {
      document.getElementById('loadingMsg').style.display = '';
      document.getElementById('ordersTableWrap').style.display = 'none';
      document.getElementById('ordersEmptyMsg').style.display = 'none';
    }

    var url = '/php_backend/api/get-orders-list.php';
    if (currentFilter !== 'all') url += '?status=' + encodeURIComponent(currentFilter);

    fetch(url, { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        document.getElementById('loadingMsg').style.display = 'none';
        if (!data.success) { showError(data.message || 'Failed to load orders.'); return; }
        renderOrders(data.orders || []);
        updateStats(data.orders || []);
        setLastUpdated();
      })
      .catch(function () {
        document.getElementById('loadingMsg').style.display = 'none';
        showError('Network error. Check that the PHP server is running.');
      });
  }

  function setLastUpdated() {
    var el = document.getElementById('lastUpdated');
    if (!el) return;
    var now = new Date();
    el.textContent = 'Updated ' + String(now.getHours()).padStart(2,'0') + ':' +
      String(now.getMinutes()).padStart(2,'0') + ':' +
      String(now.getSeconds()).padStart(2,'0');
  }

  function showError(msg) {
    document.getElementById('ordersTableWrap').style.display = '';
    document.getElementById('staffOrderTable').innerHTML =
      '<tr><td colspan="8" style="text-align:center;color:#d32f2f;padding:24px;">' +
      '<i class="fa-solid fa-triangle-exclamation"></i> ' + escHtml(msg) + '</td></tr>';
  }

  // ── Render orders table ────────────────────────────────────────
  function renderOrders(orders) {
    var tbody   = document.getElementById('staffOrderTable');
    var wrap    = document.getElementById('ordersTableWrap');
    var emptyEl = document.getElementById('ordersEmptyMsg');
    tbody.innerHTML = '';

    if (orders.length === 0) {
      wrap.style.display    = 'none';
      emptyEl.style.display = '';

      // Helpful empty-state message per position
      if (userPosition === 'Kitchen') {
        emptyEl.textContent = 'No orders in this queue right now. New orders will appear here automatically.';
      } else {
        emptyEl.textContent = 'No orders ready to serve right now. Orders will appear here when kitchen marks them Ready.';
      }
      return;
    }
    wrap.style.display    = '';
    emptyEl.style.display = 'none';

    orders.forEach(function (o) {
      var tr = document.createElement('tr');
      tr.setAttribute('data-order-id', o.order_id);
      tr.setAttribute('data-status',   o.order_status);

      var typeText = o.order_type === 'walkin'
        ? '<i class="fa-solid fa-chair" style="color:#e65100;"></i> Walk-in' +
          (o.table_number ? ' <strong>T' + o.table_number + '</strong>' : '')
        : '<i class="fa-solid fa-globe" style="color:#1565c0;"></i> Online';

      // Action buttons — only what the backend says this role can do
      var actionHtml = '';
      if (o.next_statuses && o.next_statuses.length > 0) {
        actionHtml = '<div class="action-btns">';
        o.next_statuses.forEach(function (ns) {
          var icon = ns === 'In Progress' ? 'fa-fire'   :
                     ns === 'Ready'       ? 'fa-bell'   :
                     ns === 'Delivered'   ? 'fa-truck'  :
                     ns === 'Completed'   ? 'fa-check'  : 'fa-arrow-right';
          var colour = ns === 'Completed' ? 'style="color:#2e7d32;font-weight:600;"' :
                       ns === 'Delivered' ? 'style="color:#1565c0;"' : '';
          actionHtml +=
            '<button class="btn-link update-status-btn" ' + colour +
            ' data-order-id="' + o.order_id + '"' +
            ' data-new-status="' + escAttr(ns) + '">' +
            '<i class="fa-solid ' + icon + '"></i> &rarr; ' + escHtml(ns) +
            '</button>';
        });
        actionHtml += '</div>';
      } else {
        actionHtml = '<span style="font-size:12px;color:#999;">—</span>';
      }

      tr.innerHTML =
        '<td style="font-size:13px;font-weight:600;">' + escHtml(o.order_number) + '</td>' +
        '<td>' + escHtml(o.customer_name) + '</td>' +
        '<td>' + typeText + '</td>' +
        '<td style="font-size:12px;max-width:200px;">' + escHtml(o.items_summary || '—') +
          (o.special_instructions ? '<br><span class="order-note">' + escHtml(o.special_instructions) + '</span>' : '') +
        '</td>' +
        '<td style="font-weight:600;">RM ' + o.total_amount + '</td>' +
        '<td style="font-size:12px;color:#666;">' + formatTime(o.order_date) + '</td>' +
        '<td><span class="badge ' + (BADGE_MAP[o.order_status] || 'badge-pending') + '">' +
          escHtml(o.order_status) + '</span></td>' +
        '<td>' + actionHtml + '</td>';

      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.update-status-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        updateOrderStatus(
          this.getAttribute('data-order-id'),
          this.getAttribute('data-new-status'),
          this
        );
      });
    });
  }

  // ── Update order status ────────────────────────────────────────
  function updateOrderStatus(orderId, newStatus, btn) {
    btn.disabled    = true;
    btn.textContent = 'Updating...';

    var fd = new FormData();
    fd.append('order_id',   orderId);
    fd.append('new_status', newStatus);

    fetch('/php_backend/staff-update-order.php', {
      method: 'POST',
      credentials: 'same-origin',
      body: fd
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.success) {
        loadOrders(true);
        flashSuccess('Order moved to ' + newStatus);
      } else {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-arrow-right"></i> &rarr; ' + newStatus;
        alert('Error: ' + (data.message || 'Could not update status.'));
      }
    })
    .catch(function () {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-arrow-right"></i> &rarr; ' + newStatus;
      alert('Network error. Please try again.');
    });
  }

  // ── Stat counters ──────────────────────────────────────────────
  function updateStats(orders) {
    var counts = { Pending: 0, inProgress: 0, Ready: 0, done: 0 };
    orders.forEach(function (o) {
      if      (o.order_status === 'Pending')     counts.Pending++;
      else if (o.order_status === 'In Progress') counts.inProgress++;
      else if (o.order_status === 'Ready')       counts.Ready++;
      else if (o.order_status === 'Completed' || o.order_status === 'Delivered') counts.done++;
    });
    document.getElementById('cntPending').textContent  = counts.Pending;
    document.getElementById('cntProgress').textContent = counts.inProgress;
    document.getElementById('cntReady').textContent    = counts.Ready;
    document.getElementById('cntDone').textContent     = counts.done;
  }

  // ── Helpers ────────────────────────────────────────────────────
  function formatTime(iso) {
    if (!iso) return '—';
    var d = new Date(iso.replace(' ', 'T'));
    if (isNaN(d)) return iso;
    return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' +
      String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
  }

  function flashSuccess(msg) {
    var toast = document.createElement('div');
    toast.textContent = '✓ ' + msg;
    toast.style.cssText =
      'position:fixed;bottom:80px;right:20px;background:#2e7d32;color:#fff;' +
      'padding:10px 20px;border-radius:8px;font-size:14px;z-index:9999;box-shadow:0 2px 8px rgba(0,0,0,.2);';
    document.body.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 2500);
  }

  function escHtml(str) {
    var d = document.createElement('div');
    d.textContent = String(str || '');
    return d.innerHTML;
  }
  function escAttr(str) { return String(str || '').replace(/"/g, '&quot;'); }

})();
