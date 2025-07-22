const express = require('express');
const db = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const router = express.Router();

// Get admin analytics
router.get('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        // User counts by role
        const [userCounts] = await db.execute(`
            SELECT role, COUNT(*) as count 
            FROM users 
            GROUP BY role
        `);

        // Campaign status counts
        const [campaignCounts] = await db.execute(`
            SELECT status, COUNT(*) as count 
            FROM campaigns 
            GROUP BY status
        `);

        // Brand request status counts
        const [brandRequestCounts] = await db.execute(`
            SELECT status, COUNT(*) as count 
            FROM brand_requests 
            GROUP BY status
        `);

        // Application status counts
        const [applicationCounts] = await db.execute(`
            SELECT status, COUNT(*) as count 
            FROM applications 
            GROUP BY status
        `);

        // Recent activity (last 30 days)
        const [recentUsers] = await db.execute(`
            SELECT DATE(created_at) as date, COUNT(*) as count 
            FROM users 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        `);

        // Campaign categories distribution
        const [categoryStats] = await db.execute(`
            SELECT cc.name, COUNT(c.id) as count
            FROM campaign_categories cc
            LEFT JOIN campaigns c ON cc.id = c.category_id
            GROUP BY cc.id, cc.name
            ORDER BY count DESC
        `);

        // Top rated influencers
        const [topInfluencers] = await db.execute(`
            SELECT name, email, average_rating, total_ratings
            FROM users 
            WHERE role = 'influencer' AND total_ratings > 0
            ORDER BY average_rating DESC, total_ratings DESC
            LIMIT 10
        `);

        // Monthly earnings summary (placeholder for future implementation)
        const [earningsData] = await db.execute(`
            SELECT 
                MONTH(created_at) as month,
                YEAR(created_at) as year,
                COUNT(*) as completed_campaigns,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful_campaigns
            FROM applications
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY YEAR(created_at), MONTH(created_at)
            ORDER BY year DESC, month DESC
        `);

        res.json({
            userCounts,
            campaignCounts,
            brandRequestCounts,
            applicationCounts,
            recentUsers,
            categoryStats,
            topInfluencers,
            earningsData
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get brand analytics
router.get('/brand', authenticateToken, authorizeRole(['brand']), async (req, res) => {
    try {
        // Brand's campaign performance
        const [campaignStats] = await db.execute(`
            SELECT 
                COUNT(*) as total_campaigns,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_campaigns,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_campaigns,
                SUM(applicants) as total_applications
            FROM campaigns 
            WHERE brand_id = ?
        `, [req.user.id]);

        // Application status breakdown
        const [applicationStats] = await db.execute(`
            SELECT a.status, COUNT(*) as count
            FROM applications a
            JOIN campaigns c ON a.campaign_id = c.id
            WHERE c.brand_id = ?
            GROUP BY a.status
        `, [req.user.id]);

        // Top performing campaigns
        const [topCampaigns] = await db.execute(`
            SELECT title, applicants, status, created_at
            FROM campaigns 
            WHERE brand_id = ?
            ORDER BY applicants DESC
            LIMIT 5
        `, [req.user.id]);

        res.json({
            campaignStats: campaignStats[0] || {},
            applicationStats,
            topCampaigns
        });
    } catch (error) {
        console.error('Get brand analytics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get influencer analytics
router.get('/influencer', authenticateToken, authorizeRole(['influencer']), async (req, res) => {
    try {
        // Influencer's application stats
        const [applicationStats] = await db.execute(`
            SELECT 
                COUNT(*) as total_applications,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_applications,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_applications,
                AVG(CASE WHEN rating IS NOT NULL THEN rating ELSE NULL END) as average_rating
            FROM applications 
            WHERE influencer_id = ?
        `, [req.user.id]);

        // Recent applications
        const [recentApplications] = await db.execute(`
            SELECT c.title, a.status, a.applied_at, a.rating
            FROM applications a
            JOIN campaigns c ON a.campaign_id = c.id
            WHERE a.influencer_id = ?
            ORDER BY a.applied_at DESC
            LIMIT 5
        `, [req.user.id]);

        // Social media followers summary
        const [socialStats] = await db.execute(`
            SELECT 
                instagram_followers, linkedin_followers, twitter_followers,
                youtube_followers, facebook_followers, tiktok_followers
            FROM social_media_handles 
            WHERE user_id = ?
        `, [req.user.id]);

        const totalFollowers = socialStats[0] ? 
            (socialStats[0].instagram_followers || 0) +
            (socialStats[0].linkedin_followers || 0) +
            (socialStats[0].twitter_followers || 0) +
            (socialStats[0].youtube_followers || 0) +
            (socialStats[0].facebook_followers || 0) +
            (socialStats[0].tiktok_followers || 0) : 0;

        res.json({
            applicationStats: applicationStats[0] || {},
            recentApplications,
            socialStats: socialStats[0] || {},
            totalFollowers
        });
    } catch (error) {
        console.error('Get influencer analytics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;