/**
 * Influencer dashboard functionality for the InfluConnect platform
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check user role and redirect if not influencer
  const currentUser = Auth.getCurrentUser();
  if (!currentUser || currentUser.role !== 'influencer') {
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
  // Load profile data
  loadProfileData();
  
  // Load campaign invites
  loadCampaignInvites();
  
  // Load user campaigns
  loadUserCampaigns();
}

/**
 * Load profile data
 */
function loadProfileData() {
  const currentUser = Auth.getCurrentUser();
  if (!currentUser) return;
  
  // Set name and email
  const nameElement = document.getElementById('profile-name');
  const emailElement = document.getElementById('profile-email');
  
  if (nameElement) nameElement.textContent = currentUser.name;
  if (emailElement) emailElement.textContent = currentUser.email;
  
  // Set social media values
  if (currentUser.socialMedia) {
    // Instagram
    const instagramInput = document.getElementById('instagram');
    const instagramFollowersInput = document.getElementById('instagram-followers');
    
    if (instagramInput && currentUser.socialMedia.instagram) {
      instagramInput.value = currentUser.socialMedia.instagram.handle;
    }
    
    if (instagramFollowersInput && currentUser.socialMedia.instagram) {
      instagramFollowersInput.value = currentUser.socialMedia.instagram.followers;
    }
    
    // Facebook
    const facebookInput = document.getElementById('facebook');
    const facebookFollowersInput = document.getElementById('facebook-followers');
    
    if (facebookInput && currentUser.socialMedia.facebook) {
      facebookInput.value = currentUser.socialMedia.facebook.handle;
    }
    
    if (facebookFollowersInput && currentUser.socialMedia.facebook) {
      facebookFollowersInput.value = currentUser.socialMedia.facebook.followers;
    }
    
    // Twitter
    const twitterInput = document.getElementById('twitter');
    const twitterFollowersInput = document.getElementById('twitter-followers');
    
    if (twitterInput && currentUser.socialMedia.twitter) {
      twitterInput.value = currentUser.socialMedia.twitter.handle;
    }
    
    if (twitterFollowersInput && currentUser.socialMedia.twitter) {
      twitterFollowersInput.value = currentUser.socialMedia.twitter.followers;
    }
    
    // YouTube
    const youtubeInput = document.getElementById('youtube');
    const youtubeFollowersInput = document.getElementById('youtube-followers');
    
    if (youtubeInput && currentUser.socialMedia.youtube) {
      youtubeInput.value = currentUser.socialMedia.youtube.handle;
    }
    
    if (youtubeFollowersInput && currentUser.socialMedia.youtube) {
      youtubeFollowersInput.value = currentUser.socialMedia.youtube.followers;
    }
    
    // LinkedIn
    const linkedinInput = document.getElementById('linkedin');
    const linkedinFollowersInput = document.getElementById('linkedin-followers');
    
    if (linkedinInput && currentUser.socialMedia.linkedin) {
      linkedinInput.value = currentUser.socialMedia.linkedin.handle;
    }
    
    if (linkedinFollowersInput && currentUser.socialMedia.linkedin) {
      linkedinFollowersInput.value = currentUser.socialMedia.linkedin.followers;
    }
  }
}

/**
 * Load campaign invites
 */
function loadCampaignInvites() {
  const invitesContainer = document.getElementById('invites-list');
  if (!invitesContainer) return;
  
  const currentUser = Auth.getCurrentUser();
  if (!currentUser) return;
  
  // Get campaign invites from storage
  const invites = Storage.get('campaignInvites', []);
  
  // Filter invites for current user
  const userInvites = invites.filter(invite => invite.influencerId === currentUser.id);
  
  if (userInvites.length === 0) {
    invitesContainer.innerHTML = `
      <div class="empty-state">
        <p>No campaign invites found</p>
        <p class="text-secondary">Check back later or browse available campaigns</p>
        <a href="campaigns.html" class="btn btn-primary">Browse Campaigns</a>
      </div>
    `;
    return;
  }
  
  // Get campaigns for details
  const campaigns = Storage.get('campaigns', []);
  
  // Get users for brand details
  const users = Storage.get('users', []);
  
  // Generate invite cards
  let invitesHTML = '';
  
  userInvites.forEach(invite => {
    // Find campaign and brand
    const campaign = campaigns.find(camp => camp.id === invite.campaignId);
    if (!campaign) return;
    
    const brand = users.find(user => user.id === campaign.brandId);
    if (!brand) return;
    
    invitesHTML += `
      <div class="invite-card" data-id="${invite.id}">
        <div class="invite-header">
          <div class="brand-logo">
            <img src="https://images.pexels.com/photos/3945634/pexels-photo-3945634.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="${brand.name}">
          </div>
          <div class="invite-brand">
            <h4>${brand.name}</h4>
            <span class="invite-date">${FormatUtils.formatDate(invite.created)}</span>
          </div>
        </div>
        <div class="invite-campaign">
          <h5>${campaign.title}</h5>
          <p>${campaign.description.substring(0, 100)}${campaign.description.length > 100 ? '...' : ''}</p>
        </div>
        <div class="campaign-meta">
          <div class="meta-item">
            <i class="fas fa-tag"></i>
            <span>${campaign.category}</span>
          </div>
          <div class="meta-item">
            <i class="fas fa-hashtag"></i>
            <span>${campaign.platform}</span>
          </div>
          <div class="meta-item">
            <i class="fas fa-dollar-sign"></i>
            <span>${campaign.budget}</span>
          </div>
        </div>
        <div class="invite-actions">
          <button class="btn btn-primary accept-invite-btn">Accept</button>
          <button class="btn btn-tertiary decline-invite-btn">Decline</button>
        </div>
      </div>
    `;
  });
  
  invitesContainer.innerHTML = invitesHTML;
}

