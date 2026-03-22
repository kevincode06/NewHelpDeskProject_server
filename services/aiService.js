const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const getAIResponse = async (userMessage, ticketContext = []) => {
    if (userMessage.toLowerCase().includes('support')) {
        return {
            reply: "I'm connecting you with a human support agent. Please hold while I connect you to one of our team members.",
            escalate: true
        };
    }

    try {
        let messages = [
            {
                role: 'system',
                content: 'You are a helpful customer support AI assistant for HelpDesk Pro. Be concise, friendly, and professional. Keep responses under 3 sentences when possible.'
            }
        ];

        if (ticketContext.length > 0) {
            ticketContext.forEach(msg => {
                messages.push({
                    role: msg.sender === 'user' ? 'user' : 'assistant',
                    content: msg.content
                });
            });
        }

        messages.push({ role: 'user', content: userMessage });

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: messages,
            max_tokens: 150
        });

        return {
            reply: completion.choices[0].message.content,
            escalate: false
        };

    } catch (error) {
        console.error('OpenAI API error:', error);
        return {
            reply: "I apologize, but I'm having trouble processing your request. Please try again or type 'support' to speak with a human agent.",
            escalate: false
        };
    }
};

const generateTicketSummary = async (messages) => {
    try {
        const conversation = messages.map(m => `${m.sender}: "${m.content}"`).join('\n');

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'user',
                    content: `Summarize this support ticket conversation in 2-3 sentences:\n${conversation}`
                }
            ],
            max_tokens: 100
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error('Summary generation error:', error);
        return 'Unable to generate summary at this time.';
    }
};

module.exports = { getAIResponse, generateTicketSummary };