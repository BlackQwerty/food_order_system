// js/index.js
// ============================================================
// HOME PAGE LOGIC — Toggles CTA vs Welcome Banner
// ============================================================
// The navbar is loaded by nav_bar.js (runs on all pages).
// This script only handles the home page specific behavior:
//   - If logged in  → show "Welcome back, [Name]!" banner
//   - If not logged in → show "Hungry? Let's get started!" CTA

(function () {
  /**
   * Toggle between the CTA banner (new users) and Welcome banner (logged in).
   */
  function toggleHomeBanners() {
    // Check if nav_bar.js has already set the session data
    const session = window.__clickeatSession;

    if (!session) {
      // Session not ready yet — try again in 200ms
      setTimeout(toggleHomeBanners, 200);
      return;
    }

    const welcomeBanner = document.getElementById('welcomeBanner');
    const ctaBanner     = document.getElementById('ctaBanner');
    const welcomeName   = document.getElementById('welcomeName');

    if (session.logged_in && session.user) {
      // LOGGED IN → Show welcome banner, hide CTA
      if (welcomeBanner) welcomeBanner.style.display = '';
      if (ctaBanner)     ctaBanner.style.display     = 'none';
      if (welcomeName) {
        // Show just the first name
        welcomeName.textContent = session.user.name.split(' ')[0];
      }
    } else {
      // NOT LOGGED IN → Show CTA, hide welcome banner
      if (welcomeBanner) welcomeBanner.style.display = 'none';
      if (ctaBanner)     ctaBanner.style.display     = '';
    }
  }

  // Start polling for session data (nav_bar.js loads it asynchronously)
  document.addEventListener('DOMContentLoaded', function () {
    toggleHomeBanners();
  });
})();
