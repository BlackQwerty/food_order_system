// js/dashboard.js
// ============================================================
// MEMBER DASHBOARD — Loads user profile from PHP session
// ============================================================

(function () {
  /**
   * Fetch user data from PHP session and populate the profile card.
   */
  function loadDashboardData() {
    const session = window.__clickeatSession;

    if (!session) {
      // Session not ready yet — try again
      setTimeout(loadDashboardData, 200);
      return;
    }

    if (!session.logged_in || !session.user) {
      // Not logged in — redirect to login
      window.location.href = 'login.html';
      return;
    }

    const user = session.user;

    // Populate profile card
    const elName  = document.getElementById('profileName');
    const elEmail = document.getElementById('profileEmail');
    const elPhone = document.getElementById('profilePhone');
    const elSince = document.getElementById('profileSince');

    if (elName)  elName.textContent  = user.name || 'Guest User';
    if (elEmail) elEmail.textContent = user.email || 'Not set';
    if (elPhone) elPhone.textContent = user.phone || 'Not set';

    // Page header welcome
    const headerName = document.getElementById('dashboardWelcomeName');
    if (headerName) headerName.textContent = user.name.split(' ')[0];

    // "Member since" — we'll show today's date as placeholder
    // (The actual registration_date requires a DB query, which we can add later)
    if (elSince) {
      const now = new Date();
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      elSince.textContent = months[now.getMonth()] + ' ' + now.getFullYear();
    }
  }

  // Start loading when DOM is ready
  document.addEventListener('DOMContentLoaded', loadDashboardData);
})();
