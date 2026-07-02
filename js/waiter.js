/* -------------------------------------------------------
 * WAITER INTERFACE — waiter.js
 * Fetches real menu from DB, submits orders via order-process.php
 * Only accessible to staff and admin roles.
 * ------------------------------------------------------- */

(function () {

  var waiterCart    = [];
  var selectedTable = null;
  var allMenuItems  = [];
  var html5QrScanner = null;

  // ── Auth guard ─────────────────────────────────────────────────
  fetch('/php_backend/api/get-session-user.php', { credentials: 'same-origin' })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (!data.logged_in || !data.user) {
        window.location.href = '/login.html';
        return;
      }
      var role     = data.user.role;
      var position = data.user.position || '';
      if (role !== 'staff' && role !== 'admin') {
        window.location.href = '/login.html';
        return;
      }
      if (position === 'Kitchen') {
        alert('Kitchen staff cannot place orders. Please use the Manage Orders page.');
        window.location.href = '/dashboard.html';
        return;
      }
      // Show staff name in header
      var nameEl = document.getElementById('waiterStaffName');
      if (nameEl) nameEl.textContent = data.user.name;
      // Load menu from DB
      loadMenu();
    })
    .catch(function () {
      window.location.href = '/login.html';
    });

  // ── Load menu from API ─────────────────────────────────────────
  function loadMenu() {
    fetch('/php_backend/api/get-menu.php', { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.success) { showMenuError('Could not load menu.'); return; }
        allMenuItems = data.items || [];
      })
      .catch(function () { showMenuError('Network error loading menu.'); });
  }

  function showMenuError(msg) {
    var grid = document.getElementById('waiterMenuGrid');
    if (grid) grid.innerHTML = '<p style="color:#d32f2f;padding:16px;">' + msg + '</p>';
  }

  // ── QR Scanner ────────────────────────────────────────────────
  document.getElementById('startScanBtn').addEventListener('click', function () {
    document.getElementById('qrScannerWrap').style.display = '';
    this.style.display = 'none';

    html5QrScanner = new Html5Qrcode('qrReaderBox');
    html5QrScanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      function (decodedText) {
        // Extract table number from URL: menu.html?table=N
        var match = decodedText.match(/[?&]table=(\d+)/);
        if (match) {
          var tableNum = match[1];
          stopScanner();
          document.getElementById('waiterTableNum').value = tableNum;
          document.getElementById('tableError').textContent = '';
          // Flash the input so waiter sees it was filled
          var input = document.getElementById('waiterTableNum');
          input.style.borderColor = '#2e7d32';
          setTimeout(function () { input.style.borderColor = ''; }, 1500);
          // Auto-confirm after short delay
          setTimeout(function () {
            document.getElementById('confirmTableBtn').click();
          }, 600);
        } else {
          document.getElementById('tableError').textContent = 'QR code is not a valid ClickEat table code.';
          stopScanner();
        }
      },
      function () { /* scan errors are normal — ignore */ }
    ).catch(function (err) {
      stopScanner();
      alert('Camera error: ' + err + '\n\nPlease enter the table number manually.');
    });
  });

  document.getElementById('stopScanBtn').addEventListener('click', stopScanner);

  function stopScanner() {
    if (html5QrScanner) {
      html5QrScanner.stop().catch(function () {});
      html5QrScanner = null;
    }
    document.getElementById('qrScannerWrap').style.display = 'none';
    document.getElementById('startScanBtn').style.display = '';
  }

  // ── Step 1: Confirm table ──────────────────────────────────────
  document.getElementById('confirmTableBtn').addEventListener('click', function () {
    var input  = document.getElementById('waiterTableNum');
    var errEl  = document.getElementById('tableError');
    var tableNum = parseInt(input.value.trim(), 10);

    if (!tableNum || tableNum <= 0) {
      errEl.textContent = 'Please enter a valid table number.';
      return;
    }
    errEl.textContent = '';
    selectedTable = tableNum;

    document.getElementById('selectedTableDisplay').textContent = 'Table ' + selectedTable;
    document.getElementById('submitTableNum').textContent = selectedTable;
    document.getElementById('stepEnterTable').style.display = 'none';
    document.getElementById('stepSelectItems').style.display = '';

    renderWaiterMenu();
  });

  // ── Change table ───────────────────────────────────────────────
  document.getElementById('changeTableBtn').addEventListener('click', function () {
    document.getElementById('stepSelectItems').style.display = 'none';
    document.getElementById('stepEnterTable').style.display = '';
    selectedTable = null;
    waiterCart = [];
  });

  // ── Render menu grid ───────────────────────────────────────────
  function renderWaiterMenu() {
    var grid = document.getElementById('waiterMenuGrid');
    grid.innerHTML = '';

    if (allMenuItems.length === 0) {
      grid.innerHTML = '<p style="padding:16px;color:#999;">Loading menu...</p>';
      // retry once
      setTimeout(function () {
        if (allMenuItems.length > 0) renderWaiterMenu();
        else loadMenu();
      }, 800);
      return;
    }

    allMenuItems.forEach(function (item) {
      var card = document.createElement('div');
      card.className = 'card';
      card.style.textAlign = 'center';
      card.style.padding = '12px';

      var img = '';
      if (item.image_url) {
        img = '<img src="' + item.image_url + '" alt="' + escHtml(item.item_name) +
              '" style="width:100%;height:100px;object-fit:cover;border-radius:8px;margin-bottom:8px;" onerror="this.style.display=\'none\'">';
      }

      card.innerHTML =
        img +
        '<h4 style="font-size:14px;margin-bottom:4px;">' + escHtml(item.item_name) + '</h4>' +
        '<p style="color:#0071e3;font-weight:700;margin-bottom:8px;">RM ' + parseFloat(item.price).toFixed(2) + '</p>' +
        '<button class="btn-primary add-waiter-item" style="width:100%;padding:6px;" ' +
          'data-id="' + item.item_id + '" ' +
          'data-name="' + escAttr(item.item_name) + '" ' +
          'data-price="' + item.price + '">+ Add</button>';

      grid.appendChild(card);
    });

    // Bind add buttons
    grid.querySelectorAll('.add-waiter-item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id    = parseInt(this.getAttribute('data-id'), 10);
        var name  = this.getAttribute('data-name');
        var price = parseFloat(this.getAttribute('data-price'));
        var existing = waiterCart.find(function (i) { return i.item_id === id; });
        if (existing) {
          existing.quantity += 1;
        } else {
          waiterCart.push({ item_id: id, name: name, price: price, quantity: 1 });
        }
        renderWaiterCart();
        // Flash button
        var btn2 = this;
        btn2.textContent = '✓ Added';
        btn2.disabled = true;
        setTimeout(function () { btn2.textContent = '+ Add'; btn2.disabled = false; }, 700);
      });
    });
  }

  // ── Render cart ────────────────────────────────────────────────
  function renderWaiterCart() {
    var emptyEl   = document.getElementById('waiterCartEmpty');
    var contentEl = document.getElementById('waiterCartContent');
    var tbody     = document.getElementById('waiterCartBody');

    if (waiterCart.length === 0) {
      emptyEl.style.display  = '';
      contentEl.style.display = 'none';
      return;
    }
    emptyEl.style.display  = 'none';
    contentEl.style.display = '';
    tbody.innerHTML = '';

    var total = 0;
    waiterCart.forEach(function (item, idx) {
      var lineTotal = item.price * item.quantity;
      total += lineTotal;
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + escHtml(item.name) + '</td>' +
        '<td>RM ' + item.price.toFixed(2) + '</td>' +
        '<td><div class="qty-control">' +
          '<button class="w-qty-minus" data-index="' + idx + '">−</button>' +
          '<span>' + item.quantity + '</span>' +
          '<button class="w-qty-plus" data-index="' + idx + '">+</button>' +
        '</div></td>' +
        '<td>RM ' + lineTotal.toFixed(2) + '</td>' +
        '<td><button class="btn-link w-remove" data-index="' + idx + '">Remove</button></td>';
      tbody.appendChild(tr);
    });

    document.getElementById('waiterTotal').textContent = 'RM ' + total.toFixed(2);

    tbody.querySelectorAll('.w-qty-minus').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(this.getAttribute('data-index'), 10);
        if (waiterCart[idx].quantity > 1) { waiterCart[idx].quantity -= 1; }
        else { waiterCart.splice(idx, 1); }
        renderWaiterCart();
      });
    });
    tbody.querySelectorAll('.w-qty-plus').forEach(function (btn) {
      btn.addEventListener('click', function () {
        waiterCart[parseInt(this.getAttribute('data-index'), 10)].quantity += 1;
        renderWaiterCart();
      });
    });
    tbody.querySelectorAll('.w-remove').forEach(function (btn) {
      btn.addEventListener('click', function () {
        waiterCart.splice(parseInt(this.getAttribute('data-index'), 10), 1);
        renderWaiterCart();
      });
    });
  }

  // ── Place order — saves to DB via order-process.php ───────────
  document.getElementById('placeWaiterOrderBtn').addEventListener('click', function () {
    if (waiterCart.length === 0) {
      alert('Please select at least one item.');
      return;
    }
    if (!selectedTable) {
      alert('Please enter a table number first.');
      return;
    }

    var btn = this;
    btn.disabled = true;
    btn.textContent = 'Placing order...';

    // Build cart format expected by order-process.php
    var cartForSubmit = waiterCart.map(function (i) {
      return { item_id: i.item_id, name: i.name, price: i.price, quantity: i.quantity };
    });

    var formData = new FormData();
    formData.append('orderType',   'walkin');
    formData.append('tableNum',    selectedTable);
    formData.append('paymentMethod', 'cod');
    formData.append('cart_data',   JSON.stringify(cartForSubmit));
    // waiter-placed orders don't need delivery fields
    formData.append('deliveryName',    '');
    formData.append('deliveryAddress', '');
    formData.append('deliveryPhone',   '');
    formData.append('specialInstructions', 'Waiter-assisted order');

    fetch('/php_backend/order-process.php', {
      method: 'POST',
      credentials: 'same-origin',
      body: formData
    })
    .then(function (r) {
      // order-process.php redirects on success — check if we got JSON (error) or redirect
      var ct = r.headers.get('Content-Type') || '';
      if (ct.indexOf('json') !== -1) {
        return r.json().then(function (data) {
          throw new Error(data.errors ? JSON.stringify(data.errors) : (data.message || 'Order failed'));
        });
      }
      // Success — it redirected, but fetch follows it. Check final URL.
      return r.text().then(function () { return { success: true }; });
    })
    .then(function () {
      // Show success, reset form
      showOrderSuccess();
    })
    .catch(function (err) {
      alert('Error placing order: ' + err.message);
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Place Order for Table <span id="submitTableNum">' + selectedTable + '</span>';
    });
  });

  function showOrderSuccess() {
    var section = document.getElementById('stepSelectItems');
    section.innerHTML =
      '<div class="card" style="text-align:center;padding:40px;">' +
        '<i class="fa-solid fa-circle-check" style="font-size:48px;color:#2e7d32;margin-bottom:16px;"></i>' +
        '<h2 style="color:#2e7d32;margin-bottom:8px;">Order Placed!</h2>' +
        '<p style="color:#555;margin-bottom:24px;">Order for Table ' + selectedTable + ' has been sent to the kitchen.</p>' +
        '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">' +
          '<button class="btn-primary" id="newOrderBtn">New Order</button>' +
          '<a href="dashboard.html" class="btn-secondary">View All Orders</a>' +
        '</div>' +
      '</div>';

    document.getElementById('newOrderBtn').addEventListener('click', function () {
      window.location.reload();
    });
  }

  // ── Helpers ────────────────────────────────────────────────────
  function escHtml(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }
  function escAttr(str) {
    return String(str).replace(/"/g, '&quot;');
  }

})();
