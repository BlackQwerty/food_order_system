/* -------------------------------------------------------
 * MEMBER DASHBOARD — dashboard.js
 * Loads the current customer's profile + their real orders.
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

  function formatMemberSince(iso) {
    if (!iso) return '—';
    var d = new Date(iso.replace(' ', 'T'));
    if (isNaN(d)) return iso;
    return MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }

  function formatDate(iso) {
    if (!iso) return '-';
    var d = new Date(iso.replace(' ', 'T'));
    if (isNaN(d)) return iso;
    return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }

  var currentUser = null;

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
        document.getElementById('profileName').textContent  = user.name;
        document.getElementById('profileEmail').textContent = user.email;
        document.getElementById('profilePhone').textContent = user.phone;
        document.getElementById('dashboardWelcomeName').textContent = user.name.split(' ')[0];
        document.getElementById('profileSince').textContent =
          formatMemberSince(user.registration_date);

        var addrEl = document.getElementById('profileAddress');
        if (addrEl) {
          addrEl.textContent = user.address || 'No address saved';
        }

        return user;
      });
  }

  function bindEditProfile() {
    var editBtn   = document.getElementById('editProfileBtn');
    var form      = document.getElementById('editProfileForm');
    var cancelBtn = document.getElementById('cancelEditBtn');
    var saveBtn   = document.getElementById('saveProfileBtn');
    if (!editBtn || !form) return;

    editBtn.addEventListener('click', function () {
      form.style.display = '';
      var phoneInput = document.getElementById('editPhone');
      var addrInput  = document.getElementById('editAddress');
      if (phoneInput && currentUser) phoneInput.value = currentUser.phone || '';
      if (addrInput && currentUser)  addrInput.value  = currentUser.address || '';
      document.getElementById('profileSaveMsg').style.display = 'none';
    });

    cancelBtn.addEventListener('click', function () {
      form.style.display = 'none';
    });

    saveBtn.addEventListener('click', function () {
      var phone   = document.getElementById('editPhone').value.trim();
      var address = document.getElementById('editAddress').value.trim();
      var msgEl   = document.getElementById('profileSaveMsg');

      var body = {};
      if (address !== (currentUser.address || '')) body.address = address;
      if (phone !== (currentUser.phone || ''))     body.phone   = phone;

      if (Object.keys(body).length === 0) {
        msgEl.textContent = 'No changes to save.';
        msgEl.style.color = '#666';
        msgEl.style.display = '';
        return;
      }

      fetch('/php_backend/api/update-profile.php', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success) {
          msgEl.textContent = 'Profile updated!';
          msgEl.style.color = '#2e7d32';
          msgEl.style.display = '';
          if (body.phone)   { currentUser.phone = body.phone;   document.getElementById('profilePhone').textContent = body.phone; }
          if (body.address !== undefined) { currentUser.address = body.address; document.getElementById('profileAddress').textContent = body.address || 'No address saved'; }
          setTimeout(function () { form.style.display = 'none'; }, 1200);
        } else {
          msgEl.textContent = data.message || 'Update failed.';
          msgEl.style.color = '#d32f2f';
          msgEl.style.display = '';
        }
      })
      .catch(function () {
        msgEl.textContent = 'Network error. Please try again.';
        msgEl.style.color = '#d32f2f';
        msgEl.style.display = '';
      });
    });
  }

  function loadOrders() {
    return fetch('/php_backend/api/get-my-orders.php', { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var tbody = document.getElementById('ordersTableBody');
        var empty = document.getElementById('ordersEmpty');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (!data.success || !data.orders || data.orders.length === 0) {
          if (empty) empty.style.display = '';
          return;
        }
        if (empty) empty.style.display = 'none';

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
          itemsCell.style.maxWidth = '260px';
          itemsCell.style.fontSize = '13px';
          itemsCell.style.color = '#555';

          var totalCell = document.createElement('td');
          totalCell.textContent = 'RM ' + o.total_amount;

          var statusCell = document.createElement('td');
          var badge = document.createElement('span');
          badge.className = 'badge ' + (BADGE_MAP[o.order_status] || 'badge-pending');
          badge.textContent = o.order_status;
          statusCell.appendChild(badge);

          var actionCell = document.createElement('td');
          var link = document.createElement('a');
          link.className = 'btn-link';
          link.href = 'tracking.html?order=' + encodeURIComponent(o.order_number);
          link.innerHTML = '<i class="fa-solid fa-location-dot"></i> Track';
          actionCell.appendChild(link);

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
        var empty = document.getElementById('ordersEmpty');
        if (empty) {
          empty.textContent = 'Could not load orders. Please refresh.';
          empty.style.display = '';
        }
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindEditProfile();
    loadProfile().then(function (user) {
      if (user) loadOrders();
    });
  });
})();
