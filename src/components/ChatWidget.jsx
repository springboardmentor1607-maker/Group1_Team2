import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm the CleanStreet Assistant. How can I help you today?", isBot: true }
    ]);
    const [inputValue, setInputValue] = useState("");

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMsgText = inputValue;
        // Add user message
        const newMessage = { id: Date.now(), text: userMsgText, isBot: false };
        setMessages(prev => [...prev, newMessage]);
        setInputValue("");
        setIsTyping(true);

        try {
            const response = await api.post('/ai/chat', { message: userMsgText });
            const botResponse = {
                id: Date.now() + 1,
                text: response.text,
                isBot: true
            };
            setMessages(prev => [...prev, botResponse]);
        } catch (err) {
            console.error('Chat error:', err);
            const errorText = err.response?.text || err.message || "Sorry, I'm having trouble connecting right now.";
            const errorResponse = {
                id: Date.now() + 1,
                text: errorText,
                isBot: true
            };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="position-fixed bottom-0 end-0 p-4 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="card border-0 shadow-lg overflow-hidden mb-3"
                        style={{
                            width: '350px',
                            height: '500px',
                            background: 'var(--card-bg)',
                            border: '1px solid var(--border-glass)',
                            boxShadow: 'var(--shadow-lg)'
                        }}
                    >
                        {/* Header */}
                        <div className="p-3 d-flex align-items-center justify-content-between text-white"
                            style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--accent-1) 100%)', color: 'var(--btn-text)' }}>
                            <div className="d-flex align-items-center gap-2">
                                <div className="bg-white bg-opacity-25 p-2 rounded-circle">
                                    <Bot size={20} style={{ color: 'var(--btn-text)' }} />
                                </div>
                                <div>
                                    <h6 className="m-0 fw-bold" style={{ color: 'var(--btn-text)' }}>CleanStreet AI</h6>
                                    <span className="small opacity-75" style={{ color: 'var(--btn-text)' }}>Online</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="btn btn-link p-1 hover-bg-opacity opacity-75 hover-opacity-100"
                                style={{ color: 'var(--btn-text)' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="card-body p-3 overflow-auto d-flex flex-column gap-3" style={{ background: 'transparent', height: '370px' }}>
                            <AnimatePresence>
                                {messages.map((msg) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={msg.id}
                                        className={`d-flex ${msg.isBot ? 'justify-content-start' : 'justify-content-end'}`}
                                    >
                                        <div
                                            className="p-3 shadow-sm"
                                            style={{
                                                maxWidth: '85%',
                                                background: msg.isBot ? 'var(--bg-card)' : 'linear-gradient(135deg, var(--primary-color) 0%, var(--accent-1) 100%)',
                                                color: msg.isBot ? 'var(--text-primary)' : 'var(--btn-text)',
                                                border: msg.isBot ? '1px solid var(--border-color)' : 'none',
                                                borderRadius: '16px',
                                                borderBottomLeftRadius: msg.isBot ? '4px' : '16px',
                                                borderBottomRightRadius: msg.isBot ? '16px' : '4px'
                                            }}
                                        >
                                            <p className="m-0 small" style={{ lineHeight: '1.5' }}>{msg.text}</p>
                                        </div>
                                    </motion.div>
                                ))}
                                {isTyping && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="d-flex justify-content-start"
                                    >
                                        <div className="p-2 px-3 rounded-pill d-flex align-items-center gap-2 shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                                            <Loader2 size={14} className="animate-spin" style={{ color: 'var(--primary-color)' }} />
                                            <span className="small text-muted" style={{ fontSize: '0.75rem' }}>AI is typing...</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Input Area */}
                        <div className="p-3 mt-auto" style={{
                            background: 'var(--card-bg)',
                            borderTop: '1px solid var(--border-color)'
                        }}>
                            <form onSubmit={handleSendMessage} className="d-flex gap-2 align-items-center">
                                <input
                                    type="text"
                                    className="form-control border-0 bg-transparent shadow-none px-2"
                                    placeholder="Message CleanStreet AI..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    style={{ color: 'var(--text-primary)' }}
                                />
                                <button
                                    type="submit"
                                    className="btn d-flex align-items-center justify-content-center rounded-circle p-2 shadow-sm"
                                    disabled={!inputValue.trim()}
                                    style={{
                                        width: '38px',
                                        height: '38px',
                                        background: inputValue.trim() ? 'linear-gradient(135deg, var(--primary-color) 0%, var(--accent-1) 100%)' : 'var(--border-color)',
                                        color: inputValue.trim() ? 'var(--btn-text)' : 'var(--text-muted)',
                                        border: 'none',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <Send size={16} style={{
                                        transform: inputValue.trim() ? 'translate(1px, -1px)' : 'none',
                                        transition: 'transform 0.2s'
                                    }} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="btn rounded-circle shadow-lg d-flex align-items-center justify-content-center ms-auto"
                style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--accent-1) 100%)',
                    color: 'var(--btn-text)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 8px 32px rgba(0, 113, 227, 0.4)',
                    backdropFilter: 'blur(10px)'
                }}
            >
                {isOpen ? <X size={26} /> : (
                    <motion.div
                        animate={{
                            y: [0, -4, 0],
                            rotate: [0, -5, 5, 0]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <Bot size={28} />
                    </motion.div>
                )}
            </motion.button>
        </div>
    );
}
