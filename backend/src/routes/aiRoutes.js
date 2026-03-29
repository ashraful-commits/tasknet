const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateTaskDescription, suggestTaskPriority, getProjectInsights } = require('../controllers/aiController');

router.use(protect);

router.post('/generate-description', generateTaskDescription);
router.post('/suggest-priority', suggestTaskPriority);
router.post('/project-insights', getProjectInsights);

module.exports = router;
