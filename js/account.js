// js/account.js
// ============================================================
// ACCOUNT PAGE — Shows user info or login prompt
// ============================================================

(function () {
  function loadAccount() {
    fetch('/php_backend/api/get-session-user.php', { credentials: 'same-origin' })
      .then(r => r.json())
      .then(session => {
        const loggedInView  = document.getElementById('accountLoggedIn');
        const loggedOutView = document.getElementById('accountLoggedOut');

        if (session.logged_in && session.user) {
          // LOGGED IN — show profile
          if (loggedInView)  loggedInView.style.display  = '';
          if (loggedOutView) loggedOutView.style.display = 'none';

          const user = session.user;
          document.getElementById('accName').textContent  = user.name || 'User';
          document.getElementById('accEmail').textContent = user.email || 'Not set';
          document.getElementById('accPhone').textContent = user.phone || 'Not set';

          const roleEl = document.getElementById('accRole');
          if (roleEl) {
            const roleLabels = {
              'customer': 'Customer',
              'staff':    'Staff' + (user.position ? ' — ' + user.position : ''),
              'admin':    'Admin' + (user.admin_role ? ' — ' + user.admin_role : ''),
            };
            roleEl.textContent = 'Role: ' + (roleLabels[user.role] || user.role);
          }

          document.getElementById('accountTitle').innerHTML = '<i class="fa-solid fa-user"></i> My Account';
          document.getElementById('accountSubtitle').textContent = 'Welcome, ' + user.name.split(' ')[0] + '!';
        } else {
          // NOT LOGGED IN — show login prompt
          if (loggedInView)  loggedInView.style.display  = 'none';
          if (loggedOutView) loggedOutView.style.display = '';
          document.getElementById('accountTitle').innerHTML = '<i class="fa-solid fa-lock"></i> Account';
          document.getElementById('accountSubtitle').textContent = 'Sign in to access your account and orders.';
        }
      })
      .catch(() => {
        // Fallback: show login prompt
        document.getElementById('accountLoggedIn').style.display  = 'none';
        document.getElementById('accountLoggedOut').style.display = '';
      });
  }

  document.addEventListener('DOMContentLoaded', loadAccount);
})();
