const express = require('express');
const db = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const router = express.Router();

// Apply to campaign
router.post('/', authenticateToken, authorizeRole(['influencer']), async (req, res) => {
    try {
        const { campaign_id, message } = req.body;

        const [existing] = await db.execute(
            'SELECT * FROM applications WHERE campaign_id = ? AND influencer_id = ?',
            [campaign_id, req.user.id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Already applied to this campaign' });
        }

        await db.execute(
            'INSERT INTO applications (campaign_id, influencer_id, message) VALUES (?, ?, ?)',
            [campaign_id, req.user.id, message]
        );

        await db.execute(
            'UPDATE campaigns SET applicants = applicants + 1 WHERE id = ?',
            [campaign_id]
        );

        res.json({ message: 'Application submitted successfully' });
    } catch (error) {
        console.error('Apply to campaign error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get applications for influencer
router.get('/influencer', authenticateToken, authorizeRole(['influencer']), async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT a.*, c.title as campaign_title, c.description as campaign_description,
                   c.budget, c.platform, u.name as brand_name, u.company_name,
                   cc.name as category_name
            FROM applications a
            JOIN campaigns c ON a.campaign_id = c.id
            JOIN users u ON c.brand_id = u.id
            LEFT JOIN campaign_categories cc ON c.category_id = cc.id
            WHERE a.influencer_id = ?
            ORDER BY a.applied_at DESC
        `, [req.user.id]);

        res.json(rows);
    } catch (error) {
        console.error('Get influencer applications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get applications for specific influencer (brand view)
router.get('/influencer/:id', authenticateToken, authorizeRole(['brand', 'admin']), async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT a.*, c.title as campaign_title, c.description as campaign_description,
                   c.budget, c.platform, u.name as brand_name, u.company_name,
                   cc.name as category_name
            FROM applications a
            JOIN campaigns c ON a.campaign_id = c.id
            JOIN users u ON c.brand_id = u.id
            LEFT JOIN campaign_categories cc ON c.category_id = cc.id
            WHERE a.influencer_id = ?
            ORDER BY a.applied_at DESC
        `, [req.params.id]);

        res.json(rows);
    } catch (error) {
        console.error('Get influencer applications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get applications for brand's campaigns
router.get('/brand', authenticateToken, authorizeRole(['brand']), async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT a.*, c.title as campaign_title, u.name as influencer_name, 
                   u.email as influencer_email, u.age, u.location, u.occupation, 
                   u.interests, u.average_rating, u.total_ratings,
                   s.instagram_handle, s.linkedin_handle, s.twitter_handle, s.youtube_handle,
                   s.facebook_handle, s.tiktok_handle, s.instagram_followers, s.linkedin_followers,
                   s.twitter_followers, s.youtube_followers, s.facebook_followers, s.tiktok_followers
            FROM applications a
            JOIN campaigns c ON a.campaign_id = c.id
            JOIN users u ON a.influencer_id = u.id
            LEFT JOIN social_media_handles s ON u.id = s.user_id
            WHERE c.brand_id = ?
            ORDER BY a.applied_at DESC
        `, [req.user.id]);

        res.json(rows);
    } catch (error) {
        console.error('Get brand applications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ✅ Update application status (main fix applied here)
router.put('/:id/status', authenticateToken, authorizeRole(['brand']), async (req, res) => {
    try {
        const applicationId = req.params.id;
        const brandId = req.user.id;
        const { status, brand_feedback } = req.body;

        const [application] = await db.execute(
            'SELECT a.*, c.budget, c.brand_id FROM applications a JOIN campaigns c ON a.campaign_id = c.id WHERE a.id = ? AND c.brand_id = ?',
            [applicationId, brandId]
        );

        if (application.length === 0) {
            return res.status(404).json({ message: 'Application not found or unauthorized' });
        }

        const app = application[0];

        await db.execute(
            'UPDATE applications SET status = ?, brand_feedback = ? WHERE id = ?',
            [status, brand_feedback || null, applicationId]
        );

        if (status === 'approved') {
            const earnings = app.budget || 0;

            await db.execute(
                'UPDATE applications SET earnings = ? WHERE id = ?',
                [earnings, applicationId]
            );

            await db.execute(
                'UPDATE users SET total_earnings = total_earnings + ? WHERE id = ?',
                [earnings, app.influencer_id]
            );
        }

        res.json({ message: 'Application status updated successfully' });
    } catch (error) {
        console.error('Update application status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Legacy approve endpoint (optional)
router.put('/:id/approve', authenticateToken, authorizeRole(['brand']), async (req, res) => {
    try {
        const [application] = await db.execute(
            'SELECT a.*, c.budget, c.brand_id FROM applications a JOIN campaigns c ON a.campaign_id = c.id WHERE a.id = ? AND c.brand_id = ?',
            [req.params.id, req.user.id]
        );

        if (application.length === 0) {
            return res.status(404).json({ message: 'Application not found or unauthorized' });
        }

        const app = application[0];
        const earnings = app.budget || 0;

        await db.execute(
            'UPDATE applications SET status = ?, earnings = ? WHERE id = ?',
            ['approved', earnings, req.params.id]
        );

        await db.execute(
            'UPDATE users SET total_earnings = total_earnings + ? WHERE id = ?',
            [earnings, app.influencer_id]
        );

        res.json({ message: 'Application status updated successfully' });
    } catch (error) {
        console.error('Update application status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get application by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT a.*, c.title as campaign_title, c.description as campaign_description,
                   c.budget, c.platform, c.requirements, u.name as brand_name, u.company_name,
                   cc.name as category_name, inf.name as influencer_name, inf.email as influencer_email,
                   inf.age, inf.location, inf.occupation, inf.interests
            FROM applications a
            JOIN campaigns c ON a.campaign_id = c.id
            JOIN users u ON c.brand_id = u.id
            JOIN users inf ON a.influencer_id = inf.id
            LEFT JOIN campaign_categories cc ON c.category_id = cc.id
            WHERE a.id = ? AND (c.brand_id = ? OR a.influencer_id = ?)
        `, [req.params.id, req.user.id, req.user.id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Get application error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Export applications to CSV
router.get('/export/csv', authenticateToken, authorizeRole(['brand']), async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT a.id, c.title as campaign, u.name as influencer, u.email, 
                   a.status, a.applied_at, a.rating, a.rating_comment
            FROM applications a
            JOIN campaigns c ON a.campaign_id = c.id
            JOIN users u ON a.influencer_id = u.id
            WHERE c.brand_id = ?
            ORDER BY a.applied_at DESC
        `, [req.user.id]);

        const csvHeader = 'ID,Campaign,Influencer,Email,Status,Applied Date,Rating,Comment\n';
        const csvData = rows.map(row =>
            `${row.id},"${row.campaign}","${row.influencer}","${row.email}","${row.status}","${row.applied_at}","${row.rating || ''}","${row.rating_comment || ''}"`
        ).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=applications.csv');
        res.send(csvHeader + csvData);
    } catch (error) {
        console.error('Export applications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
