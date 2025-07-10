const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');

router.get('/', brandController.getAllRequests); // Admin views requests
router.post('/approve/:id', brandController.approveRequest); // Admin approves
router.post('/reject/:id', brandController.rejectRequest);   // Admin rejects

module.exports = router;
