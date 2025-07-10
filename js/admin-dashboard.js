/**
 * Admin dashboard functionality for the InfluConnect platform
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check user role and redirect if not admin
  const currentUser = Auth.getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    window.location.href = 'login.html';
    return;
  }
  
  // Load dashboard data
  loadDashboardData();
  
  // Initialize charts
  initCharts();
  
  // Setup event listeners
  setupEventListeners();
});

/**
 * Load dashboard data
 */
function loadDashboardData() {
  // Load brand requests
  loadBrandRequests();
  
  // Load user management tables
  loadInfluencerTable();
  loadBrandsTable();
  
  // Load campaigns
  loadCampaignsTable();
}

/**
 * Load brand requests into table
 */
function loadBrandRequests() {
  const requestsTable = document.getElementById('brand-requests-table');
  if (!requestsTable) return;
  
  // Get brand requests from storage
  const brandRequests = Storage.get('brandRequests', []);
  
  if (brandRequests.length === 0) {
    requestsTable.innerHTML = `
      <tr>
        <td colspan="5" class="text-center">No brand access requests found</td>
      </tr>
    `;
    return;
  }
  
  // Sort by creation date (newest first)
  brandRequests.sort((a, b) => new Date(b.created) - new Date(a.created));
  
  // Generate table rows
  let tableHTML = '';
  
  brandRequests.forEach(request => {
    const requestDate = FormatUtils.formatDate(request.created);
    
    tableHTML += `
      <tr data-id="${request.id}">
        <td>${request.name}</td>
        <td>${request.email}</td>
        <td><a href="${request.website}" target="_blank">${request.website}</a></td>
        <td>${requestDate}</td>
        <td class="status-cell">
          ${request.status === 'pending' ? `
            <button class="btn btn-primary btn-sm approve-request-btn">Approve</button>
            <button class="btn btn-danger btn-sm reject-request-btn">Reject</button>
          ` : `
            <span class="badge ${request.status === 'approved' ? 'badge-success' : 'badge-danger'}">
              ${request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </span>
          `}
        </td>
      </tr>
    `;
  });
  
  requestsTable.innerHTML = tableHTML;
}

/**
 * Load influencers into table
 */
function loadInfluencerTable() {
  const influencersTable = document.getElementById('influencers-table-body');
  if (!influencersTable) return;
  
  // Get users from storage
  const users = Storage.get('users', []);
  
  // Filter influencers
  const influencers = users.filter(user => user.role === 'influencer');
  
  if (influencers.length === 0) {
    influencersTable.innerHTML = `
      <tr>
        <td colspan="5" class="text-center">No influencers found</td>
      </tr>
    `;
    return;
  }
  
  // Generate table rows
  let tableHTML = '';
  
  influencers.forEach(influencer => {
    // Generate social platforms HTML
    let socialPlatformsHTML = '';
    
    if (influencer.socialMedia) {
      if (influencer.socialMedia.instagram) {
        socialPlatformsHTML += `
          <div class="platform-icon platform-icon-instagram" title="Instagram: ${influencer.socialMedia.instagram.handle}">
            <i class="fab fa-instagram"></i>
          </div>
        `;
      }
      
      if (influencer.socialMedia.facebook) {
        socialPlatformsHTML += `
          <div class="platform-icon platform-icon-facebook" title="Facebook: ${influencer.socialMedia.facebook.handle}">
            <i class="fab fa-facebook-f"></i>
          </div>
        `;
      }
      
      if (influencer.socialMedia.twitter) {
        socialPlatformsHTML += `
          <div class="platform-icon platform-icon-twitter" title="Twitter: ${influencer.socialMedia.twitter.handle}">
            <i class="fab fa-twitter"></i>
          </div>
        `;
      }
      
      if (influencer.socialMedia.youtube) {
        socialPlatformsHTML += `
          <div class="platform-icon platform-icon-youtube" title="YouTube: ${influencer.socialMedia.youtube.handle}">
            <i class="fab fa-youtube"></i>
          </div>
        `;
      }
    }
    
    if (!socialPlatformsHTML) {
      socialPlatformsHTML = '<span class="text-muted">No platforms</span>';
    }
    
    tableHTML += `
      <tr data-id="${influencer.id}">
        <td>${influencer.name}</td>
        <td>${influencer.email}</td>
        <td>
          <div class="social-platforms">
            ${socialPlatformsHTML}
          </div>
        </td>
        <td>
          <span class="user-status status-active">
            <span class="status-dot"></span>
            Active
          </span>
        </td>
        <td>
          <button class="action-btn action-btn-view" title="View Profile">
            <i class="fas fa-eye"></i>
          </button>
          <button class="action-btn action-btn-edit" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn action-btn-delete" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });
  
  influencersTable.innerHTML = tableHTML;
}

/**
 * Load brands into table
 */
function loadBrandsTable() {
  const brandsTable = document.getElementById('brands-table-body');
  if (!brandsTable) return;
  
  // Get users from storage
  const users = Storage.get('users', []);
  
  // Filter brands
  const brands = users.filter(user => user.role === 'brand');
  
  if (brands.length === 0) {
    brandsTable.innerHTML = `
      <tr>
        <td colspan="5" class="text-center">No brands found</td>
      </tr>
    `;
    return;
  }
  
  // Generate table rows
  let tableHTML = '';
  
  brands.forEach(brand => {
    tableHTML += `
      <tr data-id="${brand.id}">
        <td>${brand.name}</td>
        <td>${brand.email}</td>
        <td>${brand.website || 'N/A'}</td>
        <td>
          <span class="user-status status-active">
            <span class="status-dot"></span>
            Active
          </span>
        </td>
        <td>
          <button class="action-btn action-btn-view" title="View Profile">
            <i class="fas fa-eye"></i>
          </button>
          <button class="action-btn action-btn-edit" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn action-btn-delete" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });
  
  brandsTable.innerHTML = tableHTML;
}

/**
 * Load campaigns into table
 */
function loadCampaignsTable() {
  const campaignsTable = document.getElementById('campaigns-table-body');
  if (!campaignsTable) return;
  
  // Get campaigns from storage
  const campaigns = Storage.get('campaigns', []);
  
  if (campaigns.length === 0) {
    campaignsTable.innerHTML = `
      <tr>
        <td colspan="6" class="text-center">No campaigns found</td>
      </tr>
    `;
    return;
  }
  
  // Get users for brand names
  const users = Storage.get('users', []);
  
  // Generate table rows
  let tableHTML = '';
  
  campaigns.forEach(campaign => {
    // Find brand
    const brand = users.find(user => user.id === campaign.brandId);
    const brandName = brand ? brand.name : 'Unknown Brand';
    
    // Get status badge class
    let statusClass = '';
    switch (campaign.status) {
      case 'active':
        statusClass = 'badge-success';
        break;
      case 'draft':
        statusClass = 'badge-info';
        break;
      case 'completed':
        statusClass = 'badge-info';
        break;
      default:
        statusClass = 'badge-info';
    }
    
    tableHTML += `
      <tr data-id="${campaign.id}">
        <td>
          <div>
            <div class="campaign-name">${campaign.title}</div>
            <div class="campaign-brand">${brandName}</div>
          </div>
        </td>
        <td>${brandName}</td>
        <td>${campaign.platform.charAt(0).toUpperCase() + campaign.platform.slice(1)}</td>
        <td>
          <span class="badge ${statusClass}">
            ${campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
          </span>
        </td>
        <td>
          <a href="#" class="applicants-count">
            <span>${campaign.applicants ? campaign.applicants.length : 0}</span>
            <i class="fas fa-chevron-right"></i>
          </a>
        </td>
        <td>
          <button class="action-btn action-btn-view" title="View Details">
            <i class="fas fa-eye"></i>
          </button>
          <button class="action-btn action-btn-edit" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn action-btn-delete" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });
  
  campaignsTable.innerHTML = tableHTML;
}

/**
 * Initialize dashboard charts
 */
function initCharts() {
  // User Growth Chart
  const userGrowthCtx = document.getElementById('userGrowthChart');
  if (userGrowthCtx) {
    new Chart(userGrowthCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
        datasets: [
          {
            label: 'Influencers',
            data: [50, 85, 120, 180, 250, 310, 350, 420, 480],
            borderColor: '#1967ff',
            backgroundColor: 'rgba(25, 103, 255, 0.1)',
            tension: 0.3,
            fill: true
          },
          {
            label: 'Brands',
            data: [20, 45, 75, 110, 145, 180, 210, 250, 290],
            borderColor: '#00b9ff',
            backgroundColor: 'rgba(0, 185, 255, 0.1)',
            tension: 0.3,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  
  // Campaign Stats Chart
  const campaignStatsCtx = document.getElementById('campaignStatsChart');
  if (campaignStatsCtx) {
    new Chart(campaignStatsCtx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
        datasets: [
          {
            label: 'Active Campaigns',
            data: [12, 18, 23, 29, 34, 42, 48, 52, 60],
            backgroundColor: 'rgba(25, 103, 255, 0.8)',
          },
          {
            label: 'Completed Campaigns',
            data: [8, 12, 18, 22, 28, 32, 38, 42, 48],
            backgroundColor: 'rgba(0, 185, 255, 0.8)',
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}

/**
 * Setup event listeners for admin dashboard
 */
function setupEventListeners() {
  // Brand request approvals
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('approve-request-btn')) {
      handleBrandApproval(e.target);
    } else if (e.target.classList.contains('reject-request-btn')) {
      handleBrandRejection(e.target);
    }
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

  // Tab controls for user management
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const container = button.closest('.tab-controls');
      if (!container) return;

      // Remove active class from all buttons
      container.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
      });

      // Add active class to clicked button
      button.classList.add('active');

      // Get target table
      const targetId = button.getAttribute('data-target');
      if (!targetId) return;

      // Hide all tables
      document.querySelectorAll('.data-table').forEach(table => {
        table.classList.remove('active');
      });

      // Show target table
      const targetTable = document.getElementById(targetId);
      if (targetTable) {
        targetTable.classList.add('active');
      }
    });
  });

  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      Auth.logout();
    });
  }
}

/**
 * Handle brand approval
 * @param {HTMLElement} button - Approve button
 */
function handleBrandApproval(button) {
  const row = button.closest('tr');
  const requestId = row.getAttribute('data-id');
  
  // Get brand requests
  const brandRequests = Storage.get('brandRequests', []);
  
  // Find the request
  const requestIndex = brandRequests.findIndex(req => req.id === requestId);
  
  if (requestIndex === -1) {
    UIUtils.showNotification('Brand request not found', 'error');
    return;
  }
  
  const request = brandRequests[requestIndex];
  
  // Update request status
  request.status = 'approved';
  brandRequests[requestIndex] = request;
  Storage.set('brandRequests', brandRequests);
  
  // Create brand user account
  const user = {
    id: Date.now().toString(),
    name: request.name,
    email: request.email,
    website: request.website,
    role: 'brand',
    created: new Date().toISOString()
  };
  
  // Add to users
  const users = Storage.get('users', []);
  users.push(user);
  Storage.set('users', users);
  
  // Update UI
  row.querySelector('.status-cell').innerHTML = `
    <span class="badge badge-success">Approved</span>
  `;
  
  UIUtils.showNotification('Brand approved successfully', 'success');
}

/**
 * Handle brand rejection
 * @param {HTMLElement} button - Reject button
 */
function handleBrandRejection(button) {
  const row = button.closest('tr');
  const requestId = row.getAttribute('data-id');
  
  // Get brand requests
  const brandRequests = Storage.get('brandRequests', []);
  
  // Find the request
  const requestIndex = brandRequests.findIndex(req => req.id === requestId);
  
  if (requestIndex === -1) {
    UIUtils.showNotification('Brand request not found', 'error');
    return;
  }
  
  // Update request status
  brandRequests[requestIndex].status = 'rejected';
  Storage.set('brandRequests', brandRequests);
  
  // Update UI
  row.querySelector('.status-cell').innerHTML = `
    <span class="badge badge-danger">Rejected</span>
  `;
  
  UIUtils.showNotification('Brand request rejected', 'info');
}