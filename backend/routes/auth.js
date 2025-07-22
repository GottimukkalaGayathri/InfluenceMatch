const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { sendEmail, generateOTP, emailTemplates } = require('../config/email');
const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, age, location, occupation, interests, company_name, company_website, company_description } = req.body;

        // Check if user already exists
        const [existingUser] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user with additional fields
        const [result] = await db.execute(
            `INSERT INTO users (name, email, password, role, age, location, occupation, interests, company_name, company_website, company_description) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, email, hashedPassword, role, age || null, location || null, occupation || null, interests || null, 
             company_name || null, company_website || null, company_description || null]
        );

        // Create social media handles entry for influencers
        if (role === 'influencer') {
            await db.execute(
                'INSERT INTO social_media_handles (user_id) VALUES (?)',
                [result.insertId]
            );
        }

        res.status(201).json({ message: 'User created successfully', userId: result.insertId });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Get user
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = rows[0];

        // Check if brand is approved (for brand users)
        if (user.role === 'brand' && user.status === 'pending') {
            return res.status(403).json({ message: 'Your brand account is pending approval' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Forgot password - Send OTP
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // Delete any existing OTPs for this email
        await db.execute('DELETE FROM otp_tokens WHERE email = ?', [email]);

        // Store OTP in database
        await db.execute(
            'INSERT INTO otp_tokens (email, otp, expires_at) VALUES (?, ?, ?)',
            [email, otp, expiresAt]
        );

        // Send OTP email
        const emailResult = await sendEmail(
            email,
            'Password Reset OTP - InfluenceMatch',
            emailTemplates.passwordResetOTP(otp, user.name)
        );

        if (emailResult.success) {
            res.json({ message: 'OTP sent to your email successfully' });
        } else {
            res.status(500).json({ message: 'Failed to send OTP email' });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Verify OTP
        const [tokens] = await db.execute(
            'SELECT * FROM otp_tokens WHERE email = ? AND otp = ? AND expires_at > NOW() AND used = FALSE',
            [email, otp]
        );

        if (tokens.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        res.json({ message: 'OTP verified successfully', valid: true });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];

        // Generate new OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // Delete existing OTPs
        await db.execute('DELETE FROM otp_tokens WHERE email = ?', [email]);

        // Store new OTP
        await db.execute(
            'INSERT INTO otp_tokens (email, otp, expires_at) VALUES (?, ?, ?)',
            [email, otp, expiresAt]
        );

        // Send OTP email
        const emailResult = await sendEmail(
            email,
            'Password Reset OTP - InfluenceMatch',
            emailTemplates.passwordResetOTP(otp, user.name)
        );

        if (emailResult.success) {
            res.json({ message: 'New OTP sent to your email successfully' });
        } else {
            res.status(500).json({ message: 'Failed to send OTP email' });
        }
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Reset password with OTP
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Verify OTP
        const [tokens] = await db.execute(
            'SELECT * FROM otp_tokens WHERE email = ? AND otp = ? AND expires_at > NOW() AND used = FALSE',
            [email, otp]
        );

        if (tokens.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password
        await db.execute(
            'UPDATE users SET password = ? WHERE email = ?',
            [hashedPassword, email]
        );

        // Mark OTP as used
        await db.execute(
            'UPDATE otp_tokens SET used = TRUE WHERE email = ? AND otp = ?',
            [email, otp]
        );

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;