// js/register.js
// ============================================================
// REGISTRATION FORM — Client-side + displays PHP errors
// ============================================================

(function () {
  /**
   * Display flash errors from PHP session and refill form fields.
   */
  function handleFlash() {
    const session = window.__clickeatSession;
    if (!session || !session.flash) return;

    const flash = session.flash;
    if (flash.type !== 'register') return;  // Not for this page

    // Display server-side validation errors
    if (flash.errors) {
      Object.keys(flash.errors).forEach(function (key) {
        const el = document.getElementById(key + 'Error');
        const input = document.getElementById(key);
        if (el) {
          el.textContent = flash.errors[key];
        }
        if (input) {
          input.classList.add('error');
        }
      });
    }

    // Refill form with old values (so user doesn't lose their input)
    if (flash.old) {
      Object.keys(flash.old).forEach(function (key) {
        const el = document.getElementById(key);
        if (el && el.type !== 'password' && el.type !== 'radio' && el.type !== 'checkbox') {
          el.value = flash.old[key];
        }
      });
      // Handle radio (customerType)
      if (flash.old.customerType) {
        const radio = document.querySelector('input[name="customerType"][value="' + flash.old.customerType + '"]');
        if (radio) radio.checked = true;
      }
    }

    // Display success message (e.g., after redirect from login page)
    if (flash.success) {
      alert(flash.success);  // Simple alert — or replace with a toast
    }
  }

  // Check for flash messages
  function checkFlash() {
    if (window.__clickeatSession) {
      handleFlash();
    } else {
      setTimeout(checkFlash, 150);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registerForm');
    if (!form) return;

    let alreadySubmitted = false;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (alreadySubmitted) return;

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

      // --- Full Name ---
      var fullName = document.getElementById('fullName').value.trim();
      setError('fullName', 'fullNameError', fullName === '' ? 'Please enter your full name.' : '');

      // --- Email ---
      var email = document.getElementById('email').value.trim();
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email === '') {
        setError('email', 'emailError', 'Please enter your email address.');
      } else if (!emailRegex.test(email)) {
        setError('email', 'emailError', 'Please enter a valid email.');
      } else {
        setError('email', 'emailError', '');
      }

      // --- Phone ---
      var phone = document.getElementById('phone').value.trim();
      var phoneDigits = phone.replace(/\D/g, '');
      if (phone === '') {
        setError('phone', 'phoneError', 'Please enter your phone number.');
      } else if (phoneDigits.length < 10) {
        setError('phone', 'phoneError', 'Phone must have at least 10 digits.');
      } else {
        setError('phone', 'phoneError', '');
      }

      // --- Password ---
      var password = document.getElementById('password').value;
      if (password === '') {
        setError('password', 'passwordError', 'Please enter a password.');
      } else if (password.length < 6) {
        setError('password', 'passwordError', 'Password must be at least 6 characters.');
      } else {
        setError('password', 'passwordError', '');
      }

      // --- Confirm Password ---
      var confirmPassword = document.getElementById('confirmPassword').value;
      if (confirmPassword === '') {
        setError('confirmPassword', 'confirmPasswordError', 'Please confirm your password.');
      } else if (confirmPassword !== password) {
        setError('confirmPassword', 'confirmPasswordError', 'Passwords do not match.');
      } else {
        setError('confirmPassword', 'confirmPasswordError', '');
      }

      // --- Customer Type ---
      var customerType = document.querySelector('input[name="customerType"]:checked');
      var ctErr = document.getElementById('customerTypeError');
      if (!customerType) {
        ctErr.textContent = 'Please select a customer type.';
        isValid = false;
      } else {
        ctErr.textContent = '';
      }

      // --- Terms ---
      var agreeTerms = document.getElementById('agreeTerms');
      var termsErr = document.getElementById('termsError');
      if (!agreeTerms.checked) {
        termsErr.textContent = 'You must agree to the Terms & Conditions.';
        isValid = false;
      } else {
        termsErr.textContent = '';
      }

      if (isValid) {
        alreadySubmitted = true;
        form.submit();
      }
    });

    // After navbar loads and session is checked, handle flash messages
    checkFlash();
  });
})();
