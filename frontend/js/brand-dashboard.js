// Brand dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!user || !token || user.role !== 'brand') {
        window.location.href = '/login';
        return;
    }

    // Initialize dashboard
    initializeDashboard();
    loadProfile();
    loadOverviewData();
    loadCampaigns();
    loadInfluencers();
    loadApplications();
    loadCampaignCategories();

    // Event listeners
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
    document.getElementById('createCampaignForm').addEventListener('submit', handleCreateCampaign);
    document.getElementById('editCampaignForm').addEventListener('submit', handleEditCampaign);
    document.getElementById('inviteForm').addEventListener('submit', handleInviteInfluencer);
    document.getElementById('rateInfluencerForm').addEventListener('submit', handleRateInfluencer);
    
    // Search and filter
    document.getElementById('searchInfluencers').addEventListener('input', filterInfluencers);
    document.getElementById('filterInterest').addEventListener('change', filterInfluencers);
    document.getElementById('sortBy').addEventListener('change', filterInfluencers);
    
    // Modal handlers
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });
});

let allInfluencers = [];
let allCampaigns = [];

function initializeDashboard() {
    const menuLinks = document.querySelectorAll('.menu-link');
    const sections = document.querySelectorAll('.section');

    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            
            menuLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(targetId).classList.add('active');
        });
    });
}

