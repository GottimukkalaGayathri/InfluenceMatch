const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getAllUsers);
router.put('/social/:id', userController.updateSocialMedia);
router.get('/influencer/:id', userController.getInfluencerProfile);



module.exports = router;
