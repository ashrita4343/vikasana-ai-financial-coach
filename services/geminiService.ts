import { GoogleGenAI, Chat } from '@google/genai';
import type { Transaction, ChatMessage } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Using a mock response. Please set your API key for full functionality.");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'mock_key' });
const model = 'gemini-2.5-flash';

// MOCK FUNCTIONS for when API_KEY is not available
const mockGenerateContent = async (prompt: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // simulate network delay
    if (prompt.includes("nudge")) {
        return "Hey! Noticed a late-night food order. How about we tuck away ₹100 for your 'Weekend Fun' goal instead? You're so close!";
    }
    if (prompt.includes("insight")) {
        return "This week, you did great on managing your shopping expenses, but food delivery spending was a bit high, especially on Friday. Maybe plan a home-cooked meal next Friday?";
    }
    return "This is a mock response. Please provide an API key.";
};


export const generateNudgeForTransaction = async (transaction: Transaction, allTransactions: Transaction[]): Promise<string> => {
    if (!process.env.API_KEY) {
        return mockGenerateContent("nudge");
    }
    try {
        const prompt = `
            You are Vikasana, an empathetic and friendly AI financial coach.
            A user just made the following transaction:
            - Name: ${transaction.name}
            - Category: ${transaction.category}
            - Amount: ₹${transaction.amount}
            - Time: ${new Date(transaction.date).toLocaleTimeString()}

            Their recent transaction history shows a pattern of spending on similar items.
            Your goal is to provide a positive, non-judgmental nudge to save a small amount (around 20-25% of the transaction amount).
            Craft a short, encouraging message (1-2 sentences).
            Make it sound human and caring, not robotic.
            
            Example: Instead of "You spent ₹500 on food", say "Hey! Late-night Zomato again? Want me to tuck away ₹100 for your Goa trip instead?"
            
            Generate a nudge for the transaction above.
        `;

        const response = await ai.models.generateContent({
            model,
            contents: prompt
        });

        return response.text;
    } catch (error) {
        console.error('Error generating nudge:', error);
        return "Looks like you're enjoying some good food! How about saving a small bit for later?";
    }
};

export const generateWeeklyInsight = async (transactions: Transaction[]): Promise<string> => {
    if (!process.env.API_KEY) {
        return mockGenerateContent("insight");
    }
    try {
        const last7DaysTransactions = transactions.filter(t => new Date(t.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
        
        if (last7DaysTransactions.length < 3) {
            return "Start making more transactions to see your weekly insights here!";
        }

        const prompt = `
            You are Vikasana, an insightful and friendly AI financial coach.
            Analyze the user's transaction history for the last 7 days and provide one key insight.
            - Identify a spending pattern or a success.
            - Keep it positive and encouraging.
            - Offer a simple, actionable tip.
            - The output should be a short paragraph (2-3 sentences).

            Here are the transactions:
            ${JSON.stringify(last7DaysTransactions.map(t => ({ name: t.name, category: t.category, amount: t.amount, date: t.date })))}
        `;

        const response = await ai.models.generateContent({
            model,
            contents: prompt
        });

        return response.text;
    } catch (error) {
        console.error('Error generating weekly insight:', error);
        return "We're having trouble analyzing your week. Let's try again later!";
    }
};


export const createChatSession = (): Chat | null => {
    if (!process.env.API_KEY) {
        return null;
    }
    return ai.chats.create({
        model,
        config: {
            systemInstruction: `You are Vikasana, a friendly, empathetic, and slightly playful AI financial coach. Your goal is to help young Indian earners with their finances without being preachy. You understand things like UPI, Zomato, Swiggy, and common spending habits. Keep your answers concise, positive, and conversational. Use emojis where appropriate. Never give financial advice, but instead, provide insights and encouragement based on the provided transaction data.`
        },
    });
};

// FIX: The `history` parameter is not supported by `chat.sendMessage` and has been removed.
// The `Chat` object is stateful and manages the conversation history internally.
export const sendMessageToCoach = async (chat: Chat | null, message: string): Promise<string> => {
    if (!process.env.API_KEY || !chat) {
        await new Promise(res => setTimeout(res, 1000));
        return "Hey there! I'm your AI Coach, Vikasana. I'm here to help you understand your spending and save better. How can I help you today? (Note: API key not provided, this is a mock response)";
    }

    try {
        const response = await chat.sendMessage({ message });
        return response.text;
    } catch (error) {
        console.error('Error sending message to coach:', error);
        return "Oops! I'm having a little trouble connecting right now. Let's try again in a moment. 🙏";
    }
};
