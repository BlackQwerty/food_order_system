// js/index.js
// Home page — toggles welcome banner for logged-in users.

(function () {
  function load() {
    fetch('/php_backend/api/get-session-user.php', { credentials: 'same-origin' })
      .then(r => r.json())
      .then(session => {
        const welcomeBanner = document.getElementById('welcomeBanner');
        const ctaBanner     = document.getElementById('ctaBanner');
        const welcomeName   = document.getElementById('welcomeName');

        if (session.logged_in && session.user) {
          if (welcomeBanner) welcomeBanner.style.display = '';
          if (ctaBanner)     ctaBanner.style.display     = 'none';
          if (welcomeName)   welcomeName.textContent = session.user.name.split(' ')[0];
        } else {
          if (welcomeBanner) welcomeBanner.style.display = 'none';
          if (ctaBanner)     ctaBanner.style.display     = '';
        }
      });
  }

  document.addEventListener('DOMContentLoaded', load);
})();
