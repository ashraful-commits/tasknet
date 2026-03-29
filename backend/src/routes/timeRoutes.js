const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { startTimer, stopTimer, getMyTimeEntries } = require('../controllers/timeController');

router.use(protect);

router.post('/start', startTimer);
router.put('/stop/:id', stopTimer);
router.get('/me', getMyTimeEntries);

module.exports = router;
