const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { addComment, getTaskComments, updateComment, deleteComment } = require('../controllers/commentController');

router.use(protect);

router.post('/', addComment);
router.get('/task/:taskId', getTaskComments);
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);

module.exports = router;
