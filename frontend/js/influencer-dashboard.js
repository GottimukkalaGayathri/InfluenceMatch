// Influencer dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!user || !token || user.role !== 'influencer') {
        window.location.href = '/login';
        return;
    }

    // Initialize dashboard
    initializeDashboard();
    loadProfile();
    loadApplications();
    loadInvitations();
    loadOverviewData();
    loadSocialMedia();

    // Event listeners
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Form handlers
    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
    document.getElementById('socialMediaForm').addEventListener('submit', handleSocialMediaUpdate);
    document.getElementById('applicationForm').addEventListener('submit', handleApplicationSubmit);
    
    // Search and filter
    document.getElementById('searchCampaigns').addEventListener('input', filterCampaigns);
    document.getElementById('filterInterest').addEventListener('change', filterCampaigns);
    document.getElementById('filterPlatform').addEventListener('change', filterCampaigns);
    
    // Modal handlers
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });
});

let allCampaigns = [];

function initializeDashboard() {
    const menuLinks = document.querySelectorAll('.menu-link');
    const sections = document.querySelectorAll('.section');

    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            showSection(targetId);
            
            // Load campaigns when browse-campaigns is clicked
            if (targetId === 'browse-campaigns') {
                loadInfluencerCampaigns();
            }
        });
    });
}

