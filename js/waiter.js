    // Hamburger menu
    document.getElementById('hamburgerBtn').addEventListener('click', function() {
      document.getElementById('navLinks').classList.toggle('open');
    });

    /* -------------------------------------------------------
     * WAITER ORDER LOGIC
     * ------------------------------------------------------- */

    // Menu items available (same as menu.html)
    const menuItems = [
      { name: 'Nasi Lemak',           price: 8.90, category: 'main-course' },
      { name: 'Nasi Goreng Kampung',  price: 7.50, category: 'main-course' },
      { name: 'Mee Goreng Mamak',     price: 6.90, category: 'main-course' },
      { name: 'Chicken Rice',         price: 9.50, category: 'main-course' },
      { name: 'Char Kuey Teow',       price: 8.00, category: 'main-course' },
      { name: 'Roti Canai',           price: 4.50, category: 'main-course' },
      { name: 'Curry Laksa',          price: 9.00, category: 'main-course' },
      { name: 'Chicken Satay',        price: 12.00, category: 'main-course' },
      { name: 'Teh Tarik',            price: 3.50, category: 'beverages' },
      { name: 'Milo Ais',             price: 4.00, category: 'beverages' },
      { name: 'Sirap Bandung',        price: 3.00, category: 'beverages' },
      { name: 'Lemonade',             price: 5.00, category: 'beverages' },
      { name: 'Cendol',               price: 5.50, category: 'desserts' },
      { name: 'Pisang Goreng',        price: 4.00, category: 'desserts' },
      { name: 'Ais Kacang',           price: 6.00, category: 'desserts' },
      { name: 'Bubur Cha Cha',        price: 5.00, category: 'desserts' }
    ];

    let waiterCart = [];
    let selectedTable = null;

    // Step 1: Confirm table number
    document.getElementById('confirmTableBtn').addEventListener('click', function() {
      const tableNumInput = document.getElementById('waiterTableNum');
      const tableNum = parseInt(tableNumInput.value.trim());
      const errorEl = document.getElementById('tableError');

      if (!tableNum || tableNum <= 0) {
        errorEl.textContent = 'Please enter a valid table number.';
        return;
      }

      errorEl.textContent = '';
      selectedTable = tableNum;
      document.getElementById('selectedTableDisplay').textContent = 'Table ' + selectedTable;
      document.getElementById('submitTableNum').textContent = selectedTable;
      document.getElementById('stepEnterTable').style.display = 'none';
      document.getElementById('stepSelectItems').style.display = '';

      // Render menu items
      renderWaiterMenu();
    });

    // Change table
    document.getElementById('changeTableBtn').addEventListener('click', function() {
      document.getElementById('stepSelectItems').style.display = 'none';
      document.getElementById('stepEnterTable').style.display = '';
      selectedTable = null;
      waiterCart = [];
    });

    /* Render menu items grid for waiter */
    function renderWaiterMenu() {
      const grid = document.getElementById('waiterMenuGrid');
      grid.innerHTML = '';

      menuItems.forEach(function(item) {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.textAlign = 'center';
        card.innerHTML = `
          <h4>${item.name}</h4>
          <p class="price">RM ${item.price.toFixed(2)}</p>
          <button class="btn-primary add-waiter-item mt-sm"
                  data-name="${item.name}" data-price="${item.price}">
            + Add
          </button>
        `;
        grid.appendChild(card);
      });

      // Attach add-to-cart handlers
      document.querySelectorAll('.add-waiter-item').forEach(function(btn) {
        btn.addEventListener('click', function() {
          const name = this.getAttribute('data-name');
          const price = parseFloat(this.getAttribute('data-price'));

          const existing = waiterCart.find(function(i) { return i.name === name; });
          if (existing) {
            existing.quantity += 1;
          } else {
            waiterCart.push({ name: name, price: price, quantity: 1 });
          }

          renderWaiterCart();
        });
      });
    }

    /* Render waiter's selected items */
    function renderWaiterCart() {
      const emptyEl = document.getElementById('waiterCartEmpty');
      const contentEl = document.getElementById('waiterCartContent');
      const tbody = document.getElementById('waiterCartBody');

      if (waiterCart.length === 0) {
        emptyEl.style.display = '';
        contentEl.style.display = 'none';
        return;
      }

      emptyEl.style.display = 'none';
      contentEl.style.display = '';
      tbody.innerHTML = '';

      let total = 0;
      waiterCart.forEach(function(item, index) {
        const lineTotal = item.price * item.quantity;
        total += lineTotal;

        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${item.name}</td>
          <td>RM ${item.price.toFixed(2)}</td>
          <td>
            <div class="qty-control">
              <button class="w-qty-minus" data-index="${index}">−</button>
              <span>${item.quantity}</span>
              <button class="w-qty-plus" data-index="${index}">+</button>
            </div>
          </td>
          <td>RM ${lineTotal.toFixed(2)}</td>
          <td><button class="btn-link w-remove" data-index="${index}">Remove</button></td>
        `;
        tbody.appendChild(row);
      });

      document.getElementById('waiterTotal').textContent = 'RM ' + total.toFixed(2);

      // Attach events
      document.querySelectorAll('.w-qty-minus').forEach(function(btn) {
        btn.addEventListener('click', function() {
          const idx = parseInt(this.getAttribute('data-index'));
          if (waiterCart[idx].quantity > 1) {
            waiterCart[idx].quantity -= 1;
          } else {
            waiterCart.splice(idx, 1);
          }
          renderWaiterCart();
        });
      });

      document.querySelectorAll('.w-qty-plus').forEach(function(btn) {
        btn.addEventListener('click', function() {
          const idx = parseInt(this.getAttribute('data-index'));
          waiterCart[idx].quantity += 1;
          renderWaiterCart();
        });
      });

      document.querySelectorAll('.w-remove').forEach(function(btn) {
        btn.addEventListener('click', function() {
          const idx = parseInt(this.getAttribute('data-index'));
          waiterCart.splice(idx, 1);
          renderWaiterCart();
        });
      });
    }

    /* Place waiter order */
    document.getElementById('placeWaiterOrderBtn').addEventListener('click', function() {
      if (waiterCart.length === 0) {
        alert('Please select at least one item for the order.');
        return;
      }

      if (!selectedTable) {
        alert('Please enter a table number first.');
        return;
      }

      // Generate order number and redirect to confirmation
      const orderNumber = 'FH-' + Date.now().toString().slice(-8);
      const total = document.getElementById('waiterTotal').textContent;
      localStorage.setItem('lastOrderNumber', orderNumber);
      localStorage.setItem('lastOrderTotal', total);
      alert('Order placed for Table ' + selectedTable + '!');
      window.location.href = 'order-confirmation.html';
    });
