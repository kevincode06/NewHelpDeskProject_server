const express = require('express');
const router = express.Router();
const { getAllTickets, updateTicketStatus, adminReply, getStats } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');


router.get('/tickets', protect, adminOnly, getAllTickets);
router.put('/tickets/:id/status', protect, adminOnly, updateTicketStatus);
router.post('/tickets/:id/reply', protect, adminOnly, adminReply);
router.get('/stats', protect, adminOnly, getStats);

module.exports = router;