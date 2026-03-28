import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
    Menu,
    Moon,
    Sun,
    Home,
    FileText,
    Map as MapIcon,
    Settings,
    LogOut,
    User,
    Plus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { NavLink, useLocation, useNavigate, Link } from "react-router-dom";
import ChatWidget from './ChatWidget';
import NewSidebar from './NewSidebar';
import { api } from '../lib/api';
import { useNotificationPolling } from '../hooks/useNotificationPolling';

/* ===================== LAYOUT ===================== */
export default function DashboardLayout({ children, onLogout }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState(null);

    // Global notification polling for all dashboard pages
    useNotificationPolling(15000);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/auth/profile');
                setUser(response.user);
            } catch (err) {
                console.error('Error fetching user:', err);
            }
        };
        fetchUser();
    }, []);

    return (
        <div className="min-h-screen bg-body">
            <NewSidebar
                isOpen={sidebarOpen}
                toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                onLogout={onLogout}
                user={user}
            />

            <main
                className="pt-3 px-4 transition-all"
                style={{
                    marginLeft: sidebarOpen ? '280px' : '80px',
                    transition: 'margin-left 0.3s ease',
                    minHeight: '100vh'
                }}
            >
                {children}
            </main>

            {/* Chat Widget Fixed to Bottom Right */}
            <ChatWidget />
        </div>
    );
}