const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { sendEmail, emailTemplates } = require('../config/email');
const router = express.Router();

// Submit brand request
router.post('/', async (req, res) => {
    try {
        const { name, email, password, website, company, description } = req.body;
        
        // Check if request already exists
        const [existing] = await db.execute('SELECT * FROM brand_requests WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Brand request already submitted for this email' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await db.execute(
            'INSERT INTO brand_requests (name, email, password, website, company, description) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, website, company, description || null]
        );

        res.json({ message: 'Brand request submitted successfully' });
    } catch (error) {
        console.error('Submit brand request error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all brand requests (admin only)
router.get('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM brand_requests ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (error) {
        console.error('Get brand requests error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update brand request status
router.put('/:id/status', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const { status } = req.body;
        
        // Get brand request details
        const [brandRequest] = await db.execute(
            'SELECT * FROM brand_requests WHERE id = ?',
            [req.params.id]
        );
        
        if (brandRequest.length === 0) {
            return res.status(404).json({ message: 'Brand request not found' });
        }
        
        const request = brandRequest[0];
        
        // Update status
        await db.execute(
            'UPDATE brand_requests SET status = ?, approved_at = ? WHERE id = ?',
            [status, status === 'approved' ? new Date() : null, req.params.id]
        );
        
        // If approved, create brand user account and send email
        if (status === 'approved') {
            // Check if user already exists
            const [existingUser] = await db.execute('SELECT * FROM users WHERE email = ?', [request.email]);
            
            if (existingUser.length === 0) {
                // Create brand user with the password from request
                await db.execute(
                    `INSERT INTO users (name, email, password, role, company_name, company_website, company_description, status) 
                     VALUES (?, ?, ?, 'brand', ?, ?, ?, 'active')`,
                    [request.name, request.email, request.password, request.company, request.website, request.description]
                );
                
                // Send approval email
                const loginLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;
                const emailContent = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #10b981;">Brand Request Approved!</h2>
                        <p>Hello ${request.name},</p>
                        <p>Great news! Your brand request has been approved by our admin team.</p>
                        <p>You can now log in to your InfluenceMatch brand dashboard using your registered email and password.</p>
                        <a href="${loginLink}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Login to Dashboard</a>
                        <p>Start creating campaigns and connecting with influencers today!</p>
                        <p>Best regards,<br>InfluenceMatch Team</p>
                    </div>
                `;
                
                await sendEmail(
                    request.email,
                    'Brand Request Approved - InfluenceMatch',
                    emailContent
                );
            } else {
                // User exists, just update status
                await db.execute(
                    'UPDATE users SET status = ? WHERE email = ?',
                    ['active', request.email]
                );
            }
        }

        res.json({ message: 'Brand request status updated successfully' });
    } catch (error) {
        console.error('Update brand request status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;