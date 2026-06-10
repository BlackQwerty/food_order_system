    // Hamburger menu toggle
    document.getElementById('hamburgerBtn').addEventListener('click', function() {
      document.getElementById('navLinks').classList.toggle('open');
    });

    /* -------------------------------------------------------
     * REGISTRATION FORM VALIDATION
     * Validates ALL fields before allowing submission.
     * Rules:
     *   - Name: cannot be empty
     *   - Email: must be valid format (contains @ and .)
     *   - Phone: only digits, at least 10 characters (Malaysian format)
     *   - Password: minimum 6 characters
     *   - Confirm password: must match password
     *   - Customer type: must select one
     *   - Terms: must be checked
     * ------------------------------------------------------- */
    document.getElementById('registerForm').addEventListener('submit', function(e) {
      e.preventDefault();  // Stop the form from submitting to server

      let isValid = true;

      // Helper function: show error or clear it
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
      const fullName = document.getElementById('fullName').value.trim();
      setError('fullName', 'fullNameError',
        fullName === '' ? 'Please enter your full name.' : '');

      // --- Email ---
      const email = document.getElementById('email').value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;  // Checks for @ and .
      if (email === '') {
        setError('email', 'emailError', 'Please enter your email address.');
      } else if (!emailRegex.test(email)) {
        setError('email', 'emailError', 'Please enter a valid email (e.g. ahmad@example.com).');
      } else {
        setError('email', 'emailError', '');
      }

      // --- Phone Number ---
      const phone = document.getElementById('phone').value.trim();
      const phoneDigits = phone.replace(/\D/g, '');  // Remove all non-digits
      if (phone === '') {
        setError('phone', 'phoneError', 'Please enter your phone number.');
      } else if (phoneDigits.length < 10) {
        setError('phone', 'phoneError', 'Phone number must have at least 10 digits (Malaysian format: 01X-XXXXXXX).');
      } else {
        setError('phone', 'phoneError', '');
      }

      // --- Password ---
      const password = document.getElementById('password').value;
      if (password === '') {
        setError('password', 'passwordError', 'Please enter a password.');
      } else if (password.length < 6) {
        setError('password', 'passwordError', 'Password must be at least 6 characters long.');
      } else {
        setError('password', 'passwordError', '');
      }

      // --- Confirm Password ---
      const confirmPassword = document.getElementById('confirmPassword').value;
      if (confirmPassword === '') {
        setError('confirmPassword', 'confirmPasswordError', 'Please confirm your password.');
      } else if (confirmPassword !== password) {
        setError('confirmPassword', 'confirmPasswordError', 'Passwords do not match.');
      } else {
        setError('confirmPassword', 'confirmPasswordError', '');
      }

      // --- Customer Type ---
      const customerType = document.querySelector('input[name="customerType"]:checked');
      const termsError = document.getElementById('customerTypeError');
      if (!customerType) {
        termsError.textContent = 'Please select a customer type.';
        isValid = false;
      } else {
        termsError.textContent = '';
      }

      // --- Terms Checkbox ---
      const agreeTerms = document.getElementById('agreeTerms');
      const termsErr = document.getElementById('termsError');
      if (!agreeTerms.checked) {
        termsErr.textContent = 'You must agree to the Terms & Conditions.';
        isValid = false;
      } else {
        termsErr.textContent = '';
      }

      // If everything is valid, simulate successful registration
      if (isValid) {
        // Save user info for demo (in a real app this would go to a server)
        const userData = {
          name: fullName,
          email: email,
          phone: phone,
          type: customerType.value
        };
        localStorage.setItem('flavoursUser', JSON.stringify(userData));
        alert('Registration successful! Redirecting to login page...');
        window.location.href = 'login.html';  // Go to login page
      }
    });
