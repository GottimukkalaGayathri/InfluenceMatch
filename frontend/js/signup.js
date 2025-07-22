// Signup functionality
document.addEventListener('DOMContentLoaded', function() {
    // Role selection functionality
    const roleOptions = document.querySelectorAll('input[name="role"]');
    const signupForms = document.querySelectorAll('.signup-form');

    roleOptions.forEach(option => {
        option.addEventListener('change', function() {
            // Hide all forms first
            signupForms.forEach(form => {
                form.classList.add('hidden');
            });

            // Show selected form
            const selectedRole = this.value;
            const targetForm = document.getElementById(`${selectedRole}Form`);
            if (targetForm) {
                targetForm.classList.remove('hidden');
                // Scroll to form
                targetForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Form submissions
    document.getElementById('influencerSignupForm').addEventListener('submit', handleInfluencerSignup);
    document.getElementById('brandSignupForm').addEventListener('submit', handleBrandRequest);
    document.getElementById('adminSignupForm').addEventListener('submit', handleAdminSignup);
});

async function handleInfluencerSignup(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
        age: formData.get('age'),
        location: formData.get('location'),
        occupation: formData.get('occupation'),
        interests: formData.get('interests'),
        role: 'influencer'
    };

    if (data.password !== data.confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            showMessage('Account created successfully! Please login.', 'success');
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } else {
            showMessage(result.message || 'Registration failed', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

async function handleBrandRequest(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        company: formData.get('company'),
        website: formData.get('website'),
        description: formData.get('description')
    };

    try {
        const response = await fetch('/api/brand-requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            showMessage('Brand request submitted successfully! We will review your application.', 'success');
            e.target.reset();
            document.getElementById('brandForm').classList.add('hidden');
        } else {
            showMessage(result.message || 'Request failed', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

async function handleAdminSignup(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const adminCode = formData.get('adminCode');

    // Simple admin code check (in real app, this would be more secure)
    if (adminCode !== 'ADMIN123') {
        showMessage('Invalid admin code', 'error');
        return;
    }

    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: 'admin'
    };

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            showMessage('Admin account created successfully! Please login.', 'success');
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } else {
            showMessage(result.message || 'Registration failed', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
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