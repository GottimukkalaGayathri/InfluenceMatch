const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/campaigns', require('./routes/campaigns'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/brand-requests', require('./routes/brandRequests'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/invitations', require('./routes/invitations'));
app.use('/api/ratings', require('./routes/ratings'));


// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/signup.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin-dashboard.html'));
});

app.get('/brand-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/brand-dashboard.html'));
});

app.get('/influencer-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/influencer-dashboard.html'));
});

app.get('/campaigns', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/campaigns.html'));
});

app.get('/forgot-password', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/forgot-password.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});