const Ticket = require('../models/Tickets');
const { getAIResponse } = require('../services/aiService');
const { validationResult } = require('express-validator');

// @desc    Create a new ticket
// @route   POST /api/tickets
// @access  Private

const createTicket = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { title, message } = req.body;

    try {
        // Generate AI response
        const aiResult = await getAIResponse(message);

        // Create new ticket with ai response
        const ticket = await Ticket.create({
            user: req.user._id,
            title,
            messages: [
                { sender: 'user', content: message },
                { sender: 'ai', content: aiResult.reply}
            ],
            isEscalated: aiResult.escalate
        });

    await ticket.populate('user', 'name email');
    res.status(201).json(ticket);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// @desc    Get user's tickets
// @route   GET /api/tickets
// @access  Private

const getMyTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .populate('user', 'name email');
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private

const getTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id).populate('user', 'name email');
    

    // Check user owns ticket or is admin
    if (ticket.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized '});
    }

    res.json(ticket);
} catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message});
}

}; 

// @desc    Add message to ticket
// @route   POST /api/tickets/:id/messages
// @access  Private

const addMessageToTicket = async (req, res) => {
    const { content } = req.body;  
    try {
        const ticket = await Ticket.findById(req.params.id);
        
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

    if (ticket.user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    // Add user message
    ticket.messages.push({ sender: 'user', content }); 

    // get ai response
    const aiResult = await getAIResponse(content);
    ticket.messages.push({ sender: 'ai', content: aiResult.reply });

    if (aiResult.escalate) {
        ticket.isEscalated = true;
    }

await ticket.save();
res.json(ticket);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { createTicket, getMyTickets, getTicketById, addMessageToTicket };