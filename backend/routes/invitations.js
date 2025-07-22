const express = require('express');
const db = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { sendEmail, emailTemplates } = require('../config/email');
const router = express.Router();

// Send invitation to influencer
router.post('/', authenticateToken, authorizeRole(['brand']), async (req, res) => {
    try {
        const { influencer_id, campaign_id, message } = req.body;
        
        // Check if invitation already exists
        const [existing] = await db.execute(
            'SELECT * FROM invitations WHERE brand_id = ? AND influencer_id = ? AND campaign_id = ?',
            [req.user.id, influencer_id, campaign_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Invitation already sent to this influencer for this campaign' });
        }

        // Insert invitation
        await db.execute(
            'INSERT INTO invitations (brand_id, influencer_id, campaign_id, message) VALUES (?, ?, ?, ?)',
            [req.user.id, influencer_id, campaign_id, message]
        );

        // Get influencer and campaign details for email
        const [influencerData] = await db.execute(
            'SELECT name, email FROM users WHERE id = ?',
            [influencer_id]
        );

        const [campaignData] = await db.execute(
            'SELECT title FROM campaigns WHERE id = ?',
            [campaign_id]
        );

        const [brandData] = await db.execute(
            'SELECT name FROM users WHERE id = ?',
            [req.user.id]
        );

        if (influencerData.length > 0 && campaignData.length > 0 && brandData.length > 0) {
            // Send email notification
            await sendEmail(
                influencerData[0].email,
                'Campaign Invitation - InfluenceMatch',
                emailTemplates.campaignInvitation(
                    influencerData[0].name,
                    brandData[0].name,
                    campaignData[0].title
                )
            );
        }

        res.json({ message: 'Invitation sent successfully' });
    } catch (error) {
        console.error('Send invitation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get invitations for influencer
router.get('/influencer', authenticateToken, authorizeRole(['influencer']), async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT i.*, c.title as campaign_title, c.description as campaign_description,
                   c.budget, c.platform, u.name as brand_name, u.company_name,
                   cc.name as category_name
            FROM invitations i
            JOIN campaigns c ON i.campaign_id = c.id
            JOIN users u ON i.brand_id = u.id
            LEFT JOIN campaign_categories cc ON c.category_id = cc.id
            WHERE i.influencer_id = ?
            ORDER BY i.created_at DESC
        `, [req.user.id]);
        
        res.json(rows);
    } catch (error) {
        console.error('Get influencer invitations error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get invitations sent by brand
router.get('/brand', authenticateToken, authorizeRole(['brand']), async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT i.*, c.title as campaign_title, u.name as influencer_name, 
                   u.email as influencer_email
            FROM invitations i
            JOIN campaigns c ON i.campaign_id = c.id
            JOIN users u ON i.influencer_id = u.id
            WHERE i.brand_id = ?
            ORDER BY i.created_at DESC
        `, [req.user.id]);
        
        res.json(rows);
    } catch (error) {
        console.error('Get brand invitations error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Respond to invitation
router.put('/:id/respond', authenticateToken, authorizeRole(['influencer']), async (req, res) => {
    try {
        const { status } = req.body; // 'accepted' or 'rejected'
        
        // Update invitation status
        await db.execute(
            'UPDATE invitations SET status = ? WHERE id = ? AND influencer_id = ?',
            [status, req.params.id, req.user.id]
        );

        // If accepted, create application automatically
        if (status === 'accepted') {
            const [invitation] = await db.execute(
                'SELECT campaign_id, message FROM invitations WHERE id = ?',
                [req.params.id]
            );

            if (invitation.length > 0) {
                // Check if application already exists
                const [existingApp] = await db.execute(
                    'SELECT * FROM applications WHERE campaign_id = ? AND influencer_id = ?',
                    [invitation[0].campaign_id, req.user.id]
                );

                if (existingApp.length === 0) {
                    // Create application
                    await db.execute(
                        'INSERT INTO applications (campaign_id, influencer_id, message, status) VALUES (?, ?, ?, ?)',
                        [invitation[0].campaign_id, req.user.id, 'Accepted invitation to participate in this campaign', 'approved']
                    );

                    // Update campaign applicants count
                    await db.execute(
                        'UPDATE campaigns SET applicants = applicants + 1 WHERE id = ?',
                        [invitation[0].campaign_id]
                    );
                }
            }
        }

        res.json({ message: `Invitation ${status} successfully` });
    } catch (error) {
        console.error('Respond to invitation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;