/**
 * Load user campaigns
 */
function loadUserCampaigns() {
  const activeCampaignsContainer = document.getElementById('active-campaigns');
  const completedCampaignsContainer = document.getElementById('completed-campaigns');
  const pendingCampaignsContainer = document.getElementById('pending-campaigns');
  
  if (!activeCampaignsContainer || !completedCampaignsContainer || !pendingCampaignsContainer) return;
  
  const currentUser = Auth.getCurrentUser();
  if (!currentUser) return;
  
  // Get user campaigns
  const userCampaigns = Storage.get('userCampaigns', []);
  
  // Filter campaigns for current user
  const userActiveCampaigns = userCampaigns.filter(uc => 
    uc.influencerId === currentUser.id && uc.status === 'active'
  );
  
  const userCompletedCampaigns = userCampaigns.filter(uc => 
    uc.influencerId === currentUser.id && uc.status === 'completed'
  );
  
  const userPendingCampaigns = userCampaigns.filter(uc => 
    uc.influencerId === currentUser.id && uc.status === 'pending'
  );
  
  // Get campaigns for details
  const campaigns = Storage.get('campaigns', []);
  
  // Get users for brand details
  const users = Storage.get('users', []);
  
  // Generate active campaigns
  if (userActiveCampaigns.length === 0) {
    activeCampaignsContainer.innerHTML = `
      <div class="empty-state">
        <p>No active campaigns</p>
      </div>
    `;
  } else {
    let activeCampaignsHTML = '';
    
    userActiveCampaigns.forEach(userCampaign => {
      const campaign = campaigns.find(c => c.id === userCampaign.campaignId);
      if (!campaign) return;
      
      const brand = users.find(u => u.id === campaign.brandId);
      if (!brand) return;
      
      activeCampaignsHTML += generateCampaignCard(campaign, brand, userCampaign);
    });
    
    activeCampaignsContainer.innerHTML = activeCampaignsHTML;
  }
  
  // Generate completed campaigns
  if (userCompletedCampaigns.length === 0) {
    completedCampaignsContainer.innerHTML = `
      <div class="empty-state">
        <p>No completed campaigns</p>
      </div>
    `;
  } else {
    let completedCampaignsHTML = '';
    
    userCompletedCampaigns.forEach(userCampaign => {
      const campaign = campaigns.find(c => c.id === userCampaign.campaignId);
      if (!campaign) return;
      
      const brand = users.find(u => u.id === campaign.brandId);
      if (!brand) return;
      
      completedCampaignsHTML += generateCampaignCard(campaign, brand, userCampaign);
    });
    
    completedCampaignsContainer.innerHTML = completedCampaignsHTML;
  }
  
  // Generate pending campaigns
  if (userPendingCampaigns.length === 0) {
    pendingCampaignsContainer.innerHTML = `
      <div class="empty-state">
        <p>No pending campaigns</p>
      </div>
    `;
  } else {
    let pendingCampaignsHTML = '';
    
    userPendingCampaigns.forEach(userCampaign => {
      const campaign = campaigns.find(c => c.id === userCampaign.campaignId);
      if (!campaign) return;
      
      const brand = users.find(u => u.id === campaign.brandId);
      if (!brand) return;
      
      pendingCampaignsHTML += generateCampaignCard(campaign, brand, userCampaign);
    });
    
    pendingCampaignsContainer.innerHTML = pendingCampaignsHTML;
  }
}

