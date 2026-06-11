// js/login.js
// ============================================================
// LOGIN FORM — Client-side validation + displays PHP errors
// ============================================================

(function () {
  function handleFlash() {
    var session = window.__clickeatSession;
    if (!session || !session.flash) return;

    var flash = session.flash;
    if (flash.type !== 'login' && flash.type !== 'register') return;

    // Show server-side errors
    if (flash.errors) {
      // General error (wrong email/password)
      if (flash.errors.general) {
        alert(flash.errors.general);
      }
      // Field-specific errors
      Object.keys(flash.errors).forEach(function (key) {
        var el = document.getElementById(key + 'Error');
        var input = document.getElementById(key);
        if (el) el.textContent = flash.errors[key];
        if (input) input.classList.add('error');
      });
    }

    // Refill email
    if (flash.old && flash.old.email) {
      var emailEl = document.getElementById('email');
      if (emailEl) emailEl.value = flash.old.email;
    }

    // Show success (e.g., "Registration successful! Please login.")
    if (flash.success) {
      alert(flash.success);
    }
  }

  function checkFlash() {
    if (window.__clickeatSession) {
      handleFlash();
    } else {
      setTimeout(checkFlash, 150);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('loginForm');
    if (!form) return;

    var alreadySubmitted = false;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (alreadySubmitted) return;

      var isValid = true;

      // --- Email ---
      var email = document.getElementById('email').value.trim();
      var emailError = document.getElementById('emailError');
      var emailField = document.getElementById('email');
      if (email === '') {
        emailError.textContent = 'Please enter your email address.';
        emailField.classList.add('error');
        isValid = false;
      } else {
        emailError.textContent = '';
        emailField.classList.remove('error');
      }

      // --- Password ---
      var password = document.getElementById('password').value;
      var passwordError = document.getElementById('passwordError');
      var passwordField = document.getElementById('password');
      if (password === '') {
        passwordError.textContent = 'Please enter your password.';
        passwordField.classList.add('error');
        isValid = false;
      } else {
        passwordError.textContent = '';
        passwordField.classList.remove('error');
      }

      if (isValid) {
        alreadySubmitted = true;
        form.submit();
      }
    });

    checkFlash();
  });
})();
