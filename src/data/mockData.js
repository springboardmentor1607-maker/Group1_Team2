export const statsData = {
    total: 124,
    pending: 34,
    inProgress: 45,
    resolved: 45
};

export const complaintDistribution = [
    { name: 'Pending', value: 34, color: '#f59e0b' }, // Amber
    { name: 'In Progress', value: 45, color: '#3b82f6' }, // Blue
    { name: 'Resolved', value: 45, color: '#10b981' }, // Emerald
];

export const weeklyActivity = [
    { day: 'Mon', complaints: 12 },
    { day: 'Tue', complaints: 19 },
    { day: 'Wed', complaints: 15 },
    { day: 'Thu', complaints: 22 },
    { day: 'Fri', complaints: 18 },
    { day: 'Sat', complaints: 25 },
    { day: 'Sun', complaints: 13 },
];

export const recentActivities = [
    { id: 1, type: 'resolved', message: 'Main Street Pothole Fixed', time: '2 hours ago' },
    { id: 2, type: 'new', message: 'Garbage Dump near Central Park', time: '4 hours ago' },
    { id: 3, type: 'in-progress', message: 'Street Light Repair at 5th Ave', time: '1 day ago' },
    { id: 4, type: 'pending', message: 'Water Leakage in Sector 4', time: '1 day ago' },
];
