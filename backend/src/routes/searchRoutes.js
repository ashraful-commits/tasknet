const express = require('express');
const router = express.Router();
const { universalSearch } = require('../controllers/searchController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', universalSearch);

module.exports = router;
