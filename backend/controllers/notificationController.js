const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;

        const [notifications, unreadCount] = await Promise.all([
            Notification.findByUserId(userId, limit, offset),
            Notification.getUnreadCount(userId)
        ]);

        res.json({
            success: true,
            data: notifications,
            unreadCount
        });
    } catch (err) {
        console.error('Error in getNotifications:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { notificationId } = req.params;

        const updated = await Notification.markAsRead(notificationId, userId);

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.json({ success: true, message: 'Notification marked as read', data: updated });
    } catch (err) {
        console.error('Error in markAsRead:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await Notification.markAllAsRead(userId);
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
        console.error('Error in markAllAsRead:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const deleteNotification = async (req, res) => {
    try {
        const userId = req.user.id;
        const { notificationId } = req.params;

        const isDeleted = await Notification.delete(notificationId, userId);

        if (!isDeleted) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.json({ success: true, message: 'Notification deleted successfully' });
    } catch (err) {
        console.error('Error in deleteNotification:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const clearAllNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        await Notification.deleteAll(userId);
        res.json({ success: true, message: 'All notifications cleared' });
    } catch (err) {
        console.error('Error in clearAllNotifications:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
};
