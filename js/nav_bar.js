// js/nav_bar.js
// ============================================================
// LOADS NAVBAR + CHECKS LOGIN STATE (runs on every page)
// ============================================================
// When logged in:  Account link shows "👋 Name", Logout button visible
// When logged out: Account link shows "Account", no Logout button

document.addEventListener('DOMContentLoaded', () => {
  const placeholder = document.getElementById('navbar-placeholder');
  if (!placeholder) return;

  fetch('/nav_bar.html')
    .then(r => r.text())
    .then(html => {
      placeholder.innerHTML = html;

      // Check session
      return fetch('/php_backend/api/get-session-user.php', {
        credentials: 'same-origin'
      });
    })
    .then(r => r.json())
    .then(data => {
      window.__clickeatSession = data;
      updateNav(data);
    })
    .catch(() => {
      // Fallback: assume not logged in
      window.__clickeatSession = { logged_in: false, user: null };
      updateNav({ logged_in: false, user: null });
    });

  function updateNav(data) {
    const navAccount = document.getElementById('navAccount');
    const navWelcome = document.getElementById('navWelcome');
    const navLogout  = document.getElementById('navLogout');

    if (data.logged_in && data.user) {
      // LOGGED IN → show name in Account link + show Logout
      if (navAccount) {
        const firstName = data.user.name.split(' ')[0];
        navAccount.querySelector('a').textContent = '👤 ' + firstName;
      }
      if (navLogout) navLogout.style.display = '';
    } else {
      // NOT LOGGED IN → plain "Account", hide Logout
      if (navAccount) {
        navAccount.querySelector('a').textContent = 'Account';
      }
      if (navLogout) navLogout.style.display = 'none';
    }
  }
});
