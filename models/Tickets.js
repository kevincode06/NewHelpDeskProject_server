const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({ 
    sender: { type: String, enum: ['user', 'ai', 'admin'], required: true },
    content: { type: String, required: true },
    timestamps: { type: Date, default: Date.now },
}); 

const ticketSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
   status: { type: String, enum: ['open', 'in_progress', 'closed'], default: 'open' },
   messages: [messageSchema],
   isEscalated: { type: Boolean, default: false }, // true if 'support' was typed 
   assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null} 
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);