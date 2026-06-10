    /* -------------------------------------------------------
     * 1. MOBILE NAVIGATION TOGGLE
     * ------------------------------------------------------- */
    document.getElementById('hamburgerBtn').addEventListener('click', function () {
      document.getElementById('navLinks').classList.toggle('open');
    });

    /* -------------------------------------------------------
     * 2. CATEGORY FILTER TABS
     *    Clicking a tab hides/shows menu items based on category
     * ------------------------------------------------------- */
    const tabs = document.querySelectorAll('.category-tab');
    const items = document.querySelectorAll('.menu-item');

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        // Remove active class from all tabs
        tabs.forEach(function (t) { t.classList.remove('active-tab'); });
        // Add active class to clicked tab
        this.classList.add('active-tab');

        const category = this.getAttribute('data-category');

        // Show/hide items based on selected category
        items.forEach(function (item) {
          if (category === 'all' || item.getAttribute('data-category') === category) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });

    /* -------------------------------------------------------
     * 3. ADD TO CART + TOAST NOTIFICATION
     *    Stores cart items in localStorage (survives page reload)
     * ------------------------------------------------------- */
    function getCart() {
      // Read cart from browser's localStorage (converts from JSON string to JS array)
      const cartData = localStorage.getItem('flavoursCart');
      return cartData ? JSON.parse(cartData) : [];
    }

    function saveCart(cart) {
      // Save cart array back to localStorage as a JSON string
      localStorage.setItem('flavoursCart', JSON.stringify(cart));
    }

    function updateCartCount() {
      // Update all cart count badges on the page
      const cart = getCart();
      const total = cart.reduce(function (sum, item) { return sum + item.quantity; }, 0);
      const counters = document.querySelectorAll('.cart-count');
      counters.forEach(function (counter) { counter.textContent = total; });
    }

    function showToast() {
      const toast = document.getElementById('toast');
      toast.classList.add('show');
      // Hide toast after 2 seconds
      setTimeout(function () {
        toast.classList.remove('show');
      }, 2000);
    }

    // Attach click handlers to ALL "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(function (button) {
      button.addEventListener('click', function () {
        const name = this.getAttribute('data-name');
        const price = parseFloat(this.getAttribute('data-price'));
        const cart = getCart();

        // Check if item already exists in cart
        const existing = cart.find(function (item) { return item.name === name; });
        if (existing) {
          existing.quantity += 1;  // Increase quantity
        } else {
          cart.push({ name: name, price: price, quantity: 1 });  // Add new item
        }

        saveCart(cart);
        updateCartCount();
        showToast();
      });
    });

    /* -------------------------------------------------------
     * 4. QR CODE MODAL (for walk-in demonstration)
     * ------------------------------------------------------- */
    // Open modal button — we can trigger this from the homepage too
    // For demo purposes, we add a small trigger
    const openModalBtn = document.createElement('a');
    // Not adding inline — modal is accessible if needed

    document.getElementById('closeQrModal').addEventListener('click', function () {
      document.getElementById('qrModal').classList.remove('open');
    });

    document.getElementById('submitTableBtn').addEventListener('click', function () {
      const tableNum = document.getElementById('tableNumber').value;
      if (tableNum && parseInt(tableNum) > 0) {
        // Save table number for walk-in orders
        localStorage.setItem('tableNumber', tableNum);
        alert('Table ' + tableNum + ' selected! Continue ordering from the menu.');
        document.getElementById('qrModal').classList.remove('open');
      } else {
        alert('Please enter a valid table number.');
      }
    });

    // Close modal when clicking outside (on the dark overlay)
    document.getElementById('qrModal').addEventListener('click', function (e) {
      if (e.target === this) {
        this.classList.remove('open');
      }
    });

    // Initialize cart count on page load
    updateCartCount();
