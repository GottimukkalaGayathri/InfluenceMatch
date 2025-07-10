/**
 * Components and common UI elements for the InfluConnect platform
 */
const Auth = {
  USER_KEY: 'currentUser',

  getCurrentUser: function () {
    return JSON.parse(localStorage.getItem(this.USER_KEY));
  },

  setCurrentUser: function (user) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  },

  isLoggedIn: function () {
    return !!localStorage.getItem(this.USER_KEY);
  },

  logout: function () {
    localStorage.removeItem(this.USER_KEY);
    window.location.href = 'login.html';
  }
};
const UIUtils = {
  showNotification: function (message, type = 'info') {
    alert(message); // Replace with toast system if needed
  },

  showModal: function (id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'block';
  },

  hideModal: function (id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
  }
};



document.addEventListener('DOMContentLoaded', () => {
  // Load header
  loadHeader();
  
  // Load footer
  loadFooter();
  
  // Setup event listeners
  setupEventListeners();
});

/**
 * Load header component
 */
function loadHeader() {
  const headerElement = document.getElementById('header');
  if (!headerElement) return;
  
  // Get current user data
  const currentUser = Auth.getCurrentUser();
  const isLoggedIn = Auth.isLoggedIn();
  
  // Create header HTML
  let headerHTML = `
    <div class="container">
      <nav class="navbar">
        <a href="index.html" class="logo">InfluConnect</a>
        <ul class="nav-menu">
          <li class="nav-item">
            <a href="index.html" class="nav-link">Home</a>
          </li>
          <li class="nav-item">
            <a href="campaigns.html" class="nav-link">Campaigns</a>
          </li>
  `;
  
  // Add user specific links based on auth status
  if (isLoggedIn) {
    // Add dashboard link based on role
    const dashboardLinks = {
      'admin': 'admin-dashboard.html',
      'influencer': 'influencer-dashboard.html',
      'brand': 'brand-dashboard.html'
    };
    
    const dashboardLink = dashboardLinks[currentUser.role] || '#';
    const dashboardText = `${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)} Dashboard`;
    
    headerHTML += `
          <li class="nav-item">
            <a href="${dashboardLink}" class="nav-link">${dashboardText}</a>
          </li>
          <li class="nav-item">
            <button class="nav-link logout-btn" id="logout-btn">Logout</button>
          </li>
    `;
  } else {
    headerHTML += `
          <li class="nav-item">
            <a href="login.html" class="nav-link">Login</a>
          </li>
          <li class="nav-item">
            <a href="signup.html" class="nav-link">Sign Up</a>
          </li>
    `;
  }
  
  // Add theme toggle and close header
  headerHTML += `
        </ul>
        <div class="theme-toggle" id="theme-toggle">
          <i class="fas fa-moon"></i>
        </div>
        <div class="hamburger" id="hamburger">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </nav>
    </div>
  `;
  
  // Set header content
  headerElement.innerHTML = headerHTML;
  
  // Add active class to current page link
  highlightCurrentPageLink();
  
  // Add logout event listener
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      Auth.logout();
    });
  }
}

/**
 * Load footer component
 */
function loadFooter() {
  const footerElement = document.getElementById('footer');
  if (!footerElement) return;
  
  // Create footer HTML
  const footerHTML = `
    <div class="container">
      <div class="footer-content">
        <div class="footer-column">
          <h4>InfluConnect</h4>
          <p>Connecting brands with influencers for meaningful collaborations that drive results.</p>
          <div class="social-links">
            <a href="#" class="social-link"><i class="fab fa-instagram"></i></a>
            <a href="#" class="social-link"><i class="fab fa-twitter"></i></a>
            <a href="#" class="social-link"><i class="fab fa-facebook"></i></a>
            <a href="#" class="social-link"><i class="fab fa-linkedin"></i></a>
          </div>
        </div>
        <div class="footer-column">
          <h4>Quick Links</h4>
          <ul class="footer-links">
            <li><a href="index.html">Home</a></li>
            <li><a href="campaigns.html">Campaigns</a></li>
            <li><a href="signup.html">Sign Up</a></li>
            <li><a href="login.html">Login</a></li>
          </ul>
        </div>
        <div class="footer-column">
          <h4>For Influencers</h4>
          <ul class="footer-links">
            <li><a href="#">How It Works</a></li>
            <li><a href="#">Success Stories</a></li>
            <li><a href="#">Pricing</a></li>
            <li><a href="#">Resources</a></li>
          </ul>
        </div>
        <div class="footer-column">
          <h4>For Brands</h4>
          <ul class="footer-links">
            <li><a href="#">Brand Solutions</a></li>
            <li><a href="#">Case Studies</a></li>
            <li><a href="#">Enterprise Plans</a></li>
            <li><a href="#">Request Demo</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p class="copyright">&copy; ${new Date().getFullYear()} InfluConnect. All rights reserved.</p>
        <div class="footer-links">
          <a href="#">Privacy Policy</a>
          <span> | </span>
          <a href="#">Terms of Service</a>
        </div>
      </div>
    </div>
  `;
  
  // Set footer content
  footerElement.innerHTML = footerHTML;
}

/**
 * Setup event listeners for components
 */
function setupEventListeners() {
  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  // Mobile menu toggle
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.querySelector('.nav-menu');
  
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      hamburger.classList.toggle('active');
    });
  }
  
  // Tab buttons
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Get parent element (tab container)
      const tabContainer = button.closest('.tabs') || button.closest('.tab-controls');
      if (!tabContainer) return;
      
      // Remove active class from all buttons in this container
      const buttons = tabContainer.querySelectorAll('.tab-btn');
      buttons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Get target element
      const targetId = button.getAttribute('data-target');
      if (!targetId) return;
      
      // Hide all target containers
      const containers = document.querySelectorAll(`.auth-form, .data-table, .campaigns-grid, .campaigns-container, .dashboard-section`);
      containers.forEach(container => {
        if (container.id) {
          container.classList.remove('active');
        }
      });
      
      // Show target container
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.classList.add('active');
      }
    });
  });
  
  // Sidebar navigation
  const sidebarNavItems = document.querySelectorAll('.sidebar-nav li');
  sidebarNavItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove active class from all items
      sidebarNavItems.forEach(navItem => navItem.classList.remove('active'));
      
      // Add active class to clicked item
      item.classList.add('active');
      
      // Get target section
      const targetId = item.getAttribute('data-target');
      if (!targetId) return;
      
      // Hide all dashboard sections
      const sections = document.querySelectorAll('.dashboard-section');
      sections.forEach(section => section.classList.remove('active'));
      
      // Show target section
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.classList.add('active');
      }
    });
  });
}

/**
 * Toggle dark/light theme
 */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  // Update theme attribute
  document.documentElement.setAttribute('data-theme', newTheme);
  
  // Update theme toggle icon
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    const icon = themeToggle.querySelector('i');
    if (icon) {
      icon.className = newTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
  }
  
  // Save theme preference
  localStorage.setItem('theme', newTheme);
}

/**
 * Highlight current page link in navigation
 */
function highlightCurrentPageLink() {
  const currentPage = window.location.pathname.split('/').pop();
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
  });
}