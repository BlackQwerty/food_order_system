// js/login.js
// Login form validation + displays PHP flash errors.

(function () {
  function checkFlash() {
    fetch('/php_backend/api/get-session-user.php', { credentials: 'same-origin' })
      .then(r => r.json())
      .then(session => {
        if (!session.flash) return;
        const flash = session.flash;
        if (flash.type !== 'login' && flash.type !== 'register') return;

        if (flash.errors) {
          if (flash.errors.general) alert(flash.errors.general);
          Object.keys(flash.errors).forEach(function (key) {
            const el = document.getElementById(key + 'Error');
            if (el) el.textContent = flash.errors[key];
            const input = document.getElementById(key);
            if (input) input.classList.add('error');
          });
        }
        if (flash.old && flash.old.email) {
          const emailEl = document.getElementById('email');
          if (emailEl) emailEl.value = flash.old.email;
        }
        if (flash.success) alert(flash.success);
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      let isValid = true;

      const email = document.getElementById('email').value.trim();
      const emailError = document.getElementById('emailError');
      const emailField = document.getElementById('email');
      if (email === '') {
        emailError.textContent = 'Please enter your email address.';
        emailField.classList.add('error');
        isValid = false;
      } else {
        emailError.textContent = '';
        emailField.classList.remove('error');
      }

      const password = document.getElementById('password').value;
      const passwordError = document.getElementById('passwordError');
      const passwordField = document.getElementById('password');
      if (password === '') {
        passwordError.textContent = 'Please enter your password.';
        passwordField.classList.add('error');
        isValid = false;
      } else {
        passwordError.textContent = '';
        passwordField.classList.remove('error');
      }

      if (!isValid) e.preventDefault();
    });

    checkFlash();
  });
})();
