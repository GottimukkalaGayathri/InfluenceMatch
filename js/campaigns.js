/**
 * Campaigns page functionality for the InfluConnect platform
 */

document.addEventListener('DOMContentLoaded', () => {
  // Load campaigns
  loadCampaigns();
  
  // Setup event listeners
  setupEventListeners();
});

/**
 * Load campaigns
 */
function loadCampaigns() {
  const campaignsContainer = document.getElementById('campaigns-container');
  if (!campaignsContainer) return;
  
  // Get campaigns from storage
  const campaigns = Storage.get('campaigns', []);
  
  // Filter active campaigns
  const activeCampaigns = campaigns.filter(campaign => campaign.status === 'active');
  
  if (activeCampaigns.length === 0) {
    campaignsContainer.innerHTML = `
      <div class="empty-state">
        <p>No active campaigns found</p>
      </div>
    `;
    return;
  }
  
  // Get users for brand details
  const users = Storage.get('users', []);
  
  // Generate campaign cards
  let campaignsHTML = '';
  
  activeCampaigns.forEach(campaign => {
    // Find brand
    const brand = users.find(user => user.id === campaign.brandId);
    if (!brand) return;
    
    // Random image for demo
    const imageIndex = Math.floor(Math.random() * 5) + 1;
    
    campaignsHTML += `
      <div class="campaign-card" data-id="${campaign.id}">
        <div class="campaign-image">
          <img src="https://images.pexels.com/photos/318${imageIndex}38/pexels-photo-318${imageIndex}38.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="${campaign.title}">
          <span class="campaign-category">${campaign.category}</span>
        </div>
        <div class="campaign-content">
          <div class="campaign-brand">
            <div class="brand-logo-small">
              <img src="https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="${brand.name}">
            </div>
            <span class="brand-name">${brand.name}</span>
          </div>
          <h3 class="campaign-title">${campaign.title}</h3>
          <div class="campaign-info">
            <div class="info-item">
              <i class="fas fa-hashtag"></i>
              <span>${campaign.platform}</span>
            </div>
            <div class="info-item">
              <i class="fas fa-calendar-alt"></i>
              <span>${campaign.duration}</span>
            </div>
          </div>
          <p class="campaign-desc">${campaign.description}</p>
          <div class="campaign-footer">
            <div class="campaign-budget">${formatBudget(campaign.budget)}</div>
            <button class="btn btn-primary apply-btn">Apply Now</button>
          </div>
        </div>
      </div>
    `;
  });
  
  campaignsContainer.innerHTML = campaignsHTML;
}

/**
 * Format budget for display
 * @param {string} budget - Budget code
 * @returns {string} Formatted budget
 */
function formatBudget(budget) {
  switch (budget) {
    case 'under-500':
      return 'Under $500';
    case '500-1000':
      return '$500 - $1,000';
    case '1000-5000':
      return '$1,000 - $5,000';
    case '5000-10000':
      return '$5,000 - $10,000';
    case 'over-10000':
      return 'Over $10,000';
    default:
      return budget;
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Campaign search
  const searchInput = document.getElementById('campaign-search');
  const searchBtn = document.getElementById('search-btn');
  
  if (searchInput && searchBtn) {
    searchBtn.addEventListener('click', () => {
      searchCampaigns(searchInput.value.trim());
    });
    
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        searchCampaigns(searchInput.value.trim());
      }
    });
  }
  
  // Filters
  const filterInputs = document.querySelectorAll('#platform-filter, #category-filter, #budget-filter');
  filterInputs.forEach(filter => {
    filter.addEventListener('change', () => {
      applyCampaignFilters();
    });
  });
  
  // Campaign click to show details
  document.addEventListener('click', (e) => {
    // Check if clicked on campaign card or apply button
    const campaignCard = e.target.closest('.campaign-card');
    const applyBtn = e.target.closest('.apply-btn');
    
    if (campaignCard && !applyBtn) {
      const campaignId = campaignCard.getAttribute('data-id');
      showCampaignDetails(campaignId);
    } else if (applyBtn) {
      const campaignId = applyBtn.closest('.campaign-card').getAttribute('data-id');
      showCampaignDetails(campaignId, true);
    }
  });
  
  // Campaign application form
  const applicationForm = document.getElementById('campaign-application-form');
  if (applicationForm) {
    applicationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      submitCampaignApplication();
    });
  }
}

/**
 * Search campaigns
 * @param {string} query - Search query
 */
