const express = require('express');
const db = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT id, name, email, role, status, age, location, occupation, interests, 
                   company_name, company_website, average_rating, total_ratings, created_at 
            FROM users ORDER BY created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const [userRows] = await db.execute(
            `SELECT id, name, email, role, status, age, location, occupation, interests,
                    company_name, company_website, company_description, average_rating, total_ratings, created_at 
             FROM users WHERE id = ?`,
            [req.user.id]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userRows[0];

        // Get social media handles for influencers
        if (user.role === 'influencer') {
            const [socialRows] = await db.execute(
                `SELECT instagram_handle, linkedin_handle, twitter_handle, youtube_handle, 
                        facebook_handle, tiktok_handle, instagram_followers, linkedin_followers,
                        twitter_followers, youtube_followers, facebook_followers, tiktok_followers
                 FROM social_media_handles WHERE user_id = ?`,
                [req.user.id]
            );
            user.socialMediaHandles = socialRows[0] || {};
        }

        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { name, age, location, occupation, interests, company_name, company_website, company_description } = req.body;
        
        await db.execute(
            `UPDATE users SET name = ?, age = ?, location = ?, occupation = ?, interests = ?,
                             company_name = ?, company_website = ?, company_description = ?
             WHERE id = ?`,
            [name, age || null, location || null, occupation || null, interests || null,
             company_name || null, company_website || null, company_description || null, req.user.id]
        );

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update social media handles
router.put('/social-media', authenticateToken, authorizeRole(['influencer']), async (req, res) => {
    try {
        const { 
            instagram_handle, linkedin_handle, twitter_handle, youtube_handle, 
            facebook_handle, tiktok_handle, instagram_followers, linkedin_followers,
            twitter_followers, youtube_followers, facebook_followers, tiktok_followers
        } = req.body;
        
        // Check if record exists
        const [existing] = await db.execute(
            'SELECT id FROM social_media_handles WHERE user_id = ?',
            [req.user.id]
        );

        if (existing.length > 0) {
            // Update existing record
            await db.execute(
                `UPDATE social_media_handles SET 
                 instagram_handle = ?, linkedin_handle = ?, twitter_handle = ?, youtube_handle = ?,
                 facebook_handle = ?, tiktok_handle = ?, instagram_followers = ?, linkedin_followers = ?,
                 twitter_followers = ?, youtube_followers = ?, facebook_followers = ?, tiktok_followers = ?
                 WHERE user_id = ?`,
                [instagram_handle, linkedin_handle, twitter_handle, youtube_handle,
                 facebook_handle, tiktok_handle, instagram_followers || 0, linkedin_followers || 0,
                 twitter_followers || 0, youtube_followers || 0, facebook_followers || 0, tiktok_followers || 0,
                 req.user.id]
            );
        } else {
            // Create new record
            await db.execute(
                `INSERT INTO social_media_handles 
                 (user_id, instagram_handle, linkedin_handle, twitter_handle, youtube_handle,
                  facebook_handle, tiktok_handle, instagram_followers, linkedin_followers,
                  twitter_followers, youtube_followers, facebook_followers, tiktok_followers)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [req.user.id, instagram_handle, linkedin_handle, twitter_handle, youtube_handle,
                 facebook_handle, tiktok_handle, instagram_followers || 0, linkedin_followers || 0,
                 twitter_followers || 0, youtube_followers || 0, facebook_followers || 0, tiktok_followers || 0]
            );
        }

        res.json({ message: 'Social media handles updated successfully' });
    } catch (error) {
        console.error('Update social media error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get influencers for brands (enhanced with search and filters)
router.get('/influencers', authenticateToken, authorizeRole(['brand']), async (req, res) => {
    try {
        const { search, interest, sortBy } = req.query;
        
        let query = `
            SELECT u.id, u.name, u.email, u.age, u.location, u.occupation, u.interests, 
                   u.average_rating, u.total_ratings, u.created_at,
                   s.instagram_handle, s.linkedin_handle, s.twitter_handle, s.youtube_handle,
                   s.facebook_handle, s.tiktok_handle, s.instagram_followers, s.linkedin_followers,
                   s.twitter_followers, s.youtube_followers, s.facebook_followers, s.tiktok_followers
            FROM users u
            LEFT JOIN social_media_handles s ON u.id = s.user_id
            WHERE u.role = 'influencer' AND u.status = 'active'
        `;
        
        const params = [];
        
        if (search) {
            query += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.interests LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        if (interest) {
            query += ` AND u.interests LIKE ?`;
            params.push(`%${interest}%`);
        }
        
        if (sortBy === 'rating') {
            query += ` ORDER BY u.average_rating DESC`;
        } else if (sortBy === 'followers') {
            query += ` ORDER BY (s.instagram_followers + s.youtube_followers + s.twitter_followers) DESC`;
        } else {
            query += ` ORDER BY u.created_at DESC`;
        }
        
        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Get influencers error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user by ID (admin only)
router.get('/:id', authenticateToken, authorizeRole(['admin', 'brand']), async (req, res) => {
    try {
        const [userRows] = await db.execute(
            'SELECT id, name, email, role, status, age, location, occupation, interests, company_name, company_website, company_description, average_rating, total_ratings, total_earnings, created_at FROM users WHERE id = ?',
            [req.params.id]
        );
        
        if (userRows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const user = userRows[0];

        // Get social media handles for influencers
        if (user.role === 'influencer') {
            const [socialRows] = await db.execute(
                `SELECT instagram_handle, instagram_link, instagram_followers,
                        linkedin_handle, linkedin_link, linkedin_followers,
                        twitter_handle, twitter_link, twitter_followers, 
                        youtube_handle, youtube_link, youtube_followers,
                        facebook_handle, facebook_link, facebook_followers, 
                        tiktok_handle, tiktok_link, tiktok_followers
                 FROM social_media_handles WHERE user_id = ?`,
                [req.params.id]
            );
            
            if (socialRows.length > 0) {
                Object.assign(user, socialRows[0]);
            }
        }
        
        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;