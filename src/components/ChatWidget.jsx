import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot } from 'lucide-react';

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm the CleanStreet Assistant. How can I help you today?", isBot: true }
    ]);
    const [inputValue, setInputValue] = useState("");

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        // Add user message
        const newMessage = { id: Date.now(), text: inputValue, isBot: false };
        setMessages(prev => [...prev, newMessage]);
        setInputValue("");

        // Simulate bot response
        setTimeout(() => {
            const botResponse = {
                id: Date.now() + 1,
                text: "Thanks for reaching out! A CleanStreet representative will review your message shortly.",
                isBot: true
            };
            setMessages(prev => [...prev, botResponse]);
        }, 1000);
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
                            background: 'var(--bg-card)',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                        }}
                    >
                        {/* Header */}
                        <div className="p-3 d-flex align-items-center justify-content-between text-white"
                            style={{ background: 'linear-gradient(135deg, #22C55E 0%, #14B8A6 100%)' }}>
                            <div className="d-flex align-items-center gap-2">
                                <div className="bg-white bg-opacity-25 p-2 rounded-circle">
                                    <Bot size={20} className="text-white" />
                                </div>
                                <div>
                                    <h6 className="m-0 fw-bold">CleanStreet AI</h6>
                                    <span className="small opacity-75">Online</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="btn btn-link text-white p-1 hover-bg-opacity"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="card-body p-3 overflow-auto d-flex flex-column gap-3" style={{ background: 'var(--bg-secondary)', height: '370px' }}>
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`d-flex ${msg.isBot ? 'justify-content-start' : 'justify-content-end'}`}
                                >
                                    <div
                                        className={`p-3 shadow-sm`}
                                        style={{
                                            maxWidth: '80%',
                                            background: msg.isBot ? 'var(--bg-card)' : 'linear-gradient(135deg, #22C55E 0%, #14B8A6 100%)',
                                            color: msg.isBot ? 'var(--text-body)' : 'white',
                                            borderRadius: '12px',
                                            borderBottomLeftRadius: msg.isBot ? '2px' : '12px',
                                            borderBottomRightRadius: msg.isBot ? '12px' : '2px'
                                        }}
                                    >
                                        <p className="m-0 small">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-3 border-top bg-card">
                            <form onSubmit={handleSendMessage} className="d-flex gap-2">
                                <input
                                    type="text"
                                    className="form-control border-0 bg-transparent shadow-none ps-0"
                                    placeholder="Type your message..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    style={{ color: 'var(--text-body)' }}
                                />
                                <button
                                    type="submit"
                                    className="btn btn-primary d-flex align-items-center justify-content-center rounded-circle p-2"
                                    disabled={!inputValue.trim()}
                                    style={{ width: '40px', height: '40px' }}
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-primary rounded-circle shadow-lg d-flex align-items-center justify-content-center ms-auto"
                style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #22C55E 0%, #14B8A6 100%)',
                    boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)'
                }}
            >
                {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
            </motion.button>
        </div>
    );
}