/**
 * Generate campaign card HTML
 * @param {Object} campaign - Campaign data
 * @param {Object} brand - Brand data
 * @param {Object} userCampaign - User campaign data
 * @returns {string} HTML for campaign card
 */
function generateCampaignCard(campaign, brand, userCampaign) {
  return `
    <div class="campaign-card" data-id="${campaign.id}">
      <div class="campaign-image">
        <img src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="${campaign.title}">
      </div>
      <div class="campaign-content">
        <h3 class="campaign-title">${campaign.title}</h3>
        <p class="campaign-brand">${brand.name}</p>
        <div class="campaign-stats">
          <div class="campaign-stat">
            <span class="campaign-stat-value">${campaign.platform}</span>
            <span class="campaign-stat-label">Platform</span>
          </div>
          <div class="campaign-stat">
            <span class="campaign-stat-value">${campaign.duration}</span>
            <span class="campaign-stat-label">Duration</span>
          </div>
          <div class="campaign-stat">
            <span class="campaign-stat-value">${campaign.budget}</span>
            <span class="campaign-stat-label">Budget</span>
          </div>
        </div>
        <div class="campaign-status">
          <span class="status-badge status-${userCampaign.status}">
            ${userCampaign.status.charAt(0).toUpperCase() +
            userCampaign.status.slice(1)}
          </span>
          <button class="btn btn-tertiary btn-sm view-campaign-btn">View Details</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Initialize charts
 */
function initCharts() {
  // Follower Growth Chart
  const followerGrowthCtx = document.getElementById('followerGrowthChart');
  if (followerGrowthCtx) {
    new Chart(followerGrowthCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
        datasets: [
          {
            label: 'Instagram',
            data: [5200, 5800, 6500, 7200, 8100, 9000, 10200, 11500, 12800],
            borderColor: '#E1306C',
            backgroundColor: 'rgba(225, 48, 108, 0.1)',
            tension: 0.3,
            fill: true
          },
          {
            label: 'Twitter',
            data: [3500, 4000, 4600, 5200, 5800, 6500, 7200, 8000, 8800],
            borderColor: '#1DA1F2',
            backgroundColor: 'rgba(29, 161, 242, 0.1)',
            tension: 0.3,
            fill: true
          },
          {
            label: 'YouTube',
            data: [1200, 1500, 1900, 2400, 3000, 3800, 4600, 5500, 6500],
            borderColor: '#FF0000',
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
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
  
  // Engagement Chart
  const engagementCtx = document.getElementById('engagementChart');
  if (engagementCtx) {
    new Chart(engagementCtx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
        datasets: [
          {
            label: 'Engagement Rate (%)',
            data: [3.2, 3.5, 3.8, 4.1, 4.5, 4.2, 4.0, 4.3, 4.6],
            backgroundColor: 'rgba(25, 103, 255, 0.8)',
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
            beginAtZero: true,
            max: 6
          }
        }
      }
    });
  }
  
  // Campaign Performance Chart
  const campaignPerformanceCtx = document.getElementById('campaignPerformanceChart');
  if (campaignPerformanceCtx) {
    new Chart(campaignPerformanceCtx, {
      type: 'radar',
      data: {
        labels: ['Reach', 'Engagement', 'Conversions', 'Brand Awareness', 'Audience Growth', 'ROI'],
        datasets: [
          {
            label: 'Fashion Campaign',
            data: [85, 90, 70, 80, 75, 80],
            backgroundColor: 'rgba(25, 103, 255, 0.2)',
            borderColor: '#1967ff',
            pointBackgroundColor: '#1967ff'
          },
          {
            label: 'Tech Campaign',
            data: [70, 80, 90, 75, 85, 95],
            backgroundColor: 'rgba(0, 185, 255, 0.2)',
            borderColor: '#00b9ff',
            pointBackgroundColor: '#00b9ff'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          }
        },
        scales: {
          r: {
            angleLines: {
              display: true
            },
            suggestedMin: 0,
            suggestedMax: 100
          }
        }
      }
    });
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Profile form submission
  const socialMediaForm = document.getElementById('social-media-form');
  if (socialMediaForm) {
    socialMediaForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveProfileData();
    });
  }
  
  // Campaign invite actions
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('accept-invite-btn')) {
      acceptCampaignInvite(e.target);
    } else if (e.target.classList.contains('decline-invite-btn')) {
      declineCampaignInvite(e.target);
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

  // Tab controls for campaigns
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

      // Get target container
      const targetId = button.getAttribute('data-target');
      if (!targetId) return;

      // Hide all campaign containers
      document.querySelectorAll('.campaigns-grid').forEach(grid => {
        grid.classList.remove('active');
      });

      // Show target container
      const targetGrid = document.getElementById(targetId);
      if (targetGrid) {
        targetGrid.classList.add('active');
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
 * Save profile data
 */
function saveProfileData() {
  const currentUser = Auth.getCurrentUser();
  if (!currentUser) return;
  
  // Get social media data
  const instagram = document.getElementById('instagram').value.trim();
  const instagramFollowers = parseInt(document.getElementById('instagram-followers').value) || 0;
  
  const facebook = document.getElementById('facebook').value.trim();
  const facebookFollowers = parseInt(document.getElementById('facebook-followers').value) || 0;
  
  const twitter = document.getElementById('twitter').value.trim();
  const twitterFollowers = parseInt(document.getElementById('twitter-followers').value) || 0;
  
  const youtube = document.getElementById('youtube').value.trim();
  const youtubeFollowers = parseInt(document.getElementById('youtube-followers').value) || 0;
  
  const linkedin = document.getElementById('linkedin').value.trim();
  const linkedinFollowers = parseInt(document.getElementById('linkedin-followers').value) || 0;
  
  // Update social media object
  currentUser.socialMedia = {
    ...(currentUser.socialMedia || {})
  };
  
  if (instagram) {
    currentUser.socialMedia.instagram = {
      handle: instagram,
      followers: instagramFollowers
    };
  }
  
  if (facebook) {
    currentUser.socialMedia.facebook = {
      handle: facebook,
      followers: facebookFollowers
    };
  }
  
  if (twitter) {
    currentUser.socialMedia.twitter = {
      handle: twitter,
      followers: twitterFollowers
    };
  }
  
  if (youtube) {
    currentUser.socialMedia.youtube = {
      handle: youtube,
      followers: youtubeFollowers
    };
  }
  
  if (linkedin) {
    currentUser.socialMedia.linkedin = {
      handle: linkedin,
      followers: linkedinFollowers
    };
  }
  
  // Update user in storage
  const users = Storage.get('users', []);
  const userIndex = users.findIndex(user => user.id === currentUser.id);
  
  if (userIndex !== -1) {
    users[userIndex] = currentUser;
    Storage.set('users', users);
    
    // Update current user in auth
    Storage.set(Auth.USER_KEY, currentUser);
    
    UIUtils.showNotification('Profile updated successfully', 'success');
  } else {
    UIUtils.showNotification('Error updating profile', 'error');
  }
}

/**
 * Accept campaign invite
 * @param {HTMLElement} button - Accept button
 */
function acceptCampaignInvite(button) {
  const inviteCard = button.closest('.invite-card');
  const inviteId = inviteCard.getAttribute('data-id');
  
  const currentUser = Auth.getCurrentUser();
  if (!currentUser) return;
  
  // Get invites from storage
  const invites = Storage.get('campaignInvites', []);
  
  // Find invite
  const inviteIndex = invites.findIndex(invite => invite.id === inviteId);
  if (inviteIndex === -1) {
    UIUtils.showNotification('Invite not found', 'error');
    return;
  }
  
  const invite = invites[inviteIndex];
  
  // Create user campaign
  const userCampaign = {
    id: Date.now().toString(),
    campaignId: invite.campaignId,
    influencerId: currentUser.id,
    status: 'active',
    created: new Date().toISOString()
  };
  
  // Add to user campaigns
  const userCampaigns = Storage.get('userCampaigns', []);
  userCampaigns.push(userCampaign);
  Storage.set('userCampaigns', userCampaigns);
  
  // Remove invite
  invites.splice(inviteIndex, 1);
  Storage.set('campaignInvites', invites);
  
  // Update UI
  inviteCard.remove();
  
  // Reload campaigns
  loadUserCampaigns();
  
  UIUtils.showNotification('Campaign accepted successfully', 'success');
}

/**
 * Decline campaign invite
 * @param {HTMLElement} button - Decline button
 */
function declineCampaignInvite(button) {
  const inviteCard = button.closest('.invite-card');
  const inviteId = inviteCard.getAttribute('data-id');
  
  // Get invites from storage
  const invites = Storage.get('campaignInvites', []);
  
  // Find invite
  const inviteIndex = invites.findIndex(invite => invite.id === inviteId);
  if (inviteIndex === -1) {
    UIUtils.showNotification('Invite not found', 'error');
    return;
  }
  
  // Remove invite
  invites.splice(inviteIndex, 1);
  Storage.set('campaignInvites', invites);
  
  // Update UI
  inviteCard.remove();
  
  UIUtils.showNotification('Campaign invitation declined', 'info');
}