const express = require('express');
const router = express.Router();
const recommendationsController = require('../controllers/recommendationsController');

router.post('/', recommendationsController.getRecommendations);

module.exports = router;
