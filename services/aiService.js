const { GoogleGenerativeAI} =  require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);

const getAIResponse = async (userMessage, ticketContext = []) => {
    // check for 'support' keyword to escalate to human agent
    if (userMessage.toLowerCase().includes('support')) {
        return {
            reply: "i'm connecting you with a human support agent please hold while i connect you to one of our team members",
            escalate: true
        };
    }

    try { 
        const model = genAI.getGenerativeModel ({ model: 'gemini-2.0-flash'}); 


        // Combine user message with ticket context for better response
        let prompt = `You are a helpful customer support AI assistant for HelpDesk Pro. 
Be concise, friendly, and professional. Keep responses under 3 sentences when possible.
User Message: "${userMessage}"

If you cannot solve the user's issue or they seem frustrated, suggest to escalate to a human agent.`;

// add previous context of available

if (ticketContext.length > 0) { 
    const history = ticketContext.map(msg => `${msg.sender}: "${msg.content}`).join('\n');
    prompt = `Previous Conversation:\n${history}\n\nNew user message: "${userMessage}"\n\nRespond to the new user message based on the previous conversation.`;
}

const result = await model.generateContent(prompt);
const response = await result.response;
const reply = response.text();

return {
    reply: reply,
    escalate: false
}; 

    } catch (error) {
        console.error('Gemini API error:', error);
    }
    // Fallback response in case of API failure
    return {
        reply: "I apologize, but I'm having trouble processing your request. Please try again or type 'support' to speak with a human agent.",
        escalate: false
       };
    }


    // Function to generate ticket summary for admins
    const generateTicketSummary = async (messages) => {
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
            
            const conversation = messages.map(m => `${m.sender}: "${m.content}"`).join('\n');

            const prompt = `Summarize this support ticket conversation in 2-3 sentences. Identify the main issue and current status:${conversation} Summary:`;
  
            const result = await model.generateContent(prompt);
            const response = await result.response;

            return response.text();
        } catch (error) {
            console.error('Summary generation error:', error);
            return 'Unable to generate summary at this time.';
        }  
    };

    module.exports = { getAIResponse, generateTicketSummary };