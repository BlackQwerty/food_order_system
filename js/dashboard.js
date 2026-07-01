/* -------------------------------------------------------
 * MEMBER DASHBOARD — dashboard.js
 * Loads profile, analytics stats, and recent orders.
 * Adapts to admin vs customer role.
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

  // ---- Stat card helper ----
  function makeStatCard(icon, iconClass, value, label) {
    var card = document.createElement('div');
    card.className = 'stat-card';
    card.innerHTML =
      '<div class="stat-icon ' + iconClass + '"><i class="fa-solid ' + icon + '"></i></div>' +
      '<div class="stat-value">' + value + '</div>' +
      '<div class="stat-label">' + label + '</div>';
    return card;
  }

  // ---- Load profile ----
  function loadProfile() {
    return fetch('/php_backend/api/get-session-user.php', { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (session) {
        if (!session.logged_in || !session.user) {
          window.location.href = '/login.html';
          return null;
        }
        var user = session.user;
        currentUser = user;

        document.getElementById('dashboardWelcomeName').textContent = user.name.split(' ')[0];

        // Show admin panel link
        if (user.role === 'admin') {
          var link = document.getElementById('adminPanelLink');
          if (link) link.style.display = '';
        }

        return user;
      });
  }

  // ---- Load dashboard stats ----
  function loadStats() {
    return fetch('/php_backend/api/get-dashboard-stats.php', { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.success || !data.stats) return;

        var grid = document.getElementById('statGrid');
        grid.innerHTML = '';

        if (data.role === 'admin') {
          renderAdminStats(data.stats, grid);
        } else {
          renderCustomerStats(data.stats, grid);
        }

        renderCharts(data.stats, data.role);
      })
      .catch(function () {});
  }

  function renderAdminStats(s, grid) {
    grid.appendChild(makeStatCard('fa-dollar-sign', 'icon-green', 'RM ' + s.total_revenue, 'Total Revenue'));
    grid.appendChild(makeStatCard('fa-receipt', 'icon-blue', s.total_orders, 'Total Orders'));
    grid.appendChild(makeStatCard('fa-users', 'icon-purple', s.total_customers, 'Customers'));
    grid.appendChild(makeStatCard('fa-bolt', 'icon-orange', 'RM ' + s.today_revenue, 'Today\'s Revenue'));
  }

  function renderCustomerStats(s, grid) {
    grid.appendChild(makeStatCard('fa-wallet', 'icon-green', 'RM ' + s.total_spent, 'Total Spent'));
    grid.appendChild(makeStatCard('fa-receipt', 'icon-blue', s.total_orders, 'Total Orders'));
    grid.appendChild(makeStatCard('fa-clock', 'icon-orange', s.active_orders, 'Active Orders'));
    grid.appendChild(makeStatCard('fa-chart-line', 'icon-purple', 'RM ' + s.avg_order_value, 'Avg. Order'));
  }

  function renderCharts(stats, role) {
    var section = document.getElementById('dashCharts');
    section.style.display = '';

    // Top items title
    var titleEl = document.getElementById('topItemsTitle');
    titleEl.textContent = role === 'admin' ? 'Popular Items' : 'Your Favourites';

    // Top items list
    var list = document.getElementById('topItemsList');
    var empty = document.getElementById('topItemsEmpty');
    list.innerHTML = '';

    var items = stats.top_items || [];
    if (items.length === 0) {
      if (empty) empty.style.display = '';
    } else {
      if (empty) empty.style.display = 'none';
      items.forEach(function (item, i) {
        var li = document.createElement('li');
        li.innerHTML =
          '<span class="rank">' + (i + 1) + '</span>' +
          '<span class="item-info">' + escapeHtml(item.item_name) + '</span>' +
          '<span class="item-qty">' + item.total_qty + ' ordered' +
          (item.total_sales ? ' &middot; RM ' + item.total_sales : '') + '</span>';
        list.appendChild(li);
      });
    }

    // Type bar
    var tc = stats.type_counts || {};
    var walkin = tc.walkin || 0;
    var online = tc.online || 0;
    var typeTotal = walkin + online;

    var bar = document.getElementById('typeBar');
    var legend = document.getElementById('typeLegend');
    bar.innerHTML = '';
    legend.innerHTML = '';

    if (typeTotal > 0) {
      var wp = Math.round((walkin / typeTotal) * 100);
      var op = 100 - wp;
      if (walkin > 0) bar.innerHTML += '<div class="bar-walkin" style="width:' + wp + '%">' + wp + '%</div>';
      if (online > 0) bar.innerHTML += '<div class="bar-online" style="width:' + op + '%">' + op + '%</div>';
      legend.innerHTML = '<span class="leg-walkin">Walk-in (' + walkin + ')</span><span class="leg-online">Online (' + online + ')</span>';
    } else {
      bar.innerHTML = '<div style="width:100%;background:#eee;border-radius:14px;text-align:center;font-size:12px;color:#999;line-height:28px;">No data</div>';
    }

    // Status pills
    var pills = document.getElementById('statusPills');
    pills.innerHTML = '';
    var sc = stats.status_counts || {};

    // For customer stats, build from order counts
    if (!sc || Object.keys(sc).length === 0) {
      if (stats.active_orders !== undefined) {
        sc = {};
        if (stats.active_orders > 0) sc['Active'] = stats.active_orders;
        if (stats.completed_orders > 0) sc['Completed'] = stats.completed_orders;
      }
    }

    var statusOrder = ['Pending', 'In Progress', 'Ready', 'Completed', 'Delivered', 'Cancelled', 'Active'];
    statusOrder.forEach(function (status) {
      if (sc[status] && sc[status] > 0) {
        var pill = document.createElement('span');
        pill.className = 'status-pill badge ' + (BADGE_MAP[status] || 'badge-pending');
        pill.textContent = status + ': ' + sc[status];
        pills.appendChild(pill);
      }
    });

    if (pills.children.length === 0) {
      pills.innerHTML = '<span style="font-size:13px;color:#999;">No orders yet</span>';
    }
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  document.addEventListener('DOMContentLoaded', function () {
    loadProfile().then(function (user) {
      if (user) {
        loadStats();
      }
    });
  });
})();
