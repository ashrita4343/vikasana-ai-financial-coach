import React, { useState, useEffect, useRef } from 'react';
import type { Transaction, ChatMessage } from '../types';
import { generateWeeklyInsight, createChatSession, sendMessageToCoach } from '../services/geminiService';
import type { Chat } from '@google/genai';

interface CoachProps {
    transactions: Transaction[];
}

export const Coach: React.FC<CoachProps> = ({ transactions }) => {
    const [insight, setInsight] = useState<string>('');
    const [isLoadingInsight, setIsLoadingInsight] = useState<boolean>(true);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState<string>('');
    const [isThinking, setIsThinking] = useState<boolean>(false);
    const chatSession = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchInsight = async () => {
            setIsLoadingInsight(true);
            try {
                const weeklyInsight = await generateWeeklyInsight(transactions);
                setInsight(weeklyInsight);
            } catch (error) {
                console.error("Failed to fetch weekly insight:", error);
                setInsight("Couldn't fetch your weekly insight right now. Let's talk about something else!");
            } finally {
                setIsLoadingInsight(false);
            }
        };

        fetchInsight();
        chatSession.current = createChatSession();
    }, [transactions]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isThinking) return;

        const newUserMessage: ChatMessage = { role: 'user', text: userInput };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsThinking(true);

        try {
            // FIX: Removed `messages` from the call as `sendMessageToCoach` no longer accepts a history parameter.
            // The stateful `Chat` object handles history internally.
            const responseText = await sendMessageToCoach(chatSession.current, userInput);
            const modelMessage: ChatMessage = { role: 'model', text: responseText };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Failed to send message:", error);
            const errorMessage: ChatMessage = { role: 'model', text: "Sorry, I'm having trouble connecting. Please try again." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="p-4 h-full flex flex-col">
            <header className="mb-4">
                <h1 className="text-2xl font-bold text-gray-800">AI Financial Coach</h1>
                <p className="text-gray-500">Your personal guide to mindful spending.</p>
            </header>
            
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
                <h3 className="font-semibold text-emerald-800 mb-1">💡 Weekly Insight</h3>
                {isLoadingInsight ? (
                     <div className="h-4 bg-gray-200 rounded-full w-3/4 animate-pulse"></div>
                ) : (
                    <p className="text-sm text-emerald-700">{insight}</p>
                )}
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${
                            msg.role === 'user' 
                                ? 'bg-emerald-500 text-white rounded-br-none' 
                                : 'bg-gray-100 text-gray-800 rounded-bl-none'
                        }`}>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isThinking && (
                    <div className="flex justify-start">
                        <div className="px-4 py-2 rounded-2xl bg-gray-100 text-gray-800 rounded-bl-none">
                            <div className="flex items-center space-x-1">
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="mt-4 flex items-center space-x-2">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Ask about your spending..."
                    className="flex-1 p-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-shadow"
                    disabled={isThinking}
                />
                <button 
                    type="submit" 
                    disabled={!userInput.trim() || isThinking}
                    className="bg-emerald-500 text-white rounded-full h-12 w-12 flex items-center justify-center disabled:bg-gray-300 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform -rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                    </svg>
                </button>
            </form>
        </div>
    );
};
