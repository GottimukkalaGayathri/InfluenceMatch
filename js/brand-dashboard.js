/**
 * Brand dashboard functionality for the InfluConnect platform
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check user role and redirect if not brand
  const currentUser = Auth.getCurrentUser();
  if (!currentUser || currentUser.role !== 'brand') {
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
  loadInfluencers();
  loadCampaigns();
  loadBrandProfile();
  loadInfluencerApplications();

}

/**
 * Load influencers for search
 */
function loadInfluencers() {
  const influencersContainer = document.getElementById('influencers-results');
  if (!influencersContainer) return;
  
  // Get users from storage
  const users = Storage.get('users', []);
  
  // Filter influencers
  const influencers = users.filter(user => user.role === 'influencer');
  
  if (influencers.length === 0) {
    influencersContainer.innerHTML = `
      <div class="empty-state">
        <p>No influencers found</p>
      </div>
    `;
    return;
  }
  
  // Generate influencer cards
  let influencersHTML = '';
  
  influencers.forEach(influencer => {
    // Get total followers
    let totalFollowers = 0;
    const platforms = [];
    
    if (influencer.socialMedia) {
      if (influencer.socialMedia.instagram) {
        totalFollowers += influencer.socialMedia.instagram.followers;
        platforms.push('instagram');
      }
      
      if (influencer.socialMedia.facebook) {
        totalFollowers += influencer.socialMedia.facebook.followers;
        platforms.push('facebook');
      }
      
      if (influencer.socialMedia.twitter) {
        totalFollowers += influencer.socialMedia.twitter.followers;
        platforms.push('twitter');
      }
      
      if (influencer.socialMedia.youtube) {
        totalFollowers += influencer.socialMedia.youtube.followers;
        platforms.push('youtube');
      }
      
      if (influencer.socialMedia.tiktok) {
        totalFollowers += influencer.socialMedia.tiktok.followers;
        platforms.push('tiktok');
      }
    }
    
    // Generate platforms HTML
    let platformsHTML = '';
    platforms.forEach(platform => {
      platformsHTML += `
        <div class="platform-icon platform-${platform}">
          <i class="fab fa-${platform}"></i>
        </div>
      `;
    });
    
    if (!platformsHTML) {
      platformsHTML = '<span class="no-platforms">No platforms</span>';
    }
    
    // Random category for demo
    const categories = ['Fashion', 'Beauty', 'Lifestyle', 'Tech', 'Fitness', 'Food', 'Travel'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    influencersHTML += `
      <div class="influencer-card" data-id="${influencer.id}">
        <div class="influencer-image">
          <img src="https://www.w3schools.com/howto/img_avatar.png" alt="${influencer.name}">
          <span class="influencer-category">${randomCategory}</span>
        </div>
        <div class="influencer-info">
          <h3>${influencer.name}</h3>
          <div class="influencer-platforms">
            ${platformsHTML}
          </div>
          <div class="influencer-stats">
            <div class="influencer-stat">
              <span class="stat-value">${FormatUtils.formatFollowerCount(totalFollowers)}</span>
              <span class="stat-label">Followers</span>
            </div>
            <div class="influencer-stat">
              <span class="stat-value">${(Math.random() * 5 + 1).toFixed(1)}</span>
              <span class="stat-label">Rating</span>
            </div>
            <div class="influencer-stat">
              <span class="stat-value">${(Math.random() * 10).toFixed(1)}%</span>
              <span class="stat-label">Eng. Rate</span>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  influencersContainer.innerHTML = influencersHTML;
}

/**
 * Load brand campaigns
 */
function loadCampaigns() {
  const activeCampaignsContainer = document.getElementById('active-campaigns');
  const draftCampaignsContainer = document.getElementById('draft-campaigns');
  const completedCampaignsContainer = document.getElementById('completed-campaigns');
  
  if (!activeCampaignsContainer || !draftCampaignsContainer || !completedCampaignsContainer) return;
  
  const currentUser = Auth.getCurrentUser();
  if (!currentUser) return;
  
  // Get campaigns from storage
  const campaigns = Storage.get('campaigns', []);
  
  // Filter campaigns by brand
  const brandCampaigns = campaigns.filter(campaign => campaign.brandId === currentUser.id);
  
  const activeCampaigns = brandCampaigns.filter(campaign => campaign.status === 'active');
  const draftCampaigns = brandCampaigns.filter(campaign => campaign.status === 'draft');
  const completedCampaigns = brandCampaigns.filter(campaign => campaign.status === 'completed');
  
  // Load active campaigns
  if (activeCampaigns.length === 0) {
    activeCampaignsContainer.innerHTML = `
      <div class="empty-state">
        <p>No active campaigns</p>
        <button class="btn btn-primary create-campaign-btn">Create New Campaign</button>
      </div>
    `;
  } else {
    let activeCampaignsHTML = '<div class="campaign-cards">';
    
    activeCampaigns.forEach(campaign => {
      activeCampaignsHTML += generateCampaignCard(campaign);
    });
    
    activeCampaignsHTML += '</div>';
    activeCampaignsContainer.innerHTML = activeCampaignsHTML;
  }
  
  // Load draft campaigns
  if (draftCampaigns.length === 0) {
    draftCampaignsContainer.innerHTML = `
      <div class="empty-state">
        <p>No draft campaigns</p>
      </div>
    `;
  } else {
    let draftCampaignsHTML = '<div class="campaign-cards">';
    
    draftCampaigns.forEach(campaign => {
      draftCampaignsHTML += generateCampaignCard(campaign);
    });
    
    draftCampaignsHTML += '</div>';
    draftCampaignsContainer.innerHTML = draftCampaignsHTML;
  }
  
  // Load completed campaigns
  if (completedCampaigns.length === 0) {
    completedCampaignsContainer.innerHTML = `
      <div class="empty-state">
        <p>No completed campaigns</p>
      </div>
    `;
  } else {
    let completedCampaignsHTML = '<div class="campaign-cards">';
    
    completedCampaigns.forEach(campaign => {
      completedCampaignsHTML += generateCampaignCard(campaign);
    });
    
    completedCampaignsHTML += '</div>';
    completedCampaignsContainer.innerHTML = completedCampaignsHTML;
  }
  
  // Load campaign select for invite modal
  const campaignSelect = document.getElementById('campaign-select');
  if (campaignSelect) {
    // Clear existing options
    campaignSelect.innerHTML = '';
    
    if (activeCampaigns.length === 0) {
      campaignSelect.innerHTML = '<option value="">No active campaigns</option>';
    } else {
      activeCampaigns.forEach(campaign => {
        const option = document.createElement('option');
        option.value = campaign.id;
        option.textContent = campaign.title;
        campaignSelect.appendChild(option);
      });
    }
  }
}

/**
 * Generate campaign card
 * @param {Object} campaign - Campaign data
 * @returns {string} HTML for campaign card
 */
function generateCampaignCard(campaign) {
  return `
    <div class="campaign-card" data-id="${campaign.id}">
      <div class="campaign-header">
        <h3 class="campaign-title">${campaign.title}</h3>
        <div class="campaign-meta">
          <div class="meta-item">
            <i class="fas fa-hashtag"></i>
            <span>${campaign.platform}</span>
          </div>
          <div class="meta-item">
            <i class="fas fa-tag"></i>
            <span>${campaign.category}</span>
          </div>
          <div class="meta-item">
            <i class="fas fa-calendar-alt"></i>
            <span>${campaign.duration}</span>
          </div>
        </div>
      </div>
      <div class="campaign-body">
        <div class="campaign-description">
          <p>${campaign.description.substring(0, 120)}${campaign.description.length > 120 ? '...' : ''}</p>
        </div>
        <div class="campaign-stats">
          <div class="stat">
            <span class="stat-value">${campaign.applicants ? campaign.applicants.length : 0}</span>
            <span class="stat-label">Applicants</span>
          </div>
          <div class="stat">
            <span class="stat-value">${FormatUtils.formatFollowerCount(Math.floor(Math.random() * 500000 + 50000))}</span>
            <span class="stat-label">Reach</span>
          </div>
          <div class="stat">
            <span class="stat-value">${campaign.budget}</span>
            <span class="stat-label">Budget</span>
          </div>
        </div>
        <div class="campaign-actions">
          <button class="btn btn-tertiary btn-sm view-campaign-btn">View</button>
          <button class="btn btn-primary btn-sm edit-campaign-btn">Edit</button>
        </div>
      </div>
    </div>
  `;
}


/**
 * Load brand profile
 */
function loadBrandProfile() {
  const currentUser = Auth.getCurrentUser();
  if (!currentUser) return;
  
  // Set profile values
  const brandNameElement = document.getElementById('brand-name');
  const brandWebsiteElement = document.getElementById('brand-website');
  
  if (brandNameElement) brandNameElement.textContent = currentUser.name;
  if (brandWebsiteElement) brandWebsiteElement.textContent = currentUser.website || 'www.examplebrand.com';
  
  // Set form values
  const brandDisplayNameInput = document.getElementById('brand-display-name');
  const brandWebsiteUrlInput = document.getElementById('brand-website-url');
  const brandDescriptionInput = document.getElementById('brand-description');
  
  if (brandDisplayNameInput) brandDisplayNameInput.value = currentUser.name;
  if (brandWebsiteUrlInput) brandWebsiteUrlInput.value = currentUser.website || 'https://www.examplebrand.com';
  if (brandDescriptionInput && currentUser.description) {
    brandDescriptionInput.value = currentUser.description;
  }
}
function loadInfluencerApplications() {
  const currentUser = Auth.getCurrentUser();
  if (!currentUser || currentUser.role !== 'brand') return;

  fetch(`http://localhost:5000/api/campaigns/applications/${currentUser.id}`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('applications-container');
      if (!container) return;

      if (!data.length) {
        container.innerHTML = `<p>No influencer applications found.</p>`;
        return;
      }

      let html = `
        <table>
          <thead>
            <tr>
              <th>Influencer</th>
              <th>Email</th>
              <th>Platform</th>
              <th>Handle</th>
              <th>Followers</th>
              <th>Campaign</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
      `;

      data.forEach(app => {
        (app.social_media || []).forEach(sm => {
          html += `
            <tr>
              <td>${app.influencer_name}</td>
              <td>${app.influencer_email}</td>
              <td>${sm.platform}</td>
              <td>${sm.handle}</td>
              <td>${sm.followers}</td>
              <td>${app.campaign_title}</td>
              <td>${app.status}</td>
            </tr>
          `;
        });
      });

      html += '</tbody></table>';
      container.innerHTML = html;
    })
    .catch(err => {
      console.error('Error loading applications:', err);
      UIUtils.showNotification('Failed to load applications', 'error');
    });
}

/**
 * Initialize charts
 */
function initCharts() {
  // Follower History Chart for influencer details modal
  setupFollowerHistoryChart();
  
  // Campaign Performance Chart
  const campaignPerformanceCtx = document.getElementById('campaignPerformanceChart');
  if (campaignPerformanceCtx) {
    new Chart(campaignPerformanceCtx, {
      type: 'line',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
        datasets: [
          {
            label: 'Impressions',
            data: [12500, 18500, 25000, 32000, 38500, 45000, 52000, 60000],
            borderColor: '#1967ff',
            backgroundColor: 'rgba(25, 103, 255, 0.1)',
            tension: 0.3,
            fill: true
          },
          {
            label: 'Engagements',
            data: [850, 1250, 1800, 2300, 2800, 3400, 4000, 4600],
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
  
  // ROI Analysis Chart
  const roiAnalysisCtx = document.getElementById('roiAnalysisChart');
  if (roiAnalysisCtx) {
    new Chart(roiAnalysisCtx, {
      type: 'bar',
      data: {
        labels: ['Beauty Campaign', 'Lifestyle Campaign', 'Tech Campaign', 'Fashion Campaign'],
        datasets: [
          {
            label: 'ROI (%)',
            data: [320, 280, 410, 350],
            backgroundColor: 'rgba(25, 103, 255, 0.8)',
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
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  
  // Demographics Chart
  const demographicsCtx = document.getElementById('demographicsChart');
  if (demographicsCtx) {
    new Chart(demographicsCtx, {
      type: 'doughnut',
      data: {
        labels: ['18-24', '25-34', '35-44', '45-54', '55+'],
        datasets: [
          {
            label: 'Age Distribution',
            data: [35, 40, 15, 7, 3],
            backgroundColor: [
              '#1967ff',
              '#00b9ff',
              '#ff9b00',
              '#23c552',
              '#f7b955'
            ],
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          }
        }
      }
    });
  }
}

/**
 * Setup follower history chart for influencer modal
 */
function setupFollowerHistoryChart() {
  // This will be initialized when an influencer is clicked
  window.initializeFollowerHistoryChart = (influencerId) => {
    const followerHistoryCtx = document.getElementById('followerHistoryChart');
    if (!followerHistoryCtx) return;
    
    // In a real app, we would get real data for this influencer
    // For demo purposes, generate random data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
    const instagramData = [];
    const twitterData = [];
    
    let instagramBase = Math.floor(Math.random() * 5000 + 5000);
    let twitterBase = Math.floor(Math.random() * 3000 + 2000);
    
    for (let i = 0; i < months.length; i++) {
      instagramBase += Math.floor(Math.random() * 500 + 200);
      instagramData.push(instagramBase);
      
      twitterBase += Math.floor(Math.random() * 300 + 100);
      twitterData.push(twitterBase);
    }
    
    new Chart(followerHistoryCtx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Instagram',
            data: instagramData,
            borderColor: '#E1306C',
            backgroundColor: 'rgba(225, 48, 108, 0.1)',
            tension: 0.3,
            fill: true
          },
          {
            label: 'Twitter',
            data: twitterData,
            borderColor: '#1DA1F2',
            backgroundColor: 'rgba(29, 161, 242, 0.1)',
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
  };
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Influencer search
  const searchInput = document.getElementById('influencer-search');
  const searchBtn = document.getElementById('search-btn');
  
  if (searchInput && searchBtn) {
    searchBtn.addEventListener('click', () => {
      searchInfluencers(searchInput.value.trim());
    });
    
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        searchInfluencers(searchInput.value.trim());
      }
    });
  }
  
  // Influencer click to show details
  document.addEventListener('click', (e) => {
    const influencerCard = e.target.closest('.influencer-card');
    if (influencerCard) {
      const influencerId = influencerCard.getAttribute('data-id');
      showInfluencerDetails(influencerId);
    }
  });
  
  // Filters
  const filterInputs = document.querySelectorAll('#platform-filter, #followers-filter, #category-filter');
  filterInputs.forEach(filter => {
    filter.addEventListener('change', () => {
      applyInfluencerFilters();
    });
  });
  
  // Create campaign button
  const createCampaignBtns = document.querySelectorAll('.create-campaign-btn');
  createCampaignBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      UIUtils.showModal('campaign-form-modal');
    });
  });
  
  // Campaign form submission
  const campaignForm = document.getElementById('campaign-form');
  if (campaignForm) {
    campaignForm.addEventListener('submit', (e) => {
      e.preventDefault();
      createCampaign(false);
    });
    
    // Save as draft button
    const saveDraftBtn = document.getElementById('save-draft-btn');
    if (saveDraftBtn) {
      saveDraftBtn.addEventListener('click', () => {
        createCampaign(true);
      });
    }
  }
  
  // Brand profile form submission
  const brandProfileForm = document.getElementById('brand-profile-form');
  if (brandProfileForm) {
    brandProfileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveBrandProfile();
    });
  }
  
  // Modal event listeners
  setupModalEventListeners();
}

/**
 * Setup modal event listeners
 */
function setupModalEventListeners() {
  // Invite form submission
  const inviteForm = document.getElementById('invite-form');
  if (inviteForm) {
    inviteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      sendInfluencerInvite();
    });
  }
  
  // Invite button in influencer modal
  document.addEventListener('click', (e) => {
    if (e.target.id === 'invite-btn') {
      UIUtils.hideModal('influencer-details-modal');
      UIUtils.showModal('invite-modal');
    }
  });
}

/**
 * Search influencers
 * @param {string} query - Search query
 */
function searchInfluencers(query) {
  if (!query) {
    // Reset filters and show all
    document.querySelectorAll('#platform-filter, #followers-filter, #category-filter').forEach(filter => {
      filter.value = 'all';
    });
    
    loadInfluencers();
    return;
  }
  
  const influencerCards = document.querySelectorAll('.influencer-card');
  let found = false;
  
  influencerCards.forEach(card => {
    const name = card.querySelector('h3').textContent.toLowerCase();
    const category = card.querySelector('.influencer-category').textContent.toLowerCase();
    
    if (name.includes(query.toLowerCase()) || category.includes(query.toLowerCase())) {
      card.style.display = 'block';
      found = true;
    } else {
      card.style.display = 'none';
    }
  });
  
  if (!found) {
    UIUtils.showNotification('No influencers found matching your search', 'info');
  }
}

/**
 * Apply influencer filters
 */
function applyInfluencerFilters() {
  const platformFilter = document.getElementById('platform-filter').value;
  const followersFilter = document.getElementById('followers-filter').value;
  const categoryFilter = document.getElementById('category-filter').value;
  
  const influencerCards = document.querySelectorAll('.influencer-card');
  let found = false;
  
  influencerCards.forEach(card => {
    // Check platform
    let platformMatch = platformFilter === 'all';
    if (!platformMatch) {
      const platformIcons = card.querySelectorAll(`.platform-${platformFilter}`);
      platformMatch = platformIcons.length > 0;
    }
    
    // Check category
    let categoryMatch = categoryFilter === 'all';
    if (!categoryMatch) {
      const category = card.querySelector('.influencer-category').textContent.toLowerCase();
      categoryMatch = category.toLowerCase() === categoryFilter;
    }
    
    // Check followers (simplified for demo)
    let followersMatch = followersFilter === 'all';
    if (!followersMatch) {
      const followersText = card.querySelector('.stat-value').textContent;
      
      switch (followersFilter) {
        case 'micro':
          followersMatch = followersText.includes('K') && parseInt(followersText) < 10;
          break;
        case 'mid':
          followersMatch = (followersText.includes('K') && parseInt(followersText) >= 10) || 
                          (followersText.includes('K') && parseInt(followersText) < 100);
          break;
        case 'macro':
          followersMatch = (followersText.includes('K') && parseInt(followersText) >= 100) || 
                          (followersText.includes('M') && parseInt(followersText) < 1);
          break;
        case 'mega':
          followersMatch = followersText.includes('M') && parseInt(followersText) >= 1;
          break;
      }
    }
    
    // Show or hide based on all filters
    if (platformMatch && categoryMatch && followersMatch) {
      card.style.display = 'block';
      found = true;
    } else {
      card.style.display = 'none';
    }
  });
  
  if (!found) {
    UIUtils.showNotification('No influencers found matching your filters', 'info');
  }
}

/**
 * Show influencer details in modal
 * @param {string} influencerId - Influencer ID
 */
function showInfluencerDetails(influencerId) {
  // Get users from storage
  const users = Storage.get('users', []);
  
  // Find influencer
  const influencer = users.find(user => user.id === influencerId && user.role === 'influencer');
  
  if (!influencer) {
    UIUtils.showNotification('Influencer not found', 'error');
    return;
  }
  
  // Update modal content
  const modalInfluencerImg = document.getElementById('modal-influencer-img');
  const modalInfluencerName = document.getElementById('modal-influencer-name');
  const modalInfluencerCategory = document.getElementById('modal-influencer-category');
  const socialPlatformsContainer = document.querySelector('.social-platforms');
  const avgLikes = document.getElementById('avg-likes');
  const avgComments = document.getElementById('avg-comments');
  const engagementRate = document.getElementById('engagement-rate');
  
  // Set random category for demo
  const categories = ['Fashion', 'Beauty', 'Lifestyle', 'Tech', 'Fitness', 'Food', 'Travel'];
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  
  // Set values
  if (modalInfluencerImg) modalInfluencerImg.src = 'https://www.w3schools.com/howto/img_avatar.png';
  if (modalInfluencerName) modalInfluencerName.textContent = influencer.name;
  if (modalInfluencerCategory) modalInfluencerCategory.textContent = randomCategory;
  
  // Generate social platforms HTML
  if (socialPlatformsContainer) {
    let platformsHTML = '';
    let totalFollowers = 0;
    
    if (influencer.socialMedia) {
      if (influencer.socialMedia.instagram) {
        platformsHTML += `
          <div class="social-platform">
            <i class="fab fa-instagram"></i>
            <span>${influencer.socialMedia.instagram.handle}</span>
            <span class="followers">${FormatUtils.formatFollowerCount(influencer.socialMedia.instagram.followers)} followers</span>
          </div>
        `;
        totalFollowers += influencer.socialMedia.instagram.followers;
      }
      
      if (influencer.socialMedia.twitter) {
        platformsHTML += `
          <div class="social-platform">
            <i class="fab fa-twitter"></i>
            <span>${influencer.socialMedia.twitter.handle}</span>
            <span class="followers">${FormatUtils.formatFollowerCount(influencer.socialMedia.twitter.followers)} followers</span>
          </div>
        `;
        totalFollowers += influencer.socialMedia.twitter.followers;
      }
      
      if (influencer.socialMedia.facebook) {
        platformsHTML += `
          <div class="social-platform">
            <i class="fab fa-facebook"></i>
            <span>${influencer.socialMedia.facebook.handle}</span>
            <span class="followers">${FormatUtils.formatFollowerCount(influencer.socialMedia.facebook.followers)} followers</span>
          </div>
        `;
        totalFollowers += influencer.socialMedia.facebook.followers;
      }
      
      if (influencer.socialMedia.youtube) {
        platformsHTML += `
          <div class="social-platform">
            <i class="fab fa-youtube"></i>
            <span>${influencer.socialMedia.youtube.handle}</span>
            <span class="followers">${FormatUtils.formatFollowerCount(influencer.socialMedia.youtube.followers)} subscribers</span>
          </div>
        `;
        totalFollowers += influencer.socialMedia.youtube.followers;
      }
    }
    
    if (!platformsHTML) {
      platformsHTML = '<p>No social media platforms connected</p>';
    }
    
    socialPlatformsContainer.innerHTML = platformsHTML;
    
    // Set metrics (random for demo)
    const avgLikesValue = Math.floor(totalFollowers * (Math.random() * 0.05 + 0.01));
    const avgCommentsValue = Math.floor(avgLikesValue * (Math.random() * 0.1 + 0.01));
    const engagementRateValue = (Math.random() * 5 + 1).toFixed(2);
    
    if (avgLikes) avgLikes.textContent = FormatUtils.formatFollowerCount(avgLikesValue);
    if (avgComments) avgComments.textContent = FormatUtils.formatFollowerCount(avgCommentsValue);
    if (engagementRate) engagementRate.textContent = `${engagementRateValue}%`;
  }
  
  // Store selected influencer ID
  document.getElementById('influencer-details-modal').setAttribute('data-influencer-id', influencerId);
  
  // Initialize follower history chart
  if (window.initializeFollowerHistoryChart) {
    window.initializeFollowerHistoryChart(influencerId);
  }
  
  // Show modal
  UIUtils.showModal('influencer-details-modal');
}

/**
 * Send invitation to influencer
 */
function sendInfluencerInvite() {
  const influencerId = document.getElementById('influencer-details-modal').getAttribute('data-influencer-id');
  const campaignId = document.getElementById('campaign-select').value;
  const message = document.getElementById('invite-message').value.trim();
  
  if (!influencerId || !campaignId) {
    UIUtils.showNotification('Please select a campaign', 'error');
    return;
  }
  
  if (!message) {
    UIUtils.showNotification('Please enter a message', 'error');
    return;
  }
  
  // Create invite
  const invite = {
    id: Date.now().toString(),
    influencerId,
    campaignId,
    message,
    status: 'pending',
    created: new Date().toISOString()
  };
  
  // Save to storage
  const invites = Storage.get('campaignInvites', []);
  invites.push(invite);
  Storage.set('campaignInvites', invites);
  
  // Close modal and show success message
  UIUtils.hideModal('invite-modal');
  UIUtils.showNotification('Invitation sent successfully', 'success');
  
  // Reset form
  document.getElementById('invite-message').value = '';
}

/**
 * Create new campaign
 * @param {boolean} isDraft - Whether to save as draft
 */
function createCampaign(isDraft) {
  const currentUser = Auth.getCurrentUser();
  if (!currentUser) return;
  
  // Get form data
  const title = document.getElementById('campaign-title').value.trim();
  const description = document.getElementById('campaign-description').value.trim();
  const platform = document.getElementById('campaign-platform').value;
  const category = document.getElementById('campaign-category').value;
  const budget = document.getElementById('campaign-budget').value;
  const duration = document.getElementById('campaign-duration').value;
  const requirements = document.getElementById('campaign-requirements').value.trim();
  
  if (!isDraft && (!title || !description || !requirements)) {
    UIUtils.showNotification('Please fill all required fields', 'error');
    return;
  }
  
  // Create campaign object
  const campaign = {
    id: Date.now().toString(),
    brandId: currentUser.id,
    title: title || 'Untitled Campaign',
    description: description || 'No description provided',
    platform: platform || 'instagram',
    category: category || 'other',
    budget: budget || 'under-500',
    duration: duration || 'one-time',
    requirements: requirements || 'No requirements specified',
    status: isDraft ? 'draft' : 'active',
    applicants: [],
    created: new Date().toISOString()
  };
  
  // Save to storage
  const campaigns = Storage.get('campaigns', []);
  campaigns.push(campaign);
  Storage.set('campaigns', campaigns);
  
  // Close modal and show success message
  UIUtils.hideModal('campaign-form-modal');
  UIUtils.showNotification(`Campaign ${isDraft ? 'saved as draft' : 'created'} successfully`, 'success');
  
  // Reset form
  document.getElementById('campaign-form').reset();
  
  // Reload campaigns
  loadCampaigns();
}

/**
 * Save brand profile
 */
function saveBrandProfile() {
  const currentUser = Auth.getCurrentUser();
  if (!currentUser) return;
  
  // Get form data
  const name = document.getElementById('brand-display-name').value.trim();
  const website = document.getElementById('brand-website-url').value.trim();
  const description = document.getElementById('brand-description').value.trim();
  const industry = document.getElementById('brand-industry').value;
  
  if (!name) {
    UIUtils.showNotification('Brand name is required', 'error');
    return;
  }
  
  // Update user object
  currentUser.name = name;
  currentUser.website = website;
  currentUser.description = description;
  currentUser.industry = industry;
  
  // Update social media links (if available)
  const socialLinks = document.querySelectorAll('.social-link-row input');
  if (socialLinks.length > 0) {
    currentUser.socialLinks = {};
    
    socialLinks.forEach((input, index) => {
      const value = input.value.trim();
      if (value) {
        const platforms = ['instagram', 'facebook', 'twitter', 'linkedin'];
        if (index < platforms.length) {
          currentUser.socialLinks[platforms[index]] = value;
        }
      }
    });
  }
  
  // Update user in storage
  const users = Storage.get('users', []);
  const userIndex = users.findIndex(user => user.id === currentUser.id);
  
  if (userIndex !== -1) {
    users[userIndex] = currentUser;
    Storage.set('users', users);
    
    // Update current user in auth
    Storage.set(Auth.USER_KEY, currentUser);
    
    // Update UI
    document.getElementById('brand-name').textContent = name;
    document.getElementById('brand-website').textContent = website;
    
    UIUtils.showNotification('Profile updated successfully', 'success');
  } else {
    UIUtils.showNotification('Error updating profile', 'error');
  }
}