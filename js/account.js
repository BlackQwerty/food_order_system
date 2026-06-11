// js/account.js
// ============================================================
// ACCOUNT PAGE — Shows user info or login prompt
// ============================================================

(function () {
  function loadAccount() {
    const session = window.__clickeatSession;

    if (!session) {
      setTimeout(loadAccount, 200);
      return;
    }

    const loggedInView  = document.getElementById('accountLoggedIn');
    const loggedOutView = document.getElementById('accountLoggedOut');
    const title         = document.getElementById('accountTitle');
    const subtitle      = document.getElementById('accountSubtitle');

    if (session.logged_in && session.user) {
      // === LOGGED IN ===
      if (loggedInView)  loggedInView.style.display  = '';
      if (loggedOutView) loggedOutView.style.display = 'none';

      const user = session.user;
      document.getElementById('accName').textContent  = user.name || 'User';
      document.getElementById('accEmail').textContent = user.email || 'Not set';
      document.getElementById('accPhone').textContent = user.phone || 'Not set';

      // Role display
      const roleEl = document.getElementById('accRole');
      if (roleEl) {
        const roleLabels = {
          'customer': 'Customer',
          'staff':    'Staff' + (user.position ? ' — ' + user.position : ''),
          'admin':    'Admin' + (user.admin_role ? ' — ' + user.admin_role : ''),
        };
        roleEl.textContent = 'Role: ' + (roleLabels[user.role] || user.role);
      }

      if (title)    title.innerHTML    = '<i class="fa-solid fa-user"></i> My Account';
      if (subtitle) subtitle.textContent = 'Welcome, ' + user.name.split(' ')[0] + '! Manage your profile here.';
    } else {
      // === NOT LOGGED IN ===
      if (loggedInView)  loggedInView.style.display  = 'none';
      if (loggedOutView) loggedOutView.style.display = '';
      if (title)    title.innerHTML    = '<i class="fa-solid fa-lock"></i> Account';
      if (subtitle) subtitle.textContent = 'Sign in to access your account and orders.';
    }
  }

  document.addEventListener('DOMContentLoaded', loadAccount);
})();
