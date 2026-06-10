    // Hamburger menu toggle
    document.getElementById('hamburgerBtn').addEventListener('click', function() {
      document.getElementById('navLinks').classList.toggle('open');
    });

    /* -------------------------------------------------------
     * CART LOGIC
     *   Cart data is stored in localStorage as a JSON array:
     *   [{name: "Nasi Lemak", price: 8.90, quantity: 2}, ...]
     * ------------------------------------------------------- */

    const DELIVERY_FEE = 3.00;   // RM
    const TAX_RATE = 0.06;       // 6%
    let promoApplied = 0;        // Discount amount in RM

    function getCart() {
      const data = localStorage.getItem('flavoursCart');
      return data ? JSON.parse(data) : [];
    }

    function saveCart(cart) {
      localStorage.setItem('flavoursCart', JSON.stringify(cart));
    }

    /* Render the cart table and price summary */
    function renderCart() {
      const cart = getCart();
      const emptyState = document.getElementById('emptyCart');
      const cartContent = document.getElementById('cartContent');
      const tbody = document.getElementById('cartTableBody');

      if (cart.length === 0) {
        // Show empty state
        emptyState.style.display = '';
        cartContent.style.display = 'none';
        return;
      }

      // Show cart content
      emptyState.style.display = 'none';
      cartContent.style.display = '';

      // Build table rows
      let subtotal = 0;
      tbody.innerHTML = '';  // Clear existing rows

      cart.forEach(function(item, index) {
        const lineTotal = item.price * item.quantity;
        subtotal += lineTotal;

        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${item.name}</td>
          <td>RM ${item.price.toFixed(2)}</td>
          <td>
            <div class="qty-control">
              <button class="qty-minus" data-index="${index}">−</button>
              <span>${item.quantity}</span>
              <button class="qty-plus" data-index="${index}">+</button>
            </div>
          </td>
          <td>RM ${lineTotal.toFixed(2)}</td>
          <td>
            <button class="btn-link remove-item" data-index="${index}">Remove</button>
          </td>
        `;
        tbody.appendChild(row);
      });

      // Calculate prices
      const tax = subtotal * TAX_RATE;
      const total = subtotal + DELIVERY_FEE + tax - promoApplied;

      document.getElementById('subtotal').textContent = 'RM ' + subtotal.toFixed(2);
      document.getElementById('tax').textContent = 'RM ' + tax.toFixed(2);
      document.getElementById('promoDiscount').textContent = '- RM ' + promoApplied.toFixed(2);
      document.getElementById('total').textContent = 'RM ' + Math.max(total, 0).toFixed(2);

      // Attach event handlers to buttons
      attachButtonEvents();
    }

    /* Attach click events to qty +/- and remove buttons */
    function attachButtonEvents() {
      // Quantity minus buttons
      document.querySelectorAll('.qty-minus').forEach(function(btn) {
        btn.addEventListener('click', function() {
          const index = parseInt(this.getAttribute('data-index'));
          const cart = getCart();
          if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
          } else {
            // Ask before removing the last one
            if (confirm('Remove "' + cart[index].name + '" from cart?')) {
              cart.splice(index, 1);
            }
          }
          saveCart(cart);
          renderCart();
          updateHeaderCartCount();
        });
      });

      // Quantity plus buttons
      document.querySelectorAll('.qty-plus').forEach(function(btn) {
        btn.addEventListener('click', function() {
          const index = parseInt(this.getAttribute('data-index'));
          const cart = getCart();
          cart[index].quantity += 1;
          saveCart(cart);
          renderCart();
          updateHeaderCartCount();
        });
      });

      // Remove buttons
      document.querySelectorAll('.remove-item').forEach(function(btn) {
        btn.addEventListener('click', function() {
          const index = parseInt(this.getAttribute('data-index'));
          const cart = getCart();
          if (confirm('Remove "' + cart[index].name + '" from cart?')) {
            cart.splice(index, 1);
            saveCart(cart);
            renderCart();
            updateHeaderCartCount();
          }
        });
      });
    }

    /* Update cart count badges globally (for navbar) */
    function updateHeaderCartCount() {
      const cart = getCart();
      const total = cart.reduce(function(sum, item) { return sum + item.quantity; }, 0);
      const counters = document.querySelectorAll('.cart-count');
      counters.forEach(function(c) { c.textContent = total; });
    }

    /* Promo code logic */
    document.getElementById('applyPromoBtn').addEventListener('click', function() {
      const code = document.getElementById('promoCode').value.trim().toUpperCase();
      const feedback = document.getElementById('promoFeedback');
      const cart = getCart();

      if (cart.length === 0) {
        feedback.textContent = 'Cart is empty.';
        feedback.style.color = '#d32f2f';
        return;
      }

      // Demo promo codes (simple JS validation, no server needed)
      if (code === 'WELCOME5') {
        promoApplied = 5.00;
        feedback.textContent = 'Promo applied! RM 5.00 off.';
        feedback.style.color = '#2e7d32';
      } else if (code === 'HAVEN10') {
        promoApplied = 10.00;
        feedback.textContent = 'Promo applied! RM 10.00 off.';
        feedback.style.color = '#2e7d32';
      } else {
        promoApplied = 0;
        feedback.textContent = 'Invalid promo code. Try WELCOME5 or HAVEN10.';
        feedback.style.color = '#d32f2f';
      }

      renderCart();
    });

    // Initial render
    renderCart();
    updateHeaderCartCount();
