// js/global.js
document.addEventListener('DOMContentLoaded', () => {
  const placeholder = document.getElementById('navbar-placeholder');
  if (placeholder) {
    fetch('nav_bar.html')
      .then(response => response.text())
      .then(data => {
        placeholder.innerHTML = data;
        
        // Handle the mobile hamburger menu globally
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const navLinks = document.getElementById('navLinks');
        if (hamburgerBtn && navLinks) {
          hamburgerBtn.addEventListener('click', () => {
            navLinks.classList.toggle('open');
          });
        }
      });
  }
});