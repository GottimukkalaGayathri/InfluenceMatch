/**
 * Utility functions for the InfluConnect platform
 */

/**
 * Storage helper for working with localStorage
 */
const Storage = {
  /**
   * Save data to localStorage
   * @param {string} key - The key to store the data under
   * @param {any} data - The data to store
   */
  set: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },
  
  /**
   * Get data from localStorage
   * @param {string} key - The key to retrieve data from
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {any} The stored data or the default value
   */
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },
  
  /**
   * Remove data from localStorage
   * @param {string} key - The key to remove
   */
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
  
  /**
   * Clear all app data from localStorage
   */
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

/**
 * Authentication helper
 */
const Auth = {
  /**
   * Keys for localStorage
   */
  USER_KEY: 'influconnect_user',
  TOKEN_KEY: 'influconnect_token',
  REMEMBER_KEY: 'influconnect_remember',
  
  /**
   * Check if user is logged in
   * @returns {boolean} True if user is logged in
   */
  isLoggedIn: () => {
    return !!Storage.get(Auth.USER_KEY);
  },
  
  /**
   * Get current user data
   * @returns {Object|null} User data or null if not logged in
   */
  getCurrentUser: () => {
    return Storage.get(Auth.USER_KEY);
  },
  
  /**
   * Get user role (admin, influencer, brand)
   * @returns {string|null} User role or null if not logged in
   */
  getUserRole: () => {
    const user = Auth.getCurrentUser();
    return user ? user.role : null;
  },
  
  /**
   * Login user
   * @param {Object} userData - User data to store
   * @param {boolean} remember - Whether to remember the user
   */
  login: (userData, remember = false) => {
    Storage.set(Auth.USER_KEY, userData);
    Storage.set(Auth.REMEMBER_KEY, remember);
    
    // Redirect based on role
    const redirectMap = {
      'admin': 'admin-dashboard.html',
      'influencer': 'influencer-dashboard.html',
      'brand': 'brand-dashboard.html'
    };
    
    window.location.href = redirectMap[userData.role] || 'index.html';
  },
  
  /**
   * Logout user
   */
  logout: () => {
    Storage.remove(Auth.USER_KEY);
    Storage.remove(Auth.TOKEN_KEY);
    Storage.remove(Auth.REMEMBER_KEY);
    window.location.href = 'index.html';
  },
  
  /**
   * Check if user should be redirected based on auth status
   * Redirects to login if not authenticated and trying to access protected pages
   * Redirects to dashboard if authenticated and trying to access auth pages
   */
  checkAuthRedirect: () => {
    const currentPath = window.location.pathname.split('/').pop();
    const isAuthPage = currentPath.includes('login.html') || currentPath.includes('signup.html');
    const isDashboardPage = 
      currentPath.includes('admin-dashboard.html') || 
      currentPath.includes('influencer-dashboard.html') || 
      currentPath.includes('brand-dashboard.html');
    
    if (Auth.isLoggedIn()) {
      // If logged in but on auth page, redirect to appropriate dashboard
      if (isAuthPage) {
        const role = Auth.getUserRole();
        if (role) {
          const redirectMap = {
            'admin': 'admin-dashboard.html',
            'influencer': 'influencer-dashboard.html',
            'brand': 'brand-dashboard.html'
          };
          window.location.href = redirectMap[role] || 'index.html';
        }
      }
    } else {
      // If not logged in but trying to access dashboard, redirect to login
      if (isDashboardPage) {
        window.location.href = 'login.html';
      }
    }
  }
};

/**
 * Form utilities
 */
const FormUtils = {
  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} True if email is valid
   */
  validateEmail: (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  },
  
  /**
   * Show form error
   * @param {HTMLElement} element - Form element with error
   * @param {string} message - Error message
   */
  showError: (element, message) => {
    // Remove any existing error
    FormUtils.clearError(element);
    
    // Add error class to input
    element.classList.add('error');
    
    // Create and insert error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;
    element.parentNode.insertBefore(errorMessage, element.nextSibling);
  },
  
  /**
   * Clear form error
   * @param {HTMLElement} element - Form element to clear error from
   */
  clearError: (element) => {
    // Remove error class
    element.classList.remove('error');
    
    // Remove error message if exists
    const errorMessage = element.parentNode.querySelector('.error-message');
    if (errorMessage) {
      errorMessage.remove();
    }
  },
  
  /**
   * Clear all errors in a form
   * @param {HTMLFormElement} form - Form to clear errors from
   */
  clearAllErrors: (form) => {
    // Remove all error classes
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    
    // Remove all error messages
    form.querySelectorAll('.error-message').forEach(el => el.remove());
  },
  
  /**
   * Get form data as object
   * @param {HTMLFormElement} form - Form to get data from
   * @returns {Object} Form data as object
   */
  getFormData: (form) => {
    const formData = new FormData(form);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    return data;
  }
};

/**
 * Format utilities
 */
const FormatUtils = {
  /**
   * Format number with commas
   * @param {number} num - Number to format
   * @returns {string} Formatted number
   */
  numberWithCommas: (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },
  
  /**
   * Format follower count (e.g., 1.2K, 3.5M)
   * @param {number} num - Number to format
   * @returns {string} Formatted follower count
   */
  formatFollowerCount: (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    } else {
      return num.toString();
    }
  },
  
  /**
   * Format date string
   * @param {string|Date} dateString - Date to format
   * @param {boolean} includeTime - Whether to include time
   * @returns {string} Formatted date
   */
  formatDate: (dateString, includeTime = false) => {
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    
    return date.toLocaleDateString('en-US', options);
  }
};

/**
 * UI utilities
 */
const UIUtils = {
  /**
   * Show notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success, error, info)
   * @param {number} duration - Duration in ms
   */
  showNotification: (message, type = 'info', duration = 3000) => {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.notification');
    
    if (!notification) {
      notification = document.createElement('div');
      notification.className = 'notification';
      document.body.appendChild(notification);
    }
    
    // Set notification content and type
    notification.textContent = message;
    notification.className = `notification notification-${type} show`;
    
    // Hide notification after duration
    setTimeout(() => {
      notification.className = 'notification';
    }, duration);
  },
  
  /**
   * Show modal
   * @param {string} modalId - ID of modal to show
   */
  showModal: (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'block';
      document.body.classList.add('modal-open');
    }
  },
  
  /**
   * Hide modal
   * @param {string} modalId - ID of modal to hide
   */
  hideModal: (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
    }
  },
  
  /**
   * Toggle sidebar on mobile
   */
  toggleSidebar: () => {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.toggle('active');
    }
  }
};

// Export utilities to global scope
window.Storage = Storage;
window.Auth = Auth;
window.FormUtils = FormUtils;
window.FormatUtils = FormatUtils;
window.UIUtils = UIUtils;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
  Auth.checkAuthRedirect();
});