import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { api } from '../lib/api';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi! I'm your CleanStreet AI assistant. How can I help you today?", sender: 'bot', timestamp: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { id: Date.now(), text: input, sender: 'user', timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            const response = await api.post('/ai/chat', { 
                message: currentInput,
                history: messages.map(m => ({ role: m.sender === 'bot' ? 'assistant' : 'user', content: m.text }))
            });
            
            const botMessage = { 
                id: Date.now() + 1, 
                text: response.reply || response.text || "I'm here to help!", 
                sender: 'bot', 
                timestamp: new Date() 
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { 
                id: Date.now() + 1, 
                text: "Sorry, I'm having trouble connecting right now. Please try again later.", 
                sender: 'bot', 
                timestamp: new Date() 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="position-fixed bottom-0 end-0 p-4 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20, x: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20, x: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="card border-0 shadow-lg overflow-hidden mb-3 rounded-4"
                        style={{
                            width: '380px',
                            height: '550px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-glass)',
                            boxShadow: 'var(--shadow-lg)'
                        }}
                    >
                        {/* Header */}
                        <div className="p-3 text-white d-flex align-items-center justify-content-between"
                            style={{ background: 'linear-gradient(135deg, #4285f4 0%, #1a73e8 100%)' }}>
                            <div className="d-flex align-items-center gap-2">
                                <div className="p-2 bg-white bg-opacity-20 rounded-circle">
                                    <Bot size={20} className="text-white" />
                                </div>
                                <div>
                                    <h6 className="m-0 fw-bold">CleanStreet Assistant</h6>
                                    <small className="opacity-75">AI Support Online</small>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="btn btn-link p-1 text-white border-0 opacity-75 hover-opacity-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-grow-1 overflow-auto p-4 d-flex flex-column gap-3 bg-light bg-opacity-50">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`d-flex ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                                    <div className={`d-flex gap-2 max-w-85 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`p-2 rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center shadow-sm`}
                                            style={{ 
                                                width: '32px', 
                                                height: '32px',
                                                background: msg.sender === 'user' ? '#4285f4' : 'white',
                                                color: msg.sender === 'user' ? 'white' : '#4285f4',
                                                marginTop: '4px'
                                            }}>
                                            {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                                        </div>
                                        <div className={`p-3 rounded-4 shadow-sm ${msg.sender === 'user' ? 'bg-primary text-white rounded-tr-0' : 'bg-white text-dark rounded-tl-0'}`}
                                            style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                                            {msg.text}
                                            <div className={`mt-1 opacity-50`} style={{ fontSize: '0.7rem' }}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="d-flex justify-content-start">
                                    <div className="bg-white p-3 rounded-4 rounded-tl-0 shadow-sm d-flex align-items-center gap-2">
                                        <Loader2 size={16} className="animate-spin text-primary" />
                                        <span className="small text-muted">AI is thinking...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Form */}
                        <div className="p-3 bg-white border-top border-light">
                            <form onSubmit={handleSend} className="d-flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask anything..."
                                    className="form-control rounded-pill border-light bg-light px-4 py-2 shadow-none"
                                    style={{ fontSize: '0.9rem' }}
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center p-0 shadow-sm"
                                    style={{ width: '40px', height: '40px' }}
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="btn rounded-circle shadow-lg d-flex align-items-center justify-content-center ms-auto"
                style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #4285f4 0%, #1a73e8 100%)',
                    color: 'white',
                    border: '2px solid rgba(255,255,255,0.4)',
                    boxShadow: '0 8px 32px rgba(66, 133, 244, 0.4)',
                    backdropFilter: 'blur(10px)'
                }}
            >
                {isOpen ? <X size={24} /> : (
                    <div className="position-relative">
                        <Bot size={28} className="animate-pulse" />
                        <motion.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="position-absolute top-0 end-0 translate-middle-y"
                        >
                            <Sparkles size={12} className="text-warning" />
                        </motion.div>
                    </div>
                )}
            </motion.button>
        </div>
    );
};

export default ChatWidget;
