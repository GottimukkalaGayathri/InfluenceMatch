// routes/influencers.js

const express = require('express');
const router = express.Router();
const pool = require('../db'); // assuming you use a db.js or similar file for DB pool

// GET all influencers
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM influencers');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching influencers:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
