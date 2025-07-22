// Campaigns page functionality
document.addEventListener('DOMContentLoaded', function() {
    loadCampaigns();
    
    // Search and filter functionality
    document.getElementById('searchCampaigns').addEventListener('input', filterCampaigns);
    document.getElementById('filterInterest').addEventListener('change', filterCampaigns);
    document.getElementById('filterPlatform').addEventListener('change', filterCampaigns);
    document.getElementById('filterStatus').addEventListener('change', filterCampaigns);
    
    // Application modal
    document.getElementById('applicationForm').addEventListener('submit', handleApplicationSubmit);
    document.querySelector('.modal-close').addEventListener('click', closeModal);
});

let allCampaigns = [];

async function loadCampaigns() {
    try {
        const response = await fetch('/api/campaigns');
        
        if (response.ok) {
            allCampaigns = await response.json();
            displayCampaigns(allCampaigns);
        } else {
            showMessage('Failed to load campaigns', 'error');
        }
    } catch (error) {
        console.error('Error loading campaigns:', error);
        showMessage('Network error. Please try again.', 'error');
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
                <p><strong>Applicants:</strong> ${campaign.applicants}</p>
                <p><strong>Created:</strong> ${new Date(campaign.created_at).toLocaleDateString()}</p>
            </div>
            <div class="card-footer">
                <button class="btn btn-primary" onclick="openApplicationModal(${campaign.id}, '${campaign.title}')">Apply Now</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function filterCampaigns() {
    const searchTerm = document.getElementById('searchCampaigns').value.toLowerCase();
    const interestFilter = document.getElementById('filterInterest').value;
    const platformFilter = document.getElementById('filterPlatform').value;
    const statusFilter = document.getElementById('filterStatus').value;
    
    let filteredCampaigns = allCampaigns.filter(campaign => {
        const matchesSearch = campaign.title.toLowerCase().includes(searchTerm) ||
                             campaign.description.toLowerCase().includes(searchTerm) ||
                             campaign.brand_name.toLowerCase().includes(searchTerm);
        
        const matchesInterest = !interestFilter || campaign.category_name === interestFilter;
        const matchesPlatform = !platformFilter || campaign.platform === platformFilter;
        const matchesStatus = !statusFilter || campaign.status === statusFilter;
        
        return matchesSearch && matchesInterest && matchesPlatform && matchesStatus;
    });
    
    displayCampaigns(filteredCampaigns);
}

function openApplicationModal(campaignId, campaignTitle) {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
        showMessage('Please login to apply for campaigns', 'error');
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
        return;
    }
    
    if (user.role !== 'influencer') {
        showMessage('Only influencers can apply to campaigns', 'error');
        return;
    }
    
    // Set campaign data in modal
    document.getElementById('campaignId').value = campaignId;
    document.getElementById('campaignTitle').textContent = campaignTitle;
    
    // Show modal
    document.getElementById('applicationModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('applicationModal').classList.add('hidden');
    document.getElementById('applicationForm').reset();
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
            closeModal();
            loadCampaigns(); // Refresh campaigns to update applicant count
        } else {
            showMessage(result.message || 'Failed to submit application', 'error');
        }
    } catch (error) {
        console.error('Error submitting application:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

function getStatusColor(status) {
    switch(status) {
        case 'active': return 'success';
        case 'inactive': return 'error';
        case 'completed': return 'info';
        default: return 'warning';
    }
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