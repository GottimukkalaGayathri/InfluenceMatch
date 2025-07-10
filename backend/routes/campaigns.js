const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');

router.post('/create', campaignController.createCampaign);
router.get('/brand/:brandId', campaignController.getBrandCampaigns);
router.post('/apply', campaignController.applyToCampaign);
router.get('/applications/:brandId', campaignController.getBrandApplications);
router.post('/applications/approve/:applicationId', campaignController.approveApplication);
router.post('/applications/reject/:applicationId', campaignController.rejectApplication);



module.exports = router;
