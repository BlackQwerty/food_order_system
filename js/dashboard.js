    // Hamburger menu
    document.getElementById('hamburgerBtn').addEventListener('click', function() {
      document.getElementById('navLinks').classList.toggle('open');
    });

    // Load user profile from localStorage (if registered)
    const userData = localStorage.getItem('flavoursUser');
    if (userData) {
      const user = JSON.parse(userData);
      document.getElementById('profileName').textContent = user.name || 'Guest User';
      document.getElementById('profileEmail').textContent = user.email || 'Not set';
      document.getElementById('profilePhone').textContent = user.phone || 'Not set';
    }

    // Set "member since" to today's date for demo
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    document.getElementById('profileSince').textContent = months[now.getMonth()] + ' ' + now.getFullYear();
