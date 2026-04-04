import { useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';

// Polling interval: 2 minutes to reduce API calls
const POLL_INTERVAL_MS = 120_000;

export const useNotificationPolling = () => {
    const { showToast } = useToast();
    const lastIdRef = useRef(null);
    const intervalRef = useRef(null);

    const getToastType = (type) => {
        switch (type) {
            case 'complaint_submitted':
            case 'complaint_assigned':
                return 'info';
            case 'resolved':
            case 'status_changed':
                return 'success';
            case 'volunteer_submitted':
                return 'warning';
            default:
                return 'info';
        }
    };

    const fetchNotifications = async () => {
        // Skip fetch when tab is hidden — saves API calls
        if (document.visibilityState === 'hidden') return;

        try {
            const res = await api.get('/notifications?limit=10');
            if (res.success && res.data) {
                const notifications = res.data;

                // Removed undefined updateNotifications call

                if (notifications.length === 0) return;

                const latestNotif = notifications[0];

                if (!lastIdRef.current) {
                    lastIdRef.current = latestNotif.id;
                    return;
                }

                if (latestNotif.id > lastIdRef.current) {
                    const newNotifications = notifications.filter(n => n.id > lastIdRef.current);

                    newNotifications.reverse().forEach(notif => {
                        showToast(
                            notif.message,
                            getToastType(notif.type)
                        );
                    });

                    lastIdRef.current = latestNotif.id;
                }
            }
        } catch (err) {
            console.error('Polling error:', err);
        }
    };

    useEffect(() => {
        // Initial fetch on mount
        fetchNotifications();

        // Start polling at a reduced rate (2 min)
        intervalRef.current = setInterval(fetchNotifications, POLL_INTERVAL_MS);

        // When the user returns to the tab, fetch immediately instead of waiting
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchNotifications();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(intervalRef.current);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);
};
