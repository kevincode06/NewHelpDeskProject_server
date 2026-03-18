const Ticket = require('../models/Tickets');
const User = require('../models/User');

// @desc    Get all tickets (admin only)
// @route   GET /api/admin/tickets
// @access  Private/Admin
const getAllTickets = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    
    if (status) query.status = status;

    const tickets = await Ticket.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate('assignedTo', 'name');

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update ticket status
// @route   PUT /api/admin/tickets/:id/status
// @access  Private/Admin
const updateTicketStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.status = status;
    if (status === 'in-progress' && !ticket.assignedTo) {
      ticket.assignedTo = req.user._id;
    }

    await ticket.save();
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Admin reply to ticket
// @route   POST /api/admin/tickets/:id/reply
// @access  Private/Admin
const adminReply = async (req, res) => {
  const { content } = req.body;

  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.messages.push({ sender: 'admin', content });
    ticket.status = 'in-progress';

    await ticket.save();
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    const totalTickets = await Ticket.countDocuments();
    const openTickets = await Ticket.countDocuments({ status: 'open' });
    const inProgressTickets = await Ticket.countDocuments({ status: 'in-progress' });
    const resolvedTickets = await Ticket.countDocuments({ status: 'resolved' });
    const escalatedTickets = await Ticket.countDocuments({ isEscalated: true });

    res.json({
      total: totalTickets,
      open: openTickets,
      inProgress: inProgressTickets,
      resolved: resolvedTickets,
      escalated: escalatedTickets
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getAllTickets, updateTicketStatus, adminReply, getStats };