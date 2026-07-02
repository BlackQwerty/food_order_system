// js/admin.js — Admin panel: menu CRUD + order management

document.addEventListener('DOMContentLoaded', () => {

  // ── Auth check ──────────────────────────────────────────────
  fetch('/php_backend/api/check-session.php')
    .then(r => r.json())
    .then(data => {
      if (!data.logged_in || data.user.role !== 'admin') {
        window.location.href = '/login.html';
        return;
      }
      document.getElementById('adminWelcome').textContent =
        `Welcome, ${data.user.name} — Admin`;
      init();
    })
    .catch(() => { window.location.href = '/login.html'; });

  // ── State ───────────────────────────────────────────────────
  let allItems      = [];
  let currentCat    = 'all';
  let currentFilter = 'all';
  let editMode      = false;

  // ── DOM refs ────────────────────────────────────────────────
  const menuTable    = document.getElementById('menuTable');
  const ordersTable  = document.getElementById('ordersTable');
  const menuModal    = document.getElementById('menuModal');
  const deleteModal  = document.getElementById('deleteModal');
  const menuForm     = document.getElementById('menuForm');
  const toast        = document.getElementById('toast');

  // ── Init ────────────────────────────────────────────────────
  function init() {
    loadMenuItems();
    setupTabs();
    setupCatFilter();
    setupOrderFilter();
    setupModal();
    setupDeleteModal();
    setupImagePreview();
    setupStaffModal();
    setupDeleteStaffModal();
    setupTablesQR();
  }

  // ── TAB SWITCHING ───────────────────────────────────────────
  function setupTabs() {
    document.querySelectorAll('.admin-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active-admin-tab'));
        btn.classList.add('active-admin-tab');

        const tab = btn.dataset.tab;
        document.getElementById('tab-menu').style.display   = tab === 'menu'   ? '' : 'none';
        document.getElementById('tab-orders').style.display = tab === 'orders' ? '' : 'none';
        document.getElementById('tab-staff').style.display  = tab === 'staff'  ? '' : 'none';
        document.getElementById('tab-tables').style.display = tab === 'tables' ? '' : 'none';

        if (tab === 'orders') loadOrders();
        if (tab === 'staff')  loadStaff();
        if (tab === 'tables') renderTableQRGrid();
      });
    });
  }

  // ── CATEGORY FILTER (menu tab) ──────────────────────────────
  function setupCatFilter() {
    document.querySelectorAll('#catFilterBar .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#catFilterBar .filter-btn').forEach(b => b.classList.remove('active-filter'));
        btn.classList.add('active-filter');
        currentCat = btn.dataset.cat;
        renderMenuTable();
      });
    });
  }

  // ── ORDER STATUS FILTER ─────────────────────────────────────
  function setupOrderFilter() {
    document.getElementById('tab-orders').querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('tab-orders').querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active-filter'));
        btn.classList.add('active-filter');
        currentFilter = btn.dataset.filter;
        loadOrders(currentFilter);
      });
    });

    document.getElementById('btnRefreshOrders').addEventListener('click', () => {
      loadOrders(currentFilter);
    });
  }

  // ── LOAD MENU ITEMS ─────────────────────────────────────────
  function loadMenuItems() {
    menuTable.innerHTML = '<tr><td colspan="6" class="text-center text-gray" style="padding:32px"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</td></tr>';

    fetch('/php_backend/api/admin-menu-get-all.php')
      .then(r => r.json())
      .then(data => {
        if (!data.success) {
          menuTable.innerHTML = `<tr><td colspan="6" class="text-center text-red">${data.message}</td></tr>`;
          return;
        }
        allItems = data.items;
        renderMenuTable();
      })
      .catch(() => {
        menuTable.innerHTML = '<tr><td colspan="6" class="text-center text-red">Failed to load menu items.</td></tr>';
      });
  }

  // ── RENDER MENU TABLE ────────────────────────────────────────
  function renderMenuTable() {
    const filtered = currentCat === 'all'
      ? allItems
      : allItems.filter(i => i.category === currentCat);

    if (filtered.length === 0) {
      menuTable.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-gray" style="padding:44px">
            <i class="fa-solid fa-plate-wheat" style="font-size:32px;opacity:0.3;display:block;margin-bottom:8px"></i>
            No items found. <button class="btn-link" id="emptyAddBtn">Add the first one</button>
          </td>
        </tr>`;
      document.getElementById('emptyAddBtn')?.addEventListener('click', openAddModal);
      return;
    }

    menuTable.innerHTML = filtered.map(item => {
      const imgSrc   = item.image_url ? `/${item.image_url}` : '';
      const imgHtml  = imgSrc
        ? `<img src="${imgSrc}" alt="${escHtml(item.item_name)}" style="width:56px;height:56px;object-fit:cover;border-radius:6px;border:1px solid #e5e7eb">`
        : `<div style="width:56px;height:56px;background:#f5f5f7;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#ccc"><i class="fa-solid fa-image"></i></div>`;

      const badge = item.availability
        ? `<span class="badge badge-ready">Available</span>`
        : `<span class="badge badge-pending">Hidden</span>`;

      return `
        <tr data-id="${item.item_id}" class="${item.availability ? '' : 'row-hidden'}">
          <td>${imgHtml}</td>
          <td><strong>${escHtml(item.item_name)}</strong>
              ${item.description ? `<br><span class="text-sm text-gray">${escHtml(item.description.substring(0, 60))}${item.description.length > 60 ? '…' : ''}</span>` : ''}
          </td>
          <td>${escHtml(item.category)}</td>
          <td>RM ${item.price}</td>
          <td>${badge}</td>
          <td>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button class="btn-link edit-btn" data-id="${item.item_id}">
                <i class="fa-solid fa-pen"></i> Edit
              </button>
              <button class="btn-link delete-btn" data-id="${item.item_id}" style="color:#d32f2f">
                <i class="fa-solid fa-trash"></i> Remove
              </button>
            </div>
          </td>
        </tr>`;
    }).join('');

    // Attach row action listeners
    menuTable.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => openEditModal(parseInt(btn.dataset.id)));
    });
    menuTable.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => openDeleteModal(parseInt(btn.dataset.id)));
    });
  }

  // ── LOAD ORDERS ──────────────────────────────────────────────
  function loadOrders(status = 'all') {
    ordersTable.innerHTML = '<tr><td colspan="7" class="text-center text-gray" style="padding:32px"><i class="fa-solid fa-spinner fa-spin"></i> Loading orders...</td></tr>';

    const url = status === 'all'
      ? '/php_backend/api/get-orders-list.php'
      : `/php_backend/api/get-orders-list.php?status=${encodeURIComponent(status)}`;

    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (!data.success) {
          ordersTable.innerHTML = `<tr><td colspan="7" class="text-center text-red">${data.message}</td></tr>`;
          return;
        }
        renderOrdersTable(data.orders);
      })
      .catch(() => {
        ordersTable.innerHTML = '<tr><td colspan="7" class="text-center text-red">Failed to load orders.</td></tr>';
      });
  }

  function renderOrdersTable(orders) {
    if (orders.length === 0) {
      ordersTable.innerHTML = '<tr><td colspan="7" class="text-center text-gray" style="padding:44px">No orders found.</td></tr>';
      return;
    }

    const badgeClass = {
      'Pending':     'badge-pending',
      'In Progress': 'badge-inprogress',
      'Ready':       'badge-ready',
      'Completed':   'badge-completed',
      'Delivered':   'badge-delivered',
      'Cancelled':   'badge-pending',
    };

    ordersTable.innerHTML = orders.map(o => {
      const typeDisplay = o.order_type === 'walkin' && o.table_number
        ? `Walk-in (Table ${o.table_number})`
        : 'Online';

      const nextBtns = (o.next_statuses || []).map(s =>
        `<button class="btn-link update-status-btn" data-id="${o.order_id}" data-status="${s}">→ ${s}</button>`
      ).join('');

      return `
        <tr>
          <td>${escHtml(o.order_number)}</td>
          <td>${escHtml(o.customer_name)}</td>
          <td>${typeDisplay}</td>
          <td class="text-sm">${escHtml(o.items_summary || '—')}</td>
          <td>RM ${o.total_amount}</td>
          <td><span class="badge ${badgeClass[o.order_status] || ''}">${o.order_status}</span></td>
          <td>${nextBtns || '<span class="text-sm text-gray">—</span>'}</td>
        </tr>`;
    }).join('');

    ordersTable.querySelectorAll('.update-status-btn').forEach(btn => {
      btn.addEventListener('click', () => updateOrderStatus(
        parseInt(btn.dataset.id),
        btn.dataset.status
      ));
    });
  }

  function updateOrderStatus(orderId, newStatus) {
    fetch('/php_backend/staff-update-order.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId, new_status: newStatus }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          showToast(`Order updated to ${newStatus}`);
          loadOrders(currentFilter);
        } else {
          showToast(data.message || 'Update failed.', true);
        }
      })
      .catch(() => showToast('Network error.', true));
  }

  // ── ADD/EDIT MODAL ───────────────────────────────────────────
  function setupModal() {
    document.getElementById('btnAddItem').addEventListener('click', openAddModal);
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);

    menuModal.addEventListener('click', e => {
      if (e.target === menuModal) closeModal();
    });

    menuForm.addEventListener('submit', handleFormSubmit);
  }

  function openAddModal() {
    editMode = false;
    document.getElementById('modalTitle').textContent = 'Add Menu Item';
    document.getElementById('saveBtn').innerHTML = '<i class="fa-solid fa-plus"></i> Add Item';
    menuForm.reset();
    document.getElementById('editItemId').value = '';
    document.getElementById('availabilityRow').style.display = 'none';
    document.getElementById('imagePreviewWrap').style.display = 'none';
    clearErrors();
    menuModal.classList.add('open');
  }

  function openEditModal(itemId) {
    const item = allItems.find(i => i.item_id === itemId);
    if (!item) return;

    editMode = true;
    document.getElementById('modalTitle').textContent = 'Edit Menu Item';
    document.getElementById('saveBtn').innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Changes';
    document.getElementById('editItemId').value = item.item_id;
    document.getElementById('itemName').value     = item.item_name;
    document.getElementById('itemCategory').value = item.category;
    document.getElementById('itemDesc').value      = item.description || '';
    document.getElementById('itemPrice').value     = item.price;
    document.getElementById('itemAvailability').checked = item.availability;
    document.getElementById('availabilityRow').style.display = 'flex';

    // Show existing image preview
    if (item.image_url) {
      document.getElementById('previewImg').src = `/${item.image_url}`;
      document.getElementById('imagePreviewWrap').style.display = 'block';
      document.querySelector('#menuForm label[for="itemImage"]').innerHTML =
        'Item Image <span class="text-sm text-gray">(upload new to replace)</span>';
    } else {
      document.getElementById('imagePreviewWrap').style.display = 'none';
    }

    clearErrors();
    menuModal.classList.add('open');
  }

  function closeModal() {
    menuModal.classList.remove('open');
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    if (!validateMenuForm()) return;

    const formData = new FormData(menuForm);
    const url = editMode
      ? '/php_backend/api/admin-menu-update.php'
      : '/php_backend/api/admin-menu-add.php';

    const saveBtn = document.getElementById('saveBtn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    fetch(url, { method: 'POST', body: formData })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          showToast(data.message);
          closeModal();
          loadMenuItems();
        } else {
          if (data.errors) {
            Object.entries(data.errors).forEach(([field, msg]) => {
              const errEl = document.getElementById('err' + capitalize(field));
              if (errEl) errEl.textContent = msg;
            });
          } else {
            showToast(data.message || 'Save failed.', true);
          }
        }
      })
      .catch(() => showToast('Network error.', true))
      .finally(() => {
        saveBtn.disabled = false;
        saveBtn.innerHTML = editMode
          ? '<i class="fa-solid fa-floppy-disk"></i> Save Changes'
          : '<i class="fa-solid fa-plus"></i> Add Item';
      });
  }

  function validateMenuForm() {
    clearErrors();
    let valid = true;

    const name  = document.getElementById('itemName').value.trim();
    const cat   = document.getElementById('itemCategory').value;
    const price = document.getElementById('itemPrice').value;

    if (!name) {
      document.getElementById('errName').textContent = 'Item name is required.';
      document.getElementById('itemName').classList.add('error');
      valid = false;
    }
    if (!cat) {
      document.getElementById('errCategory').textContent = 'Please select a category.';
      document.getElementById('itemCategory').classList.add('error');
      valid = false;
    }
    if (!price || isNaN(price) || parseFloat(price) < 0) {
      document.getElementById('errPrice').textContent = 'Enter a valid price (e.g. 8.90).';
      document.getElementById('itemPrice').classList.add('error');
      valid = false;
    }

    return valid;
  }

  function clearErrors() {
    document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  }

  // ── DELETE MODAL ─────────────────────────────────────────────
  function setupDeleteModal() {
    document.getElementById('cancelDelete').addEventListener('click', () => {
      deleteModal.classList.remove('open');
    });

    deleteModal.addEventListener('click', e => {
      if (e.target === deleteModal) deleteModal.classList.remove('open');
    });

    document.getElementById('confirmDelete').addEventListener('click', () => {
      const itemId = parseInt(document.getElementById('deleteItemId').value);
      doDelete(itemId);
    });
  }

  function openDeleteModal(itemId) {
    document.getElementById('deleteItemId').value = itemId;
    deleteModal.classList.add('open');
  }

  function doDelete(itemId) {
    const btn = document.getElementById('confirmDelete');
    btn.disabled = true;
    btn.textContent = 'Removing...';

    fetch('/php_backend/api/admin-menu-delete.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: itemId }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          showToast(data.message);
          deleteModal.classList.remove('open');
          loadMenuItems();
        } else {
          showToast(data.message || 'Failed to remove item.', true);
        }
      })
      .catch(() => showToast('Network error.', true))
      .finally(() => {
        btn.disabled = false;
        btn.textContent = 'Yes, Remove';
      });
  }

  // ── IMAGE PREVIEW ────────────────────────────────────────────
  function setupImagePreview() {
    document.getElementById('itemImage').addEventListener('change', function () {
      const file = this.files[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        showToast('Image must be under 2MB.', true);
        this.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = e => {
        document.getElementById('previewImg').src = e.target.result;
        document.getElementById('imagePreviewWrap').style.display = 'block';
      };
      reader.readAsDataURL(file);
    });
  }

  // ── TABLES & QR CODES ───────────────────────────────────────
  function setupTablesQR() {
    document.getElementById('btnGenerateQR').addEventListener('click', renderTableQRGrid);
  }

  function renderTableQRGrid() {
    var count = parseInt(document.getElementById('tableCount').value, 10);
    if (!count || count < 1) count = 10;
    if (count > 100) count = 100;

    var grid = document.getElementById('tableQRGrid');
    grid.innerHTML = '';

    var base = window.location.origin + '/menu.html?table=';

    for (var t = 1; t <= count; t++) {
      var url = base + t;

      var card = document.createElement('div');
      card.style.cssText = 'background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:20px;text-align:center;';

      var title = document.createElement('div');
      title.textContent = 'Table ' + t;
      title.style.cssText = 'font-size:16px;font-weight:700;margin-bottom:12px;';

      var canvas = document.createElement('canvas');
      canvas.id = 'qr-table-' + t;
      canvas.style.cssText = 'border-radius:8px;display:block;margin:0 auto 12px;';

      var urlLabel = document.createElement('div');
      urlLabel.textContent = 'menu.html?table=' + t;
      urlLabel.style.cssText = 'font-size:11px;color:#999;margin-bottom:12px;word-break:break-all;';

      var printBtn = document.createElement('button');
      printBtn.className = 'btn-secondary';
      printBtn.style.cssText = 'font-size:13px;padding:6px 16px;width:100%;';
      printBtn.innerHTML = '<i class="fa-solid fa-print"></i> Print QR';
      printBtn.setAttribute('data-table', t);
      printBtn.setAttribute('data-url', url);

      card.appendChild(title);
      card.appendChild(canvas);
      card.appendChild(urlLabel);
      card.appendChild(printBtn);
      grid.appendChild(card);

      // Generate QR into canvas
      QRCode.toCanvas(canvas, url, { width: 160, margin: 1 }, function (err) {
        if (err) console.error('QR error:', err);
      });

      // Print handler
      printBtn.addEventListener('click', function () {
        var tableNum = this.getAttribute('data-table');
        var qrUrl    = this.getAttribute('data-url');
        var win = window.open('', '_blank', 'width=400,height=500');
        var cvs = document.getElementById('qr-table-' + tableNum);
        win.document.write(
          '<!DOCTYPE html><html><head><title>Table ' + tableNum + ' QR</title>' +
          '<style>body{font-family:Arial,sans-serif;text-align:center;padding:40px;}' +
          'h2{margin-bottom:8px;}p{color:#666;font-size:13px;margin-bottom:20px;}</style></head>' +
          '<body><h2>ClickEat — Table ' + tableNum + '</h2>' +
          '<p>Scan to view menu &amp; order</p>' +
          '<img src="' + cvs.toDataURL() + '" style="width:200px;height:200px;border-radius:8px;">' +
          '<p style="margin-top:16px;font-size:11px;color:#aaa;">' + qrUrl + '</p>' +
          '<script>window.onload=function(){window.print();window.close();}<\/script>' +
          '</body></html>'
        );
        win.document.close();
      });
    }
  }

  // ── STAFF MANAGEMENT ────────────────────────────────────────
  function loadStaff() {
    const tbody = document.getElementById('staffTable');
    tbody.innerHTML = '<tr><td colspan="8" class="text-center text-gray" style="padding:32px"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</td></tr>';
    fetch('/php_backend/api/get-staff.php')
      .then(r => r.json())
      .then(data => {
        if (!data.success) { tbody.innerHTML = `<tr><td colspan="8" class="text-center" style="color:#d32f2f;padding:24px">${escHtml(data.message)}</td></tr>`; return; }
        renderStaffTable(data.staff || []);
      })
      .catch(() => { tbody.innerHTML = '<tr><td colspan="8" class="text-center" style="color:#d32f2f;padding:24px">Failed to load staff.</td></tr>'; });
  }

  function renderStaffTable(staff) {
    const tbody = document.getElementById('staffTable');
    if (staff.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center text-gray" style="padding:44px">No staff accounts yet. Click <strong>Add Staff</strong> to create one.</td></tr>';
      return;
    }
    tbody.innerHTML = staff.map(s => `
      <tr>
        <td><code>${escHtml(s.staff_code)}</code></td>
        <td>${escHtml(s.full_name)}</td>
        <td>${escHtml(s.email)}</td>
        <td>${escHtml(s.phone || '—')}</td>
        <td>${escHtml(s.position)}</td>
        <td>${escHtml(s.shift)}</td>
        <td>
          <span class="badge ${s.status === 'Active' ? 'badge-completed' : 'badge-cancelled'}">${escHtml(s.status)}</span>
        </td>
        <td>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn-link staff-toggle" data-id="${s.staff_id}" data-status="${escHtml(s.status)}">
              ${s.status === 'Active' ? 'Deactivate' : 'Activate'}
            </button>
            <button class="btn-link" style="color:#d32f2f" data-id="${s.staff_id}" data-name="${escHtml(s.full_name)}" onclick="(function(btn){
              document.getElementById('deleteStaffId').value = btn.dataset.id;
              document.getElementById('deleteStaffModal').classList.add('open');
            })(this)">Delete</button>
          </div>
        </td>
      </tr>`).join('');

    tbody.querySelectorAll('.staff-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const fd = new FormData();
        fd.append('action', 'toggle_status');
        fd.append('staff_id', btn.dataset.id);
        fetch('/php_backend/staff-manage.php', { method: 'POST', body: fd })
          .then(r => r.json())
          .then(data => {
            if (data.success) { loadStaff(); showToast('Status updated to ' + data.new_status); }
            else showToast(data.message, true);
          });
      });
    });
  }

  function setupStaffModal() {
    const modal     = document.getElementById('staffModal');
    const form      = document.getElementById('staffForm');
    const closeBtn  = document.getElementById('staffModalClose');
    const cancelBtn = document.getElementById('staffCancelBtn');

    document.getElementById('btnAddStaff').addEventListener('click', () => {
      document.getElementById('staffModalTitle').textContent = 'Add Staff Account';
      document.getElementById('editStaffId').value = '';
      form.reset();
      ['errStaffName','errStaffEmail','errStaffPassword','errStaffPosition'].forEach(id => {
        document.getElementById(id).textContent = '';
      });
      document.getElementById('staffPasswordGroup').style.display = '';
      modal.classList.add('open');
    });

    [closeBtn, cancelBtn].forEach(b => b.addEventListener('click', () => modal.classList.remove('open')));
    modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const name     = document.getElementById('staffName').value.trim();
      const email    = document.getElementById('staffEmail').value.trim();
      const password = document.getElementById('staffPassword').value;
      const position = document.getElementById('staffPosition').value;

      let valid = true;
      if (!name)     { document.getElementById('errStaffName').textContent = 'Required.'; valid = false; } else document.getElementById('errStaffName').textContent = '';
      if (!email)    { document.getElementById('errStaffEmail').textContent = 'Required.'; valid = false; } else document.getElementById('errStaffEmail').textContent = '';
      if (password.length < 6) { document.getElementById('errStaffPassword').textContent = 'Min. 6 characters.'; valid = false; } else document.getElementById('errStaffPassword').textContent = '';
      if (!position) { document.getElementById('errStaffPosition').textContent = 'Required.'; valid = false; } else document.getElementById('errStaffPosition').textContent = '';
      if (!valid) return;

      const saveBtn = document.getElementById('staffSaveBtn');
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';

      const fd = new FormData();
      fd.append('action',    'create');
      fd.append('full_name', name);
      fd.append('email',     email);
      fd.append('password',  password);
      fd.append('phone',     document.getElementById('staffPhone').value.trim());
      fd.append('position',  position);
      fd.append('shift',     document.getElementById('staffShift').value);

      fetch('/php_backend/staff-manage.php', { method: 'POST', body: fd })
        .then(r => r.json())
        .then(data => {
          saveBtn.disabled = false;
          saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save';
          if (data.success) {
            modal.classList.remove('open');
            showToast(data.message);
            loadStaff();
          } else {
            document.getElementById('errStaffEmail').textContent = data.message;
          }
        })
        .catch(() => {
          saveBtn.disabled = false;
          saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save';
          showToast('Network error.', true);
        });
    });
  }

  function setupDeleteStaffModal() {
    const modal = document.getElementById('deleteStaffModal');
    document.getElementById('cancelDeleteStaff').addEventListener('click', () => modal.classList.remove('open'));
    document.getElementById('confirmDeleteStaff').addEventListener('click', () => {
      const staffId = document.getElementById('deleteStaffId').value;
      const fd = new FormData();
      fd.append('action',   'delete');
      fd.append('staff_id', staffId);
      fetch('/php_backend/staff-manage.php', { method: 'POST', body: fd })
        .then(r => r.json())
        .then(data => {
          modal.classList.remove('open');
          if (data.success) { showToast('Staff account removed.'); loadStaff(); }
          else showToast(data.message, true);
        });
    });
  }

  // ── HELPERS ──────────────────────────────────────────────────
  function showToast(msg, isError = false) {
    toast.textContent = msg;
    toast.style.backgroundColor = isError ? '#d32f2f' : '#1d1d1f';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function escHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1).replace(/_([a-z])/g, (_, c) => c.toUpperCase());
  }

});