async function loadProfile() {
    try {
        const response = await fetch('/api/users/profile', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const profile = await response.json();
            
            document.getElementById('profileName').value = profile.name || '';
            document.getElementById('profileEmail').value = profile.email || '';
            document.getElementById('companyName').value = profile.company_name || '';
            document.getElementById('companyWebsite').value = profile.company_website || '';
            document.getElementById('companyDescription').value = profile.company_description || '';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

async function loadOverviewData() {
    try {
        const response = await fetch('/api/campaigns/brand', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const campaigns = await response.json();
            const totalCampaigns = campaigns.length;
            const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
            const totalApplications = campaigns.reduce((sum, c) => sum + c.applicants, 0);

            document.getElementById('totalCampaigns').textContent = totalCampaigns;
            document.getElementById('activeCampaigns').textContent = activeCampaigns;
            document.getElementById('totalApplications').textContent = totalApplications;
        }
    } catch (error) {
        console.error('Error loading overview data:', error);
    }
}

async function loadCampaigns() {
    try {
        const response = await fetch('/api/campaigns/brand', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            allCampaigns = await response.json();
            const tbody = document.querySelector('#campaignsTable tbody');
            tbody.innerHTML = '';

            allCampaigns.forEach(campaign => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${campaign.title}</td>
                    <td>${campaign.platform}</td>
                    <td><span class="badge badge-${getStatusColor(campaign.status)}">${campaign.status}</span></td>
                    <td>$${parseFloat(campaign.budget || 0).toFixed(2)}</td>
                    <td>${campaign.applicants}</td>
                    <td>${new Date(campaign.created_at).toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-sm btn-secondary" onclick="editCampaign(${campaign.id})">Edit</button>
                        <button class="btn btn-sm btn-error" onclick="deleteCampaign(${campaign.id})">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            // Update invite campaign select
            updateInviteCampaignSelect();
        }
    } catch (error) {
        console.error('Error loading campaigns:', error);
    }
}

async function loadInfluencers() {
    try {
        const token = localStorage.getItem('token');
        console.log('Loading influencers...');
        const response = await fetch('http://localhost:3000/api/users/influencers', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Response status:', response.status);
        
        if (response.ok) {
            allInfluencers = await response.json();
            console.log('Loaded influencers:', allInfluencers);
            displayInfluencers(allInfluencers);
        } else {
            const errorText = await response.text();
            console.error('Failed to load influencers:', response.status, errorText);
            showMessage('Failed to load influencers', 'error');
            
            // Show empty state
            const container = document.getElementById('influencersList');
            container.innerHTML = '<p class="text-center">Failed to load influencers. Please try again.</p>';
        }
    } catch (error) {
        console.error('Error loading influencers:', error);
        showMessage('Network error loading influencers', 'error');
        
        // Show empty state
        const container = document.getElementById('influencersList');
        container.innerHTML = '<p class="text-center">Network error. Please try again.</p>';
    }
}


function displayInfluencers(influencers) {
    const container = document.getElementById('influencersList');
    container.innerHTML = '';

    if (influencers.length === 0) {
        container.innerHTML = '<p class="text-center">No influencers found</p>';
        return;
    }

    influencers.forEach(influencer => {
        const totalFollowers = (influencer.instagram_followers || 0) +
                              (influencer.youtube_followers || 0) +
                              (influencer.twitter_followers || 0) +
                              (influencer.linkedin_followers || 0) +
                              (influencer.tiktok_followers || 0) +
                              (influencer.facebook_followers || 0);

        const card = document.createElement('div');
        card.className = 'card influencer-card';
        card.innerHTML = `
            <div class="card-header">
                <h3>${influencer.name}</h3>
                <div class="rating-display">
                    ${generateStars(influencer.average_rating || 0)}
                    <span>(${Number(influencer.average_rating || 0).toFixed(1)}/5 - ${influencer.total_ratings || 0} ratings)</span>
                </div>
            </div>
            <div class="card-body">
                <p><strong>Email:</strong> ${influencer.email}</p>
                <p><strong>Age:</strong> ${influencer.age || 'Not specified'}</p>
                <p><strong>Location:</strong> ${influencer.location || 'Not specified'}</p>
                <p><strong>Occupation:</strong> ${influencer.occupation || 'Not specified'}</p>
                <p><strong>Interests:</strong> ${influencer.interests || 'Not specified'}</p>
                <p><strong>Total Followers:</strong> ${totalFollowers.toLocaleString()}</p>
                <p><strong>Total Earnings:</strong> $${parseFloat(influencer.total_earnings || 0).toFixed(2)}</p>
                
                <div class="social-media-preview">
                    <h5>Social Media:</h5>
                    ${influencer.instagram_handle ? `
                        <div class="social-platform">
                            <i class="fab fa-instagram"></i>
                            <a href="${influencer.instagram_link || '#'}" target="_blank">${influencer.instagram_handle}</a>
                            <span>(${(influencer.instagram_followers || 0).toLocaleString()} followers)</span>
                        </div>
                    ` : ''}
                    ${influencer.youtube_handle ? `
                        <div class="social-platform">
                            <i class="fab fa-youtube"></i>
                            <a href="${influencer.youtube_link || '#'}" target="_blank">${influencer.youtube_handle}</a>
                            <span>(${(influencer.youtube_followers || 0).toLocaleString()} subscribers)</span>
                        </div>
                    ` : ''}
                    ${influencer.twitter_handle ? `
                        <div class="social-platform">
                            <i class="fab fa-twitter"></i>
                            <a href="${influencer.twitter_link || '#'}" target="_blank">${influencer.twitter_handle}</a>
                            <span>(${(influencer.twitter_followers || 0).toLocaleString()} followers)</span>
                        </div>
                    ` : ''}
                    ${influencer.linkedin_handle ? `
                        <div class="social-platform">
                            <i class="fab fa-linkedin"></i>
                            <a href="${influencer.linkedin_link || '#'}" target="_blank">${influencer.linkedin_handle}</a>
                            <span>(${(influencer.linkedin_followers || 0).toLocaleString()} connections)</span>
                        </div>
                    ` : ''}
                    ${influencer.tiktok_handle ? `
                        <div class="social-platform">
                            <i class="fab fa-tiktok"></i>
                            <a href="${influencer.tiktok_link || '#'}" target="_blank">${influencer.tiktok_handle}</a>
                            <span>(${(influencer.tiktok_followers || 0).toLocaleString()} followers)</span>
                        </div>
                    ` : ''}
                    ${influencer.facebook_handle ? `
                        <div class="social-platform">
                            <i class="fab fa-facebook"></i>
                            <a href="${influencer.facebook_link || '#'}" target="_blank">${influencer.facebook_handle}</a>
                            <span>(${(influencer.facebook_followers || 0).toLocaleString()} followers)</span>
                        </div>
                    ` : ''}
                </div>
                
                <p><strong>Joined:</strong> ${new Date(influencer.created_at).toLocaleDateString()}</p>
            </div>
            <div class="card-footer">
                <button class="btn btn-primary btn-sm" onclick="inviteInfluencer(${influencer.id})">Invite</button>
               
                <button class="btn btn-warning btn-sm" onclick="rateInfluencer(${influencer.id}, null)">Rate</button>
            </div>
        `;
        container.appendChild(card);
    });
}
async function loadApplications() {
    try {
        const response = await fetch('/api/applications/brand', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const applications = await response.json();
            const tbody = document.querySelector('#applicationsTable tbody');
            tbody.innerHTML = '';

            applications.forEach(application => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${application.campaign_title}</td>
                    <td><a href="#" onclick="viewInfluencerProfile(${application.influencer_id})" class="influencer-link">${application.influencer_name}</a></td>
                    <td>${application.influencer_email}</td>
                    <td><span class="badge badge-${getStatusColor(application.status)}">${application.status}</span></td>
                    <td>${new Date(application.applied_at).toLocaleDateString()}</td>
                    <td>
                        ${application.status === 'pending' ? `
                            <button class="btn btn-sm btn-success" onclick="updateApplicationStatus(${application.id}, 'approved')">Approve</button>
                            <button class="btn btn-sm btn-error" onclick="updateApplicationStatus(${application.id}, 'rejected')">Reject</button>
                        ` : ''}
                        <button class="btn btn-sm btn-secondary" onclick="viewApplicationDetails(${application.id})">View Details</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error loading applications:', error);
    }
}

async function loadCampaignCategories() {
    try {
        const response = await fetch('/api/campaigns/categories');
        if (response.ok) {
            const categories = await response.json();
            const select = document.querySelector('select[name="category_id"]');
            
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        company_name: formData.get('company_name'),
        company_website: formData.get('company_website'),
        company_description: formData.get('company_description')
    };

    try {
        const response = await fetch('/api/users/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showMessage('Profile updated successfully!', 'success');
        } else {
            const result = await response.json();
            showMessage(result.message || 'Failed to update profile', 'error');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

async function handleCreateCampaign(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        title: formData.get('title'),
        description: formData.get('description'),
        platform: formData.get('platform'),
        category_id: formData.get('category_id') || null,
        budget: formData.get('budget'),
        status: formData.get('status'),
        requirements: formData.get('requirements')
    };

    try {
        const response = await fetch('/api/campaigns', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showMessage('Campaign created successfully!', 'success');
            e.target.reset();
            loadCampaigns();
            loadOverviewData();
        } else {
            const result = await response.json();
            showMessage(result.message || 'Failed to create campaign', 'error');
        }
    } catch (error) {
        console.error('Error creating campaign:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

async function editCampaign(campaignId) {
    const campaign = allCampaigns.find(c => c.id === campaignId);
    if (!campaign) {
        showMessage('Campaign not found', 'error');
        return;
    }

    document.getElementById('editCampaignId').value = campaign.id;
    document.getElementById('editTitle').value = campaign.title;
    document.getElementById('editDescription').value = campaign.description;
    document.getElementById('editPlatform').value = campaign.platform;
    document.getElementById('editBudget').value = campaign.budget || '';
    document.getElementById('editStatus').value = campaign.status;
    document.getElementById('editRequirements').value = campaign.requirements || '';

    document.getElementById('editCampaignModal').classList.add('show');
}

async function handleEditCampaign(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const campaignId = document.getElementById('editCampaignId').value;
    const data = {
        title: formData.get('title'),
        description: formData.get('description'),
        platform: formData.get('platform'),
        budget: formData.get('budget'),
        status: formData.get('status'),
        requirements: formData.get('requirements')
    };

    try {
        const response = await fetch(`/api/campaigns/${campaignId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showMessage('Campaign updated successfully!', 'success');
            closeModals();
            loadCampaigns();
        } else {
            const result = await response.json();
            showMessage(result.message || 'Failed to update campaign', 'error');
        }
    } catch (error) {
        console.error('Error updating campaign:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

async function deleteCampaign(campaignId) {
    if (!confirm('Are you sure you want to delete this campaign?')) {
        return;
    }

    try {
        const response = await fetch(`/api/campaigns/${campaignId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            showMessage('Campaign deleted successfully!', 'success');
            loadCampaigns();
            loadOverviewData();
        } else {
            showMessage('Failed to delete campaign', 'error');
        }
    } catch (error) {
        console.error('Error deleting campaign:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

function inviteInfluencer(influencerId) {
    document.getElementById('inviteInfluencerId').value = influencerId;
    updateInviteCampaignSelect();
    document.getElementById('inviteModal').classList.add('show');
}

function updateInviteCampaignSelect() {
    const select = document.getElementById('inviteCampaignSelect');
    select.innerHTML = '<option value="">Choose a campaign...</option>';
    
    allCampaigns.filter(c => c.status === 'active').forEach(campaign => {
        const option = document.createElement('option');
        option.value = campaign.id;
        option.textContent = `${campaign.title} (${campaign.platform}) - $${campaign.budget || 0}`;
        select.appendChild(option);
    });
}

async function handleInviteInfluencer(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        influencer_id: parseInt(document.getElementById('inviteInfluencerId').value),
        campaign_id: parseInt(formData.get('campaign_id')),
        message: formData.get('message')
    };

    try {
        const response = await fetch('/api/invitations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showMessage('Invitation sent successfully!', 'success');
            closeModals();
        } else {
            const result = await response.json();
            showMessage(result.message || 'Failed to send invitation', 'error');
        }
    } catch (error) {
        console.error('Error sending invitation:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

async function viewInfluencerProfile(influencerId) {
    try {
        const [profileResponse, applicationsResponse, ratingsResponse] = await Promise.all([
            fetch(`/api/users/${influencerId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            }),
            fetch(`/api/applications/influencer/${influencerId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            }),
            fetch(`/api/ratings/influencer/${influencerId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
        ]);

        if (profileResponse.ok) {
            const influencer = await profileResponse.json();
            let pastCampaigns = [];
            let ratings = [];
            
            if (applicationsResponse.ok) {
                pastCampaigns = await applicationsResponse.json();
            }
            
            if (ratingsResponse.ok) {
                ratings = await ratingsResponse.json();
            }

            const content = document.getElementById('influencerProfileContent');
            
            const totalFollowers = (influencer.instagram_followers || 0) +
                                  (influencer.youtube_followers || 0) +
                                  (influencer.twitter_followers || 0) +
                                  (influencer.linkedin_followers || 0) +
                                  (influencer.tiktok_followers || 0) +
                                  (influencer.facebook_followers || 0);

            content.innerHTML = `
                <div class="influencer-profile-details">
                    <div class="profile-header">
                        <h4>${influencer.name}</h4>
                        <div class="rating-display">
                            ${generateStars(influencer.average_rating || 0)}
                            <span>(${(influencer.average_rating || 0).toFixed(1)}/5 from ${influencer.total_ratings || 0} ratings)</span>
                        </div>
                    </div>
                    
                    <div class="profile-info">
                        <p><strong>Email:</strong> ${influencer.email}</p>
                        <p><strong>Age:</strong> ${influencer.age || 'Not specified'}</p>
                        <p><strong>Location:</strong> ${influencer.location || 'Not specified'}</p>
                        <p><strong>Occupation:</strong> ${influencer.occupation || 'Not specified'}</p>
                        <p><strong>Interests:</strong> ${influencer.interests || 'Not specified'}</p>
                        <p><strong>Total Followers:</strong> ${totalFollowers.toLocaleString()}</p>
                        <p><strong>Total Earnings:</strong> $${parseFloat(influencer.total_earnings || 0).toFixed(2)}</p>
                    </div>

                    <div class="social-media-details">
                        <h5>Social Media Handles:</h5>
                        ${influencer.instagram_handle ? `
                            <div class="social-platform">
                                <i class="fab fa-instagram"></i>
                                <a href="${influencer.instagram_link || '#'}" target="_blank">${influencer.instagram_handle}</a>
                                <span>(${(influencer.instagram_followers || 0).toLocaleString()} followers)</span>
                            </div>
                        ` : ''}
                        ${influencer.youtube_handle ? `
                            <div class="social-platform">
                                <i class="fab fa-youtube"></i>
                                <a href="${influencer.youtube_link || '#'}" target="_blank">${influencer.youtube_handle}</a>
                                <span>(${(influencer.youtube_followers || 0).toLocaleString()} subscribers)</span>
                            </div>
                        ` : ''}
                        ${influencer.twitter_handle ? `
                            <div class="social-platform">
                                <i class="fab fa-twitter"></i>
                                <a href="${influencer.twitter_link || '#'}" target="_blank">${influencer.twitter_handle}</a>
                                <span>(${(influencer.twitter_followers || 0).toLocaleString()} followers)</span>
                            </div>
                        ` : ''}
                        ${influencer.linkedin_handle ? `
                            <div class="social-platform">
                                <i class="fab fa-linkedin"></i>
                                <a href="${influencer.linkedin_link || '#'}" target="_blank">${influencer.linkedin_handle}</a>
                                <span>(${(influencer.linkedin_followers || 0).toLocaleString()} connections)</span>
                            </div>
                        ` : ''}
                        ${influencer.tiktok_handle ? `
                            <div class="social-platform">
                                <i class="fab fa-tiktok"></i>
                                <a href="${influencer.tiktok_link || '#'}" target="_blank">${influencer.tiktok_handle}</a>
                                <span>(${(influencer.tiktok_followers || 0).toLocaleString()} followers)</span>
                            </div>
                        ` : ''}
                        ${influencer.facebook_handle ? `
                            <div class="social-platform">
                                <i class="fab fa-facebook"></i>
                                <a href="${influencer.facebook_link || '#'}" target="_blank">${influencer.facebook_handle}</a>
                                <span>(${(influencer.facebook_followers || 0).toLocaleString()} followers)</span>
                            </div>
                        ` : ''}
                    </div>

                    <div class="past-campaigns">
                        <h5>Past Campaigns:</h5>
                        ${pastCampaigns.length > 0 ? pastCampaigns.map(campaign => `
                            <div class="campaign-item">
                                <p><strong>${campaign.campaign_title}</strong></p>
                                <p>Brand: ${campaign.brand_name}</p>
                                <p>Status: <span class="badge badge-${getStatusColor(campaign.status)}">${campaign.status}</span></p>
                                <p>Applied: ${new Date(campaign.applied_at).toLocaleDateString()}</p>
                                ${campaign.earnings ? `<p>Earnings: $${parseFloat(campaign.earnings).toFixed(2)}</p>` : ''}
                            </div>
                        `).join('') : '<p>No past campaigns</p>'}
                    </div>

                    <div class="ratings-section">
                        <h5>Recent Ratings:</h5>
                        ${ratings.length > 0 ? ratings.slice(0, 5).map(rating => `
                            <div class="rating-item">
                                <div class="rating-display">
                                    ${generateStars(rating.rating)}
                                    <span>(${rating.rating}/5)</span>
                                </div>
                                <p><strong>From:</strong> ${rating.brand_name}</p>
                                ${rating.campaign_title ? `<p><strong>Campaign:</strong> ${rating.campaign_title}</p>` : ''}
                                ${rating.comment ? `<p><em>"${rating.comment}"</em></p>` : ''}
                                <p class="text-muted">${new Date(rating.created_at).toLocaleDateString()}</p>
                            </div>
                        `).join('') : '<p>No ratings yet</p>'}
                    </div>
                </div>
            `;
            
            document.getElementById('influencerProfileModal').classList.add('show');
        } else {
            showMessage('Failed to load influencer profile', 'error');
        }
    } catch (error) {
        console.error('Error loading influencer profile:', error);
        showMessage('Failed to load influencer profile', 'error');
    }
}

async function viewApplicationDetails(applicationId) {
    try {
        const response = await fetch(`/api/applications/${applicationId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const application = await response.json();
            const content = document.getElementById('applicationDetailsContent');
            
            content.innerHTML = `
                <div class="application-details">
                    <h4>Application Details</h4>
                    <div class="mb-3">
                        <p><strong>Campaign:</strong> ${application.campaign_title}</p>
                        <p><strong>Influencer:</strong> ${application.influencer_name}</p>
                        <p><strong>Email:</strong> ${application.influencer_email}</p>
                        <p><strong>Status:</strong> <span class="badge badge-${getStatusColor(application.status)}">${application.status}</span></p>
                        <p><strong>Applied:</strong> ${new Date(application.applied_at).toLocaleDateString()}</p>
                    </div>
                    
                    <div class="mb-3">
                        <h5>Influencer Profile:</h5>
                        <p><strong>Age:</strong> ${application.age || 'Not specified'}</p>
                        <p><strong>Location:</strong> ${application.location || 'Not specified'}</p>
                        <p><strong>Occupation:</strong> ${application.occupation || 'Not specified'}</p>
                        <p><strong>Interests:</strong> ${application.interests || 'Not specified'}</p>
                    </div>
                    
                    <div class="mb-3">
                        <h5>Application Message:</h5>
                        <p>${application.message}</p>
                    </div>
                    
                    ${application.brand_feedback ? `
                        <div class="mb-3">
                            <h5>Brand Feedback:</h5>
                            <p>${application.brand_feedback}</p>
                        </div>
                    ` : ''}
                    
                    ${application.rating ? `
                        <div class="mb-3">
                            <h5>Rating:</h5>
                            <div class="rating-display">
                                ${generateStars(application.rating)}
                                <span>(${application.rating}/5)</span>
                            </div>
                            ${application.rating_comment ? `<p><em>${application.rating_comment}</em></p>` : ''}
                        </div>
                    ` : ''}
                    
                    ${application.earnings ? `
                        <div class="mb-3">
                            <h5>Earnings:</h5>
                            <p class="earnings-amount">$${parseFloat(application.earnings).toFixed(2)}</p>
                        </div>
                    ` : ''}
                </div>
            `;
            
            document.getElementById('applicationDetailsModal').classList.add('show');
        }
    } catch (error) {
        console.error('Error loading application details:', error);
        showMessage('Failed to load application details', 'error');
    }
}

function rateInfluencer(influencerId, campaignId) {
    document.getElementById('rateInfluencerId').value = influencerId;
    document.getElementById('rateCampaignId').value = campaignId || '';
    document.getElementById('rateInfluencerModal').classList.add('show');
}

async function handleRateInfluencer(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        influencer_id: parseInt(document.getElementById('rateInfluencerId').value),
        campaign_id: parseInt(document.getElementById('rateCampaignId').value) || null,
        rating: parseInt(formData.get('rating')),
        comment: formData.get('comment')
    };

    try {
        const response = await fetch('/api/ratings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showMessage('Rating submitted successfully!', 'success');
            closeModals();
            loadInfluencers();
        } else {
            const result = await response.json();
            showMessage(result.message || 'Failed to submit rating', 'error');
        }
    } catch (error) {
        console.error('Error submitting rating:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

async function updateApplicationStatus(applicationId, status) {
    try {
        console.log('Updating application status:', applicationId, 'to:', status);
        
        const response = await fetch(`/api/applications/${applicationId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ status })
        });

        console.log('Response status:', response.status);
        
        if (response.ok) {
            showMessage(`Application ${status} successfully`, 'success');
            loadApplications();
            loadOverviewData();
            loadInfluencers(); // Refresh to show updated earnings
        } else {
            const result = await response.json();
            console.error('Error response:', result);
            showMessage(result.message || 'Failed to update application status', 'error');
        }
    } catch (error) {
        console.error('Error updating application status:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

function filterInfluencers() {
    const searchTerm = document.getElementById('searchInfluencers').value.toLowerCase();
    const interestFilter = document.getElementById('filterInterest').value;
    const sortBy = document.getElementById('sortBy').value;
    
    let filteredInfluencers = allInfluencers.filter(influencer => {
        const matchesSearch = influencer.name.toLowerCase().includes(searchTerm) ||
                             influencer.email.toLowerCase().includes(searchTerm);
        
        const matchesInterest = !interestFilter || 
                               (influencer.interests && influencer.interests.includes(interestFilter));
        
        return matchesSearch && matchesInterest;
    });
    
    // Sort influencers
    if (sortBy === 'rating') {
        filteredInfluencers.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
    } else if (sortBy === 'followers') {
        filteredInfluencers.sort((a, b) => {
            const aFollowers = (a.instagram_followers || 0) + (a.youtube_followers || 0) + (a.twitter_followers || 0);
            const bFollowers = (b.instagram_followers || 0) + (b.youtube_followers || 0) + (b.twitter_followers || 0);
            return bFollowers - aFollowers;
        });
    } else if (sortBy === 'recent') {
        filteredInfluencers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    
    displayInfluencers(filteredInfluencers);
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
    document.querySelectorAll('form').forEach(form => {
        if (form.id !== 'profileForm' && form.id !== 'createCampaignForm') {
            form.reset();
        }
    });
}

function getStatusColor(status) {
    switch(status) {
        case 'approved': return 'success';
        case 'active': return 'success';
        case 'pending': return 'warning';
        case 'rejected': return 'error';
        case 'inactive': return 'error';
        case 'completed': return 'info';
        default: return 'info';
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;
    messageDiv.classList.remove('hidden');
    
    setTimeout(() => {
        messageDiv.classList.add('hidden');
    }, 5000);
}