function searchCampaigns(query) {
  if (!query) {
    // Reset filters and show all
    document.querySelectorAll('#platform-filter, #category-filter, #budget-filter').forEach(filter => {
      filter.value = 'all';
    });
    
    loadCampaigns();
    return;
  }
  
  const campaignCards = document.querySelectorAll('.campaign-card');
  let found = false;
  
  campaignCards.forEach(card => {
    const title = card.querySelector('.campaign-title').textContent.toLowerCase();
    const brandName = card.querySelector('.brand-name').textContent.toLowerCase();
    const description = card.querySelector('.campaign-desc').textContent.toLowerCase();
    
    if (title.includes(query.toLowerCase()) || 
        brandName.includes(query.toLowerCase()) || 
        description.includes(query.toLowerCase())) {
      card.style.display = 'block';
      found = true;
    } else {
      card.style.display = 'none';
    }
  });
  
  if (!found) {
    UIUtils.showNotification('No campaigns found matching your search', 'info');
  }
}

/**
 * Apply campaign filters
 */
function applyCampaignFilters() {
  const platformFilter = document.getElementById('platform-filter').value;
  const categoryFilter = document.getElementById('category-filter').value;
  const budgetFilter = document.getElementById('budget-filter').value;
  
  const campaignCards = document.querySelectorAll('.campaign-card');
  let found = false;
  
  campaignCards.forEach(card => {
    // Check platform
    let platformMatch = platformFilter === 'all';
    if (!platformMatch) {
      const platform = card.querySelector('.info-item:nth-child(1) span').textContent;
      platformMatch = platform.toLowerCase() === platformFilter;
    }
    
    // Check category
    let categoryMatch = categoryFilter === 'all';
    if (!categoryMatch) {
      const category = card.querySelector('.campaign-category').textContent;
      categoryMatch = category.toLowerCase() === categoryFilter;
    }
    
    // Check budget (simplified for demo)
    let budgetMatch = budgetFilter === 'all';
    if (!budgetMatch) {
      const budget = card.querySelector('.campaign-budget').textContent;
      
      switch (budgetFilter) {
        case 'under-500':
          budgetMatch = budget.includes('Under $500');
          break;
        case '500-1000':
          budgetMatch = budget.includes('$500 - $1,000');
          break;
        case '1000-5000':
          budgetMatch = budget.includes('$1,000 - $5,000');
          break;
        case '5000-plus':
          budgetMatch = budget.includes('$5,000 - $10,000') || budget.includes('Over $10,000');
          break;
      }
    }
    
    // Show or hide based on all filters
    if (platformMatch && categoryMatch && budgetMatch) {
      card.style.display = 'block';
      found = true;
    } else {
      card.style.display = 'none';
    }
  });
  
  if (!found) {
    UIUtils.showNotification('No campaigns found matching your filters', 'info');
  }
}

/**
 * Show campaign details in modal
 * @param {string} campaignId - Campaign ID
 * @param {boolean} scrollToApplication - Whether to scroll to application form
 */
