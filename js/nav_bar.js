// nav_bar.js — Builds role-aware navbar after fetching session

document.addEventListener('DOMContentLoaded', function () {
  var placeholder = document.getElementById('navbar-placeholder');
  if (!placeholder) return;

  // Pages only customers/guests should access — staff get redirected away
  var CUSTOMER_ONLY_PAGES = [
    'index.html', 'order.html', 'tracking.html', 'history.html', 'account.html'
  ];

  var currentPage = window.location.pathname.split('/').pop() || 'index.html';

  fetch('/php_backend/api/get-session-user.php', { credentials: 'same-origin' })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var role = (data.logged_in && data.user) ? data.user.role : 'guest';

      // Staff and admin should not access customer-facing pages
      if ((role === 'staff' || role === 'admin') && CUSTOMER_ONLY_PAGES.indexOf(currentPage) !== -1) {
        window.location.href = role === 'admin' ? '/admin.html' : '/dashboard.html';
        return;
      }

      placeholder.innerHTML = buildNav(role);
      setupHamburger();
      highlightActive();
    })
    .catch(function () {
      placeholder.innerHTML = buildNav('guest');
      setupHamburger();
      highlightActive();
    });

  function buildNav(role) {
    var links = '';
    var rightBtn = '';

    if (role === 'staff') {
      links =
        '<li><a href="waiter.html"><i class="fa-solid fa-pen-to-square"></i> Take Order</a></li>' +
        '<li><a href="dashboard.html"><i class="fa-solid fa-list-check"></i> Manage Orders</a></li>';
      rightBtn = '<a href="/php_backend/logout.php" class="login-btn"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>';

    } else if (role === 'admin') {
      links =
        '<li><a href="admin.html"><i class="fa-solid fa-shield-halved"></i> Admin Panel</a></li>' +
        '<li><a href="dashboard.html"><i class="fa-solid fa-list-check"></i> Orders</a></li>';
      rightBtn = '<a href="/php_backend/logout.php" class="login-btn"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>';

    } else if (role === 'customer') {
      links =
        '<li><a href="menu.html"><i class="fa-solid fa-utensils"></i> Menu</a></li>' +
        '<li><a href="order.html"><i class="fa-solid fa-cart-shopping"></i> Order</a></li>' +
        '<li><a href="tracking.html"><i class="fa-solid fa-map-pin"></i> Track</a></li>' +
        '<li><a href="history.html"><i class="fa-solid fa-clock-rotate-left"></i> Dashboard</a></li>' +
        '<li><a href="account.html"><i class="fa-solid fa-circle-user"></i> Account</a></li>';
      rightBtn = '<a href="/php_backend/logout.php" class="login-btn"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>';

    } else {
      links =
        '<li><a href="menu.html"><i class="fa-solid fa-utensils"></i> Menu</a></li>' +
        '<li><a href="order.html"><i class="fa-solid fa-cart-shopping"></i> Order</a></li>' +
        '<li><a href="tracking.html"><i class="fa-solid fa-map-pin"></i> Track</a></li>';
      rightBtn = '<a href="login.html" class="login-btn">Login</a>';
    }

    return '<nav class="navbar">' +
      '<div class="container">' +
        '<a href="index.html" class="brand" aria-label="Home"><i class="fa-solid fa-house"></i></a>' +
        '<ul class="nav-links" id="navLinks">' + links + '</ul>' +
        '<button class="hamburger" id="hamburgerBtn" aria-label="Menu"><i class="fa-solid fa-bars"></i></button>' +
        rightBtn +
      '</div>' +
    '</nav>';
  }

  function setupHamburger() {
    var btn   = document.getElementById('hamburgerBtn');
    var links = document.getElementById('navLinks');
    if (btn && links) {
      btn.addEventListener('click', function () {
        links.classList.toggle('open');
      });
    }
  }

  function highlightActive() {
    var page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      if (a.getAttribute('href') === page) a.classList.add('active');
    });
  }
});
