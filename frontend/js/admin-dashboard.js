// Admin dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!user || !token || user.role !== 'admin') {
        window.location.href = '/login';
        return;
    }

    // Initialize dashboard
    initializeDashboard();
    loadOverviewData();
    loadUsers();
    loadBrandRequests();
    loadCampaigns();
    loadAnalytics();

    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
});

function initializeDashboard() {
    // Menu navigation
    const menuLinks = document.querySelectorAll('.menu-link');
    const sections = document.querySelectorAll('.section');

    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            
            // Update active menu item
            menuLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show target section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
        });
    });
}

async function loadOverviewData() {
    try {
        // Load users count
        const usersResponse = await fetch('/api/users', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        // Load campaigns count
        const campaignsResponse = await fetch('/api/campaigns', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        // Load brand requests count
        const brandRequestsResponse = await fetch('/api/brand-requests', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        // Load applications count
        const applicationsResponse = await fetch('/api/applications/brand', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (usersResponse.ok && campaignsResponse.ok && brandRequestsResponse.ok) {
            const users = await usersResponse.json();
            const campaigns = await campaignsResponse.json();
            const brandRequests = await brandRequestsResponse.json();

            const totalUsers = users.length;
            const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
            const pendingRequests = brandRequests.filter(r => r.status === 'pending').length;

            document.getElementById('totalUsers').textContent = totalUsers;
            document.getElementById('activeCampaigns').textContent = activeCampaigns;
            document.getElementById('pendingRequests').textContent = pendingRequests;

            // Try to get applications count
            if (applicationsResponse.ok) {
                const applications = await applicationsResponse.json();
                document.getElementById('totalApplications').textContent = applications.length;
            } else {
                document.getElementById('totalApplications').textContent = '0';
            }
        }
    } catch (error) {
        console.error('Error loading overview data:', error);
        // Set default values if there's an error
        document.getElementById('totalUsers').textContent = '0';
        document.getElementById('activeCampaigns').textContent = '0';
        document.getElementById('pendingRequests').textContent = '0';
        document.getElementById('totalApplications').textContent = '0';
    }
}

async function loadUsers() {
    try {
        const response = await fetch('/api/users', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const users = await response.json();
            const tbody = document.querySelector('#usersTable tbody');
            tbody.innerHTML = '';

            users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td><span class="badge badge-info">${user.role}</span></td>
                    <td><span class="badge badge-success">${user.status}</span></td>
                    <td>${new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-sm btn-secondary" onclick="viewUser(${user.id})">View</button>
                        <button class="btn btn-sm btn-error" onclick="deleteUser(${user.id})">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function loadBrandRequests() {
    try {
        const response = await fetch('/api/brand-requests', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const requests = await response.json();
            const tbody = document.querySelector('#brandRequestsTable tbody');
            tbody.innerHTML = '';

            requests.forEach(request => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${request.id}</td>
                    <td>${request.name}</td>
                    <td>${request.email}</td>
                    <td>${request.company}</td>
                    <td><a href="${request.website}" target="_blank">${request.website}</a></td>
                    <td><span class="badge badge-${getStatusColor(request.status)}">${request.status}</span></td>
                    <td>
                        ${request.status === 'pending' ? `
                            <button class="btn btn-sm btn-success" onclick="updateBrandRequestStatus(${request.id}, 'approved')">Approve</button>
                            <button class="btn btn-sm btn-error" onclick="updateBrandRequestStatus(${request.id}, 'rejected')">Reject</button>
                        ` : `<span class="badge badge-${getStatusColor(request.status)}">${request.status}</span>`}
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error loading brand requests:', error);
    }
}

async function loadCampaigns() {
    try {
        const response = await fetch('/api/campaigns', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const campaigns = await response.json();
            const tbody = document.querySelector('#campaignsTable tbody');
            tbody.innerHTML = '';

            campaigns.forEach(campaign => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${campaign.id}</td>
                    <td>${campaign.title}</td>
                    <td>${campaign.brand_name}</td>
                    <td>${campaign.platform}</td>
                    <td><span class="badge badge-${getStatusColor(campaign.status)}">${campaign.status}</span></td>
                    <td>${campaign.applicants}</td>
                    <td>${new Date(campaign.created_at).toLocaleDateString()}</td>
                `;
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error loading campaigns:', error);
    }
}

async function loadAnalytics() {
    try {
        // Load basic analytics data
        const usersResponse = await fetch('/api/users', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const campaignsResponse = await fetch('/api/campaigns', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        const brandRequestsResponse = await fetch('/api/brand-requests', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (usersResponse.ok && campaignsResponse.ok && brandRequestsResponse.ok) {
            const users = await usersResponse.json();
            const campaigns = await campaignsResponse.json();
            const brandRequests = await brandRequestsResponse.json();

            // User Distribution Chart
            const userRoles = users.reduce((acc, user) => {
                acc[user.role] = (acc[user.role] || 0) + 1;
                return acc;
            }, {});

            const userCtx = document.getElementById('userChart').getContext('2d');
            new Chart(userCtx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(userRoles),
                    datasets: [{
                        data: Object.values(userRoles),
                        backgroundColor: ['#2563eb', '#10b981', '#f59e0b']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });

            // Campaign Status Chart
            const campaignStatus = campaigns.reduce((acc, campaign) => {
                acc[campaign.status] = (acc[campaign.status] || 0) + 1;
                return acc;
            }, {});

            const campaignCtx = document.getElementById('campaignChart').getContext('2d');
            new Chart(campaignCtx, {
                type: 'bar',
                data: {
                    labels: Object.keys(campaignStatus),
                    datasets: [{
                        label: 'Campaigns',
                        data: Object.values(campaignStatus),
                        backgroundColor: '#2563eb'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });

            // Brand Request Status Chart
            const brandRequestStatus = brandRequests.reduce((acc, request) => {
                acc[request.status] = (acc[request.status] || 0) + 1;
                return acc;
            }, {});

            const brandRequestCtx = document.getElementById('brandRequestChart').getContext('2d');
            new Chart(brandRequestCtx, {
                type: 'pie',
                data: {
                    labels: Object.keys(brandRequestStatus),
                    datasets: [{
                        data: Object.values(brandRequestStatus),
                        backgroundColor: ['#f59e0b', '#10b981', '#ef4444']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });

            // User Growth Chart (last 30 days)
            const last30Days = [];
            const today = new Date();
            for (let i = 29; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                last30Days.push(date.toISOString().split('T')[0]);
            }

            const userGrowth = last30Days.map(date => {
                return users.filter(user => 
                    user.created_at.split('T')[0] === date
                ).length;
            });

            const growthCtx = document.getElementById('growthChart').getContext('2d');
            new Chart(growthCtx, {
                type: 'line',
                data: {
                    labels: last30Days.map(date => new Date(date).toLocaleDateString()),
                    datasets: [{
                        label: 'New Users',
                        data: userGrowth,
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

async function updateBrandRequestStatus(requestId, status) {
    try {
        const response = await fetch(`/api/brand-requests/${requestId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            showMessage(`Brand request ${status} successfully`, 'success');
            loadBrandRequests();
            loadOverviewData();
        } else {
            showMessage('Failed to update brand request status', 'error');
        }
    } catch (error) {
        console.error('Error updating brand request status:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

async function viewUser(userId) {
    try {
        const response = await fetch(`/api/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const user = await response.json();
            alert(`User Details:\nName: ${user.name}\nEmail: ${user.email}\nRole: ${user.role}\nStatus: ${user.status}\nCreated: ${new Date(user.created_at).toLocaleDateString()}`);
        } else {
            showMessage('Failed to load user details', 'error');
        }
    } catch (error) {
        console.error('Error loading user details:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }

    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            showMessage('User deleted successfully', 'success');
            loadUsers();
            loadOverviewData();
        } else {
            showMessage('Failed to delete user', 'error');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

function getStatusColor(status) {
    switch(status) {
        case 'active': return 'success';
        case 'pending': return 'warning';
        case 'approved': return 'success';
        case 'rejected': return 'error';
        case 'inactive': return 'error';
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