function showSection(targetId) {
    const menuLinks = document.querySelectorAll('.menu-link');
    const sections = document.querySelectorAll('.section');
    
    menuLinks.forEach(l => l.classList.remove('active'));
    sections.forEach(section => section.classList.remove('active'));
    
    const targetLink = document.querySelector(`[href="#${targetId}"]`);
    const targetSection = document.getElementById(targetId);
    
    if (targetLink) targetLink.classList.add('active');
    if (targetSection) targetSection.classList.add('active');
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
            document.getElementById('profileAge').value = profile.age || '';
            document.getElementById('profileLocation').value = profile.location || '';
            document.getElementById('profileOccupation').value = profile.occupation || '';
            document.getElementById('profileInterests').value = profile.interests || '';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

async function loadSocialMedia() {
    try {
        const response = await fetch('/api/users/profile', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const profile = await response.json();
            
            if (profile.socialMediaHandles) {
                const handles = profile.socialMediaHandles;
                const form = document.getElementById('socialMediaForm');
                
                Object.keys(handles).forEach(key => {
                    const input = form.querySelector(`[name="${key}"]`);
                    if (input && handles[key]) {
                        input.value = handles[key];
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error loading social media:', error);
    }
}

async function loadApplications() {
    try {
        const response = await fetch('/api/applications/influencer', {
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
                    <td>${application.brand_name}</td>
                    <td><span class="badge badge-${getStatusColor(application.status)}">${application.status}</span></td>
                    <td>${new Date(application.applied_at).toLocaleDateString()}</td>
                    <td>${application.rating ? generateStars(application.rating) : 'Not rated'}</td>
                    <td>$${parseFloat(application.earnings || 0).toFixed(2)}</td>
                    <td>
                        <button class="btn btn-sm btn-secondary" onclick="viewApplication(${application.id})">View</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error loading applications:', error);
    }
}

async function loadInvitations() {
    try {
        const response = await fetch('/api/invitations/influencer', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const invitations = await response.json();
            const container = document.getElementById('invitationsList');
            container.innerHTML = '';

            if (invitations.length === 0) {
                container.innerHTML = '<p class="text-center">No invitations yet</p>';
                return;
            }

            invitations.forEach(invitation => {
                const card = document.createElement('div');
                card.className = 'card mb-3';
                card.innerHTML = `
                    <div class="card-header">
                        <h4>${invitation.campaign_title}</h4>
                        <span class="badge badge-${getStatusColor(invitation.status)}">${invitation.status}</span>
                    </div>
                    <div class="card-body">
                        <p><strong>From:</strong> ${invitation.brand_name}</p>
                        <p><strong>Budget:</strong> $${invitation.budget}</p>
                        <p><strong>Platform:</strong> ${invitation.platform}</p>
                        ${invitation.message ? `<p><strong>Message:</strong> ${invitation.message}</p>` : ''}
                        <p><strong>Invited:</strong> ${new Date(invitation.created_at).toLocaleDateString()}</p>
                    </div>
                    <div class="card-footer">
                        ${invitation.status === 'pending' ? `
                            <button class="btn btn-success btn-sm" onclick="respondToInvitation(${invitation.id}, 'accepted')">Accept</button>
                            <button class="btn btn-error btn-sm" onclick="respondToInvitation(${invitation.id}, 'rejected')">Reject</button>
                        ` : `<span class="badge badge-${getStatusColor(invitation.status)}">${invitation.status}</span>`}
                    </div>
                `;
                container.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error loading invitations:', error);
    }
}

async function loadOverviewData() {
    try {
        const [applicationsRes, profileRes] = await Promise.all([
            fetch('/api/applications/influencer', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            }),
            fetch('/api/users/profile', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
        ]);

        if (applicationsRes.ok && profileRes.ok) {
            const applications = await applicationsRes.json();
            const profile = await profileRes.json();
            
            const totalApplications = applications.length;
            const approvedApplications = applications.filter(a => a.status === 'approved').length;
            const totalEarnings = applications
                .filter(a => a.status === 'approved' || a.status === 'completed')
                .reduce((sum, a) => sum + (parseFloat(a.earnings) || 0), 0);

            document.getElementById('totalApplications').textContent = totalApplications;
            document.getElementById('approvedApplications').textContent = approvedApplications;
            document.getElementById('totalEarnings').textContent = `$${totalEarnings.toFixed(2)}`;
            
            // Display rating
            const rating = parseFloat(profile.average_rating) || 0;
            document.getElementById('averageRating').textContent = rating.toFixed(1);
            document.getElementById('ratingStars').innerHTML = generateStars(rating);

            // Calculate total followers
            if (profile.socialMediaHandles) {
                const handles = profile.socialMediaHandles;
                const totalFollowers = (handles.instagram_followers || 0) +
                                     (handles.youtube_followers || 0) +
                                     (handles.twitter_followers || 0) +
                                     (handles.linkedin_followers || 0) +
                                     (handles.tiktok_followers || 0) +
                                     (handles.facebook_followers || 0);
                document.getElementById('totalFollowers').textContent = totalFollowers.toLocaleString();
            }

            // Load recent activity
            loadRecentActivity(applications);
        }
    } catch (error) {
        console.error('Error loading overview data:', error);
    }
}

function loadRecentActivity(applications) {
    const container = document.getElementById('recentActivity');
    const recentApps = applications
        .sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at))
        .slice(0, 3);

    if (recentApps.length === 0) {
        container.innerHTML = '<p>No recent activity</p>';
        return;
    }

    container.innerHTML = recentApps.map(app => `
        <div class="activity-item">
            <p><strong>${app.campaign_title}</strong></p>
            <p class="text-muted">${app.status} • ${new Date(app.applied_at).toLocaleDateString()}</p>
        </div>
    `).join('');
}

async function loadInfluencerCampaigns() {
    try {
        const response = await fetch('/api/campaigns/influencer', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            allCampaigns = await response.json();
            displayCampaigns(allCampaigns);
        }
    } catch (error) {
        console.error('Error loading campaigns:', error);
    }
}

function displayCampaigns(campaigns) {
    const container = document.getElementById('campaignsList');
    container.innerHTML = '';
    
    if (campaigns.length === 0) {
        container.innerHTML = '<p class="text-center">No campaigns found</p>';
        return;
    }

    campaigns.forEach(campaign => {
        const card = document.createElement('div');
        card.className = 'card campaign-card';
        card.innerHTML = `
            <div class="card-header">
                <h3>${campaign.title}</h3>
                <div class="flex justify-between items-center">
                    <span class="badge badge-info">${campaign.platform}</span>
                    <span class="badge badge-${getStatusColor(campaign.status)}">${campaign.status}</span>
                </div>
            </div>
            <div class="card-body">
                <p><strong>Brand:</strong> ${campaign.brand_name}</p>
                <p><strong>Description:</strong> ${campaign.description}</p>
                ${campaign.category_name ? `<p><strong>Category:</strong> ${campaign.category_name}</p>` : ''}
                ${campaign.budget ? `<p><strong>Budget:</strong> $${campaign.budget}</p>` : ''}
                ${campaign.requirements ? `<p><strong>Requirements:</strong> ${campaign.requirements}</p>` : ''}
                <p><strong>Created:</strong> ${new Date(campaign.created_at).toLocaleDateString()}</p>
            </div>
            <div class="card-footer">
                ${campaign.application_status === 'applied' ? 
                    '<span class="badge badge-warning">Already Applied</span>' :
                    `<button class="btn btn-primary" onclick="openApplicationModal(${campaign.id}, '${campaign.title}')">Apply Now</button>`
                }
            </div>
        `;
        container.appendChild(card);
    });
}

function filterCampaigns() {
    const searchTerm = document.getElementById('searchCampaigns').value.toLowerCase();
    const interestFilter = document.getElementById('filterInterest').value;
    const platformFilter = document.getElementById('filterPlatform').value;
    
    let filteredCampaigns = allCampaigns.filter(campaign => {
        const matchesSearch = campaign.title.toLowerCase().includes(searchTerm) ||
                             campaign.description.toLowerCase().includes(searchTerm) ||
                             campaign.brand_name.toLowerCase().includes(searchTerm);
        
        const matchesInterest = !interestFilter || campaign.category_name === interestFilter;
        const matchesPlatform = !platformFilter || campaign.platform === platformFilter;
        
        return matchesSearch && matchesInterest && matchesPlatform;
    });
    
    displayCampaigns(filteredCampaigns);
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        age: formData.get('age'),
        location: formData.get('location'),
        occupation: formData.get('occupation'),
        interests: formData.get('interests')
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
            loadOverviewData(); // Refresh overview
        } else {
            const result = await response.json();
            showMessage(result.message || 'Failed to update profile', 'error');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

async function handleSocialMediaUpdate(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {};
    
    // Get all form data
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }

    try {
        const response = await fetch('/api/users/social-media', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showMessage('Social media handles updated successfully!', 'success');
            loadOverviewData(); // Refresh follower count
        } else {
            const result = await response.json();
            showMessage(result.message || 'Failed to update social media handles', 'error');
        }
    } catch (error) {
        console.error('Error updating social media:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

function openApplicationModal(campaignId, campaignTitle) {
    document.getElementById('campaignId').value = campaignId;
    document.getElementById('campaignTitle').textContent = campaignTitle;
    document.getElementById('applicationModal').classList.add('show');
}

async function handleApplicationSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        campaign_id: parseInt(document.getElementById('campaignId').value),
        message: formData.get('message')
    };

    try {
        const response = await fetch('/api/applications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            showMessage('Application submitted successfully!', 'success');
            closeModals();
            loadInfluencerCampaigns(); // Refresh campaigns
            loadApplications(); // Refresh applications
            loadOverviewData(); // Refresh overview
        } else {
            showMessage(result.message || 'Failed to submit application', 'error');
        }
    } catch (error) {
        console.error('Error submitting application:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

async function viewApplication(applicationId) {
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
                <div class="mb-3">
                    <h4>Campaign: ${application.campaign_title}</h4>
                    <p><strong>Brand:</strong> ${application.brand_name}</p>
                    <p><strong>Status:</strong> <span class="badge badge-${getStatusColor(application.status)}">${application.status}</span></p>
                    <p><strong>Applied:</strong> ${new Date(application.applied_at).toLocaleDateString()}</p>
                </div>
                <div class="mb-3">
                    <h5>Your Message:</h5>
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
            `;
            
            document.getElementById('applicationDetailsModal').classList.add('show');
        }
    } catch (error) {
        console.error('Error loading application details:', error);
        showMessage('Failed to load application details', 'error');
    }
}

async function respondToInvitation(invitationId, status) {
    try {
        const response = await fetch(`/api/invitations/${invitationId}/respond`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            showMessage(`Invitation ${status} successfully!`, 'success');
            loadInvitations(); // Refresh invitations
            loadOverviewData(); // Refresh overview
        } else {
            const result = await response.json();
            showMessage(result.message || 'Failed to respond to invitation', 'error');
        }
    } catch (error) {
        console.error('Error responding to invitation:', error);
        showMessage('Network error. Please try again.', 'error');
    }
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
    document.getElementById('applicationForm').reset();
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