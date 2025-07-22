// Login functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');

    // Auto-fill from localStorage
    const savedEmail = localStorage.getItem('lastEmail');
    if (savedEmail) {
        document.querySelector('input[name="email"]').value = savedEmail;
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                // Save to localStorage
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                localStorage.setItem('lastEmail', data.email);

                showMessage('Login successful!', 'success');
                
                // Redirect based on role
                setTimeout(() => {
                    switch(result.user.role) {
                        case 'admin':
                            window.location.href = '/admin-dashboard';
                            break;
                        case 'brand':
                            window.location.href = '/brand-dashboard';
                            break;
                        case 'influencer':
                            window.location.href = '/influencer-dashboard';
                            break;
                        default:
                            window.location.href = '/';
                    }
                }, 1000);
            } else {
                showMessage(result.message || 'Login failed', 'error');
            }
        } catch (error) {
            showMessage('Network error. Please try again.', 'error');
        }
    });
});

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;
    messageDiv.classList.remove('hidden');
    
    setTimeout(() => {
        messageDiv.classList.add('hidden');
    }, 5000);
}