// js/nav_bar.js
// Loads the navigation bar into every page.

document.addEventListener('DOMContentLoaded', () => {
  const placeholder = document.getElementById('navbar-placeholder');
  if (!placeholder) return;

  fetch('/nav_bar.html')
    .then(r => r.text())
    .then(html => {
      placeholder.innerHTML = html;
    });
});
