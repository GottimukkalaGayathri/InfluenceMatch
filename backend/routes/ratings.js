const express = require('express');
const db = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const router = express.Router();

// Submit rating for influencer
router.post('/', authenticateToken, authorizeRole(['brand']), async (req, res) => {
    try {
        const { influencer_id, campaign_id, rating, comment } = req.body;
        
        // Check if rating already exists
        const [existing] = await db.execute(
            'SELECT * FROM influencer_ratings WHERE influencer_id = ? AND brand_id = ? AND campaign_id = ?',
            [influencer_id, req.user.id, campaign_id]
        );

        if (existing.length > 0) {
            // Update existing rating
            await db.execute(
                'UPDATE influencer_ratings SET rating = ?, comment = ? WHERE influencer_id = ? AND brand_id = ? AND campaign_id = ?',
                [rating, comment, influencer_id, req.user.id, campaign_id]
            );
        } else {
            // Insert new rating
            await db.execute(
                'INSERT INTO influencer_ratings (influencer_id, brand_id, campaign_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
                [influencer_id, req.user.id, campaign_id, rating, comment]
            );
        }

        // Update user's average rating
        const [avgResult] = await db.execute(
            'SELECT AVG(rating) as avg_rating, COUNT(*) as total_ratings FROM influencer_ratings WHERE influencer_id = ?',
            [influencer_id]
        );

        if (avgResult.length > 0) {
            await db.execute(
                'UPDATE users SET average_rating = ?, total_ratings = ? WHERE id = ?',
                [avgResult[0].avg_rating, avgResult[0].total_ratings, influencer_id]
            );
        }

        res.json({ message: 'Rating submitted successfully' });
    } catch (error) {
        console.error('Submit rating error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get ratings for influencer
router.get('/influencer/:id', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT r.*, u.name as brand_name, c.title as campaign_title
            FROM influencer_ratings r
            JOIN users u ON r.brand_id = u.id
            LEFT JOIN campaigns c ON r.campaign_id = c.id
            WHERE r.influencer_id = ?
            ORDER BY r.created_at DESC
        `, [req.params.id]);
        
        res.json(rows);
    } catch (error) {
        console.error('Get influencer ratings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;