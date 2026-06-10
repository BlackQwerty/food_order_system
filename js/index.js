function loadNavbar() {
  const placeholder = document.getElementById('navbar-placeholder');
  
  if (placeholder) {
    fetch('nav_bar.html')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(data => {
        // 1. Insert the navbar HTML into the page
        placeholder.innerHTML = data;
        
        // 2. NOW that the navbar is safely in the HTML, 
        // we can attach the click event listener to the hamburger button!
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const navLinks = document.getElementById('navLinks');

        // Optional check to make sure the elements exist before adding listeners
        if (hamburgerBtn && navLinks) {
          hamburgerBtn.addEventListener('click', function () {
            navLinks.classList.toggle('open');
          });
        }
      })
      .catch(error => console.error('Error loading the navbar:', error));
  }
}

// Run the function as soon as the webpage finishes loading
document.addEventListener('DOMContentLoaded', loadNavbar);