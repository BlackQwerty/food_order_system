    // Hamburger menu
    document.getElementById('hamburgerBtn').addEventListener('click', function() {
      document.getElementById('navLinks').classList.toggle('open');
    });

    /* -------------------------------------------------------
     * FILTER ORDERS BY STATUS
     * ------------------------------------------------------- */
    document.querySelectorAll('.filter-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        // Update active button style
        document.querySelectorAll('.filter-btn').forEach(function(b) {
          b.classList.remove('active-filter');
        });
        this.classList.add('active-filter');

        // Filter rows
        const filter = this.getAttribute('data-filter');
        const rows = document.querySelectorAll('#staffOrderTable tr');
        rows.forEach(function(row) {
          if (filter === 'all' || row.getAttribute('data-status') === filter) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });
      });
    });

    /* -------------------------------------------------------
     * UPDATE ORDER STATUS (demo — simulates staff updating)
     * ------------------------------------------------------- */
    const statusOrder = ['Pending', 'In Progress', 'Ready', 'Completed', 'Delivered'];
    const badgeClasses = ['badge-pending', 'badge-inprogress', 'badge-ready', 'badge-completed', 'badge-delivered'];

    document.querySelectorAll('.update-status').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const row = this.closest('tr');  // Find the parent table row
        const newStatus = this.getAttribute('data-new');

        // Update the row's data-status attribute
        row.setAttribute('data-status', newStatus);

        // Find the status badge cell and update it
        const badgeCell = row.querySelectorAll('td')[5];  // 6th column (0-indexed = 5)
        const badge = badgeCell.querySelector('.badge');

        const statusIndex = statusOrder.indexOf(newStatus);
        badge.textContent = newStatus;
        badge.className = 'badge ' + (badgeClasses[statusIndex] || 'badge-pending');

        // Update the action button
        const actionCell = row.querySelectorAll('td')[6];  // 7th column
        const nextIndex = statusIndex + 1;

        if (nextIndex < statusOrder.length) {
          const nextStatus = statusOrder[nextIndex];
          actionCell.innerHTML = '<button class="btn-link update-status" data-new="' + nextStatus + '">→ ' + nextStatus + '</button>';
          // Re-attach event to the new button
          actionCell.querySelector('.update-status').addEventListener('click', arguments.callee);
        } else {
          actionCell.innerHTML = '<span style="color:#2e7d32;">Done</span>';
        }

        // Also apply the current filter
        const activeFilter = document.querySelector('.filter-btn.active-filter');
        if (activeFilter && activeFilter.getAttribute('data-filter') !== 'all') {
          if (newStatus !== activeFilter.getAttribute('data-filter')) {
            row.style.display = 'none';
          }
        }
      });
    });
