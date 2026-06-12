// js/dashboard.js
// Loads user profile from PHP session.

(function () {
  function load() {
    fetch('/php_backend/api/get-session-user.php', { credentials: 'same-origin' })
      .then(r => r.json())
      .then(session => {
        if (!session.logged_in || !session.user) {
          window.location.href = '/login.html';
          return;
        }
        const user = session.user;
        document.getElementById('profileName').textContent  = user.name || 'Guest';
        document.getElementById('profileEmail').textContent = user.email || '';
        document.getElementById('profilePhone').textContent = user.phone || '';
        document.getElementById('dashboardWelcomeName').textContent = user.name.split(' ')[0];

        const now = new Date();
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        document.getElementById('profileSince').textContent = months[now.getMonth()] + ' ' + now.getFullYear();
      })
      .catch(() => {
        window.location.href = '/login.html';
      });
  }

  document.addEventListener('DOMContentLoaded', load);
})();
