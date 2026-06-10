    // Hamburger menu
    document.getElementById('hamburgerBtn').addEventListener('click', function() {
      document.getElementById('navLinks').classList.toggle('open');
    });

    /* -------------------------------------------------------
     * ORDER TRACKING LOGIC
     *   For demo purposes, any order number works.
     *   Status and progress are simulated.
     * ------------------------------------------------------- */

    document.getElementById('trackBtn').addEventListener('click', function() {
      const orderNumber = document.getElementById('orderNumberInput').value.trim();
      const errorEl = document.getElementById('trackError');
      const resultEl = document.getElementById('trackingResult');

      // Validate input
      if (orderNumber === '') {
        errorEl.textContent = 'Please enter an order number.';
        resultEl.classList.remove('visible');
        return;
      }

      errorEl.textContent = '';
      resultEl.classList.add('visible');

      // Display order number
      document.getElementById('trackOrderNum').textContent = orderNumber;

      // For demo: simulate a random status
      // In a real app, this would fetch from the database
      const statuses = ['Pending', 'In Progress', 'Ready', 'Completed', 'Delivered'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      // Update status badge
      const badge = document.getElementById('trackStatusBadge');
      badge.textContent = randomStatus;

      // Map status to badge CSS class
      const badgeMap = {
        'Pending': 'badge-pending',
        'In Progress': 'badge-inprogress',
        'Ready': 'badge-ready',
        'Completed': 'badge-completed',
        'Delivered': 'badge-delivered'
      };
      badge.className = 'badge ' + (badgeMap[randomStatus] || 'badge-pending');

      // Map status to step number
      const stepMap = {
        'Pending': 1,
        'In Progress': 2,
        'Ready': 3,
        'Completed': 4,
        'Delivered': 5
      };
      const currentStep = stepMap[randomStatus] || 1;

      // Update progress steps
      for (let i = 1; i <= 5; i++) {
        const stepEl = document.getElementById('step' + i);
        // Remove existing classes
        stepEl.classList.remove('completed', 'active');

        if (i < currentStep) {
          stepEl.classList.add('completed');
        } else if (i === currentStep) {
          stepEl.classList.add('active');
        }
      }
    });
