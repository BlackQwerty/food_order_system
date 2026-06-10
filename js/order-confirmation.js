    // Hamburger menu
    document.getElementById('hamburgerBtn').addEventListener('click', function() {
      document.getElementById('navLinks').classList.toggle('open');
    });

    // Display order info from localStorage
    const orderNumber = localStorage.getItem('lastOrderNumber') || 'FH-00000000';
    const total = localStorage.getItem('lastOrderTotal') || 'RM 0.00';
    document.getElementById('orderNumberDisplay').textContent = orderNumber;
    document.getElementById('totalDisplay').textContent = total;
