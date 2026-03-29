const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createTask, getTasks, updateTask, deleteTask, reorderTasks, getOrgTasks, getOrgDashboard } = require('../controllers/taskController');

router.use(protect);

router.post('/', createTask);
router.get('/project/:projectId', getTasks);
router.get('/org/:orgId', getOrgTasks);
router.put('/reorder', reorderTasks);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

router.get('/dashboard/:orgId', getOrgDashboard);

module.exports = router;
