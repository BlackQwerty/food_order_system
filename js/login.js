    // Hamburger menu toggle
    document.getElementById('hamburgerBtn').addEventListener('click', function() {
      document.getElementById('navLinks').classList.toggle('open');
    });

    /* -------------------------------------------------------
     * LOGIN FORM VALIDATION
     * Simple validation: both email and password must not be empty.
     * For demo purposes, if validation passes, user is redirected
     * to history.html (simulating successful login).
     * ------------------------------------------------------- */
    document.getElementById('loginForm').addEventListener('submit', function(e) {
      e.preventDefault();  // Stop form from submitting

      let isValid = true;

      // --- Email ---
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

      // --- Password ---
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

      // If valid, simulate login and redirect to dashboard
      if (isValid) {
        // For demo: set a flag in localStorage to remember login state
        localStorage.setItem('flavoursLoggedIn', 'true');
        alert('Login successful! Welcome back!');
        window.location.href = 'history.html';
      }
    });