function showCampaignDetails(campaignId, scrollToApplication = false) {
  // Check if user is logged in
  if (!Auth.isLoggedIn()) {
    UIUtils.showNotification('Please log in to view campaign details', 'info');
    window.location.href = 'login.html';
    return;
  }
  
  // Check if user is an influencer
  const currentUser = Auth.getCurrentUser();
  if (currentUser.role !== 'influencer') {
    UIUtils.showNotification('Only influencers can view campaign details', 'info');
    return;
  }
  
  // Get campaigns from storage
  const campaigns = Storage.get('campaigns', []);
  
  // Find campaign
  const campaign = campaigns.find(camp => camp.id === campaignId);
  if (!campaign) {
    UIUtils.showNotification('Campaign not found', 'error');
    return;
  }
  
  // Get users for brand details
  const users = Storage.get('users', []);
  
  // Find brand
  const brand = users.find(user => user.id === campaign.brandId);
  if (!brand) {
    UIUtils.showNotification('Brand not found', 'error');
    return;
  }
  
  // Update modal content
  const modalBrandLogo = document.getElementById('modal-brand-logo');
  const modalCampaignTitle = document.getElementById('modal-campaign-title');
  const modalBrandName = document.getElementById('modal-brand-name');
  const modalCampaignCategory = document.getElementById('modal-campaign-category');
  const modalCampaignPlatform = document.getElementById('modal-campaign-platform');
  const modalCampaignBudget = document.getElementById('modal-campaign-budget');
  const modalCampaignDuration = document.getElementById('modal-campaign-duration');
  const modalCampaignDescription = document.getElementById('modal-campaign-description');
  const modalCampaignRequirements = document.getElementById('modal-campaign-requirements');
  
  // Set values
  if (modalBrandLogo) modalBrandLogo.src = 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
  if (modalCampaignTitle) modalCampaignTitle.textContent = campaign.title;
  if (modalBrandName) modalBrandName.textContent = brand.name;
  if (modalCampaignCategory) modalCampaignCategory.textContent = campaign.category;
  if (modalCampaignPlatform) modalCampaignPlatform.textContent = campaign.platform;
  if (modalCampaignBudget) modalCampaignBudget.textContent = formatBudget(campaign.budget);
  if (modalCampaignDuration) modalCampaignDuration.textContent = campaign.duration;
  if (modalCampaignDescription) modalCampaignDescription.textContent = campaign.description;
  if (modalCampaignRequirements) modalCampaignRequirements.textContent = campaign.requirements;
  
  // Store campaign ID in modal
  document.getElementById('campaign-detail-modal').setAttribute('data-campaign-id', campaignId);
  
  // Show modal
  UIUtils.showModal('campaign-detail-modal');
  
  // Scroll to application form if needed
  if (scrollToApplication) {
    setTimeout(() => {
      const applicationForm = document.querySelector('.application-form');
      if (applicationForm) {
        applicationForm.scrollIntoView({ behavior: 'smooth' });
      }
    }, 300);
  }
}

/**
 * Submit campaign application
 */
function submitCampaignApplication() {
  // Check if user is logged in
  if (!Auth.isLoggedIn()) {
    UIUtils.showNotification('Please log in to apply for campaigns', 'info');
    window.location.href = 'login.html';
    return;
  }
  
  // Check if user is an influencer
  const currentUser = Auth.getCurrentUser();
  if (currentUser.role !== 'influencer') {
    UIUtils.showNotification('Only influencers can apply for campaigns', 'info');
    return;
  }
  
  // Get campaign ID from modal
  const campaignId = document.getElementById('campaign-detail-modal').getAttribute('data-campaign-id');
  
  // Get application data
  const applicationMessage = document.getElementById('application-message').value.trim();
  const applicationPrice = document.getElementById('application-price').value;
  
  if (!applicationMessage || !applicationPrice) {
    UIUtils.showNotification('Please fill all fields', 'error');
    return;
  }
  
  // Get campaigns from storage
  const campaigns = Storage.get('campaigns', []);
  
  // Find campaign
  const campaignIndex = campaigns.findIndex(camp => camp.id === campaignId);
  if (campaignIndex === -1) {
    UIUtils.showNotification('Campaign not found', 'error');
    return;
  }
  
  // Check if already applied
  const alreadyApplied = campaigns[campaignIndex].applicants && 
    campaigns[campaignIndex].applicants.some(app => app.influencerId === currentUser.id);
  
  if (alreadyApplied) {
    UIUtils.showNotification('You have already applied for this campaign', 'info');
    UIUtils.hideModal('campaign-detail-modal');
    return;
  }
  
  // Create application object
  const application = {
    id: Date.now().toString(),
    influencerId: currentUser.id,
    message: applicationMessage,
    price: applicationPrice,
    status: 'pending',
    created: new Date().toISOString()
  };
  
  // Add application to campaign
  if (!campaigns[campaignIndex].applicants) {
    campaigns[campaignIndex].applicants = [];
  }
  
  campaigns[campaignIndex].applicants.push(application);
  
  // Save to storage
  Storage.set('campaigns', campaigns);
  
  // Create user campaign
  const userCampaign = {
    id: Date.now().toString(),
    campaignId,
    influencerId: currentUser.id,
    status: 'pending',
    created: new Date().toISOString()
  };
  
  // Add to user campaigns
  const userCampaigns = Storage.get('userCampaigns', []);
  userCampaigns.push(userCampaign);
  Storage.set('userCampaigns', userCampaigns);
  
  // Close modal and show success message
  UIUtils.hideModal('campaign-detail-modal');
  UIUtils.showNotification('Application submitted successfully', 'success');
  
  // Reset form
  document.getElementById('application-message').value = '';
  document.getElementById('application-price').value = '';
}