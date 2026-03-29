const express = require('express');
const router = express.Router();
const { getSystemStats, getAllUsers, updateUserStatus } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/stats', getSystemStats);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUserStatus);

module.exports = router;
