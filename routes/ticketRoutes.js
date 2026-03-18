const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { createTicket, getMyTickets, getTicketById, addMessageToTicket} = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, [
    body('title').notEmpty().withMessage('Title is required'),
    body('message').notEmpty().withMessage('Message is required')
], createTicket);

router.get('/my-tickets', protect, getMyTickets);
router.get('/:id', protect, getTicketById);
router.post('/:id/messages', protect, [body('content').notEmpty()], addMessageToTicket);

module.exports = router;