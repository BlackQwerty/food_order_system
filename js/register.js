// js/register.js
// Registration form validation + displays PHP flash errors.

(function () {
  function checkFlash() {
    fetch('/php_backend/api/get-session-user.php', { credentials: 'same-origin' })
      .then(r => r.json())
      .then(session => {
        if (!session.flash) return;
        const flash = session.flash;
        if (flash.type !== 'register') return;

        if (flash.errors) {
          Object.keys(flash.errors).forEach(function (key) {
            const el = document.getElementById(key + 'Error');
            if (el) el.textContent = flash.errors[key];
            const input = document.getElementById(key);
            if (input) input.classList.add('error');
          });
        }
        if (flash.old) {
          Object.keys(flash.old).forEach(function (key) {
            const el = document.getElementById(key);
            if (el && el.type !== 'password' && el.type !== 'radio' && el.type !== 'checkbox') {
              el.value = flash.old[key];
            }
          });
          if (flash.old.customerType) {
            const radio = document.querySelector('input[name="customerType"][value="' + flash.old.customerType + '"]');
            if (radio) radio.checked = true;
          }
        }
        if (flash.success) alert(flash.success);
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      let isValid = true;

      function setError(fieldId, errorId, message) {
        const field = document.getElementById(fieldId);
        const error = document.getElementById(errorId);
        if (message) {
          error.textContent = message;
          field.classList.add('error');
          isValid = false;
        } else {
          error.textContent = '';
          field.classList.remove('error');
        }
      }

      const fullName = document.getElementById('fullName').value.trim();
      setError('fullName', 'fullNameError', fullName === '' ? 'Please enter your full name.' : '');

      const email = document.getElementById('email').value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email === '') {
        setError('email', 'emailError', 'Please enter your email address.');
      } else if (!emailRegex.test(email)) {
        setError('email', 'emailError', 'Please enter a valid email.');
      } else {
        setError('email', 'emailError', '');
      }

      const phone = document.getElementById('phone').value.trim();
      if (phone === '') {
        setError('phone', 'phoneError', 'Please enter your phone number.');
      } else if (phone.replace(/\D/g, '').length < 10) {
        setError('phone', 'phoneError', 'Phone must have at least 10 digits.');
      } else {
        setError('phone', 'phoneError', '');
      }

      const password = document.getElementById('password').value;
      if (password === '') {
        setError('password', 'passwordError', 'Please enter a password.');
      } else if (password.length < 6) {
        setError('password', 'passwordError', 'Password must be at least 6 characters.');
      } else {
        setError('password', 'passwordError', '');
      }

      const confirmPassword = document.getElementById('confirmPassword').value;
      if (confirmPassword === '') {
        setError('confirmPassword', 'confirmPasswordError', 'Please confirm your password.');
      } else if (confirmPassword !== password) {
        setError('confirmPassword', 'confirmPasswordError', 'Passwords do not match.');
      } else {
        setError('confirmPassword', 'confirmPasswordError', '');
      }

      const customerType = document.querySelector('input[name="customerType"]:checked');
      if (!customerType) {
        document.getElementById('customerTypeError').textContent = 'Please select a customer type.';
        isValid = false;
      } else {
        document.getElementById('customerTypeError').textContent = '';
      }

      if (!document.getElementById('agreeTerms').checked) {
        document.getElementById('termsError').textContent = 'You must agree to the Terms & Conditions.';
        isValid = false;
      } else {
        document.getElementById('termsError').textContent = '';
      }

      if (!isValid) e.preventDefault();
    });

    checkFlash();
  });
})();
