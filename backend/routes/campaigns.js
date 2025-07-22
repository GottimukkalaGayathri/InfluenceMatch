const express = require('express');
const db = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const router = express.Router();

// Get all campaigns with filters
router.get('/', async (req, res) => {
    try {
        const { platform, status, category, search } = req.query;
        
        let query = `
            SELECT c.*, u.name as brand_name, cc.name as category_name
            FROM campaigns c 
            JOIN users u ON c.brand_id = u.id 
            LEFT JOIN campaign_categories cc ON c.category_id = cc.id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (platform) {
            query += ` AND c.platform = ?`;
            params.push(platform);
        }
        
        if (status) {
            query += ` AND c.status = ?`;
            params.push(status);
        } else {
            query += ` AND c.status = 'active'`;
        }
        
        if (category) {
            query += ` AND cc.name = ?`;
            params.push(category);
        }
        
        if (search) {
            query += ` AND (c.title LIKE ? OR c.description LIKE ? OR u.name LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        query += ` ORDER BY c.created_at DESC`;
        
        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Get campaigns error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get campaign categories
router.get('/categories', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM campaign_categories ORDER BY name');
        res.json(rows);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get campaigns for brand
router.get('/brand', authenticateToken, authorizeRole(['brand']), async (req, res) => {
    try {
        const { status } = req.query;
        
        let query = `
            SELECT c.*, cc.name as category_name
            FROM campaigns c 
            LEFT JOIN campaign_categories cc ON c.category_id = cc.id
            WHERE c.brand_id = ?
        `;
        
        const params = [req.user.id];
        
        if (status) {
            query += ` AND c.status = ?`;
            params.push(status);
        }
        
        query += ` ORDER BY c.created_at DESC`;
        
        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Get brand campaigns error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get campaigns for influencer browsing
router.get('/influencer', authenticateToken, authorizeRole(['influencer']), async (req, res) => {
    try {
        const { platform, category, search } = req.query;
        
        let query = `
            SELECT c.*, u.name as brand_name, cc.name as category_name,
                   CASE WHEN a.id IS NOT NULL THEN 'applied' ELSE 'not_applied' END as application_status
            FROM campaigns c 
            JOIN users u ON c.brand_id = u.id 
            LEFT JOIN campaign_categories cc ON c.category_id = cc.id
            LEFT JOIN applications a ON c.id = a.campaign_id AND a.influencer_id = ?
            WHERE c.status = 'active'
        `;
        
        const params = [req.user.id];
        
        if (platform) {
            query += ` AND c.platform = ?`;
            params.push(platform);
        }
        
        if (category) {
            query += ` AND cc.name = ?`;
            params.push(category);
        }
        
        if (search) {
            query += ` AND (c.title LIKE ? OR c.description LIKE ? OR u.name LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        query += ` ORDER BY c.created_at DESC`;
        
        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Get influencer campaigns error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create campaign
router.post('/', authenticateToken, authorizeRole(['brand']), async (req, res) => {
    try {
        const { title, description, platform, category_id, budget, requirements, start_date, end_date } = req.body;
        
        const [result] = await db.execute(
            `INSERT INTO campaigns (title, description, brand_id, category_id, platform, budget, requirements, start_date, end_date) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description, req.user.id, category_id || null, platform, budget || null, requirements || null, start_date || null, end_date || null]
        );

        res.status(201).json({ message: 'Campaign created successfully', campaignId: result.insertId });
    } catch (error) {
        console.error('Create campaign error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update campaign
router.put('/:id', authenticateToken, authorizeRole(['brand']), async (req, res) => {
    try {
        const { title, description, platform, category_id, budget, requirements, status, start_date, end_date } = req.body;
        
        await db.execute(
            `UPDATE campaigns SET title = ?, description = ?, platform = ?, category_id = ?, budget = ?, 
                                 requirements = ?, status = ?, start_date = ?, end_date = ?
             WHERE id = ? AND brand_id = ?`,
            [title, description, platform, category_id || null, budget || null, requirements || null, 
             status, start_date || null, end_date || null, req.params.id, req.user.id]
        );

        res.json({ message: 'Campaign updated successfully' });
    } catch (error) {
        console.error('Update campaign error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete campaign
router.delete('/:id', authenticateToken, authorizeRole(['brand']), async (req, res) => {
    try {
        await db.execute('DELETE FROM campaigns WHERE id = ? AND brand_id = ?', [req.params.id, req.user.id]);
        res.json({ message: 'Campaign deleted successfully' });
    } catch (error) {
        console.error('Delete campaign error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get campaign by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT c.*, u.name as brand_name, u.company_name, cc.name as category_name
            FROM campaigns c 
            JOIN users u ON c.brand_id = u.id 
            LEFT JOIN campaign_categories cc ON c.category_id = cc.id
            WHERE c.id = ?
        `, [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Campaign not found' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Get campaign error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;