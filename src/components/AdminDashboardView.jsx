import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import { Database, Users, CheckCircle, AlertTriangle, Shield, TrendingUp, Map as MapIcon, Activity, Zap, BarChart3, PieChart as PieChartIcon, Settings } from 'lucide-react';
import AdminSparkCard from './AdminSparkCard';
import MapSection from './MapSection';
import RecentActivity from './RecentActivity';
import { api } from '../lib/api';

const AdminDashboardView = ({ stats, weeklyData, systemActivity, user }) => {

    const [adminData, setAdminData] = useState({
        users: 0,
        volunteers: 0,
        zones: 0,
        loading: true
    });

    useEffect(() => {
        const fetchAdminExtras = async () => {
            try {
                const [usersRes, zonesRes] = await Promise.all([
                    api.get('/auth/admin/users'),
                    api.get('/zones')
                ]);
                
                const users = usersRes.users || [];
                setAdminData({
                    users: users.length,
                    volunteers: users.filter(u => u.role === 'volunteer').length,
                    zones: (zonesRes.zones || []).length,
                    loading: false
                });
            } catch (err) {
                console.error('Error fetching admin extras:', err);
                setAdminData(prev => ({ ...prev, loading: false }));
            }
        };

        fetchAdminExtras();
    }, []);

    // Transform weekly data for sparklines
    const sparkData = weeklyData.map(d => ({ value: d.complaints || 0 }));
    
    // Priority Distribution (Enhanced Visibility)
    const priorityData = [
        { name: 'Critical', value: 12, color: '#f43f5e' }, // Rose 500
        { name: 'High', value: 18, color: '#f97316' },     // Orange 500
        { name: 'Medium', value: 25, color: '#06b6d4' },   // Cyan 500
        { name: 'Low', value: 8, color: '#10b981' },      // Emerald 500
    ];

    const COLORS = priorityData.map(d => d.color);

    return (
        <div className="admin-command-center">
            <div className="mb-4 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                <div>
                    <h1 className="display-5 fw-bold mb-2 d-flex align-items-center apple-gradient-text" style={{
                        letterSpacing: '-0.03em',
                        color: 'var(--primary-color)'
                    }}>
                        <Settings className="me-3 text-primary opacity-90" size={40} />
                        Admin Command Center
                    </h1>
                    <p className="text-muted fw-medium fs-5 mb-0 ms-1">
                        Live City Infrastructure Overview • {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                
                <div className="glass-card-premium p-2 px-3 rounded-pill d-flex align-items-center gap-3 border shadow-sm"
                     style={{ background: 'var(--card-bg)' }}>
                    <div className="rounded-circle bg-primary bg-opacity-10 p-2 d-flex align-items-center justify-content-center">
                        <Shield size={18} className="text-primary" />
                    </div>
                    <div className="pe-2">
                        <p className="small text-primary opacity-75 mb-0 fw-bold text-uppercase" style={{ letterSpacing: '1px', fontSize: '0.65rem' }}>ADMIN ONLINE</p>
                        <p className="small fw-bold text-primary mb-0" style={{ fontSize: '0.85rem' }}>{user?.name || 'Super Admin'}</p>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid with Sparklines */}
            <div className="row g-4 mb-5">
                <div className="col-lg-3 col-md-6">
                    <AdminSparkCard 
                        title="Total Reports" 
                        value={stats.total} 
                        icon={Database} 
                        color="primary" 
                        data={sparkData}
                        delay={0.1}
                    />
                </div>
                <div className="col-lg-3 col-md-6">
                    <AdminSparkCard 
                        title="Active Volunteers" 
                        value={adminData.volunteers} 
                        icon={Zap} 
                        color="success" 
                        data={[...sparkData].reverse()} 
                        delay={0.2}
                    />
                </div>
                <div className="col-lg-3 col-md-6">
                    <AdminSparkCard 
                        title="Resolution Rate" 
                        value={`${Math.round((stats.resolved / (stats.total || 1)) * 100)}%`} 
                        icon={CheckCircle} 
                        color="info" 
                        data={sparkData.map(d => ({ value: d.value * 1.1 }))} 
                        delay={0.3}
                    />
                </div>
                <div className="col-lg-3 col-md-6">
                    <AdminSparkCard 
                        title="Open Alerts" 
                        value={stats.pending + stats.inProgress} 
                        icon={AlertTriangle} 
                        color="warning" 
                        data={sparkData.map(d => ({ value: 100 - d.value }))} 
                        delay={0.4}
                    />
                </div>
            </div>

            {/* Analytics Grid */}
            <div className="row g-4 mb-5">
                {/* Resolution Efficiency Chart */}
                <div className="col-xl-8">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="glass-card-premium p-4 h-100"
                    >
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <h3 className="fs-5 fw-bold d-flex align-items-center gap-2 text-primary">
                                <BarChart3 size={20} />
                                Resolution Efficiency
                            </h3>
                            <span className="badge bg-primary bg-opacity-5 text-primary border border-primary border-opacity-10 px-3 py-1 rounded-pill small fw-800">
                                WEEKLY FLOW
                            </span>
                        </div>
                        <div style={{ height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.5} />
                                    <XAxis dataKey="day" stroke="var(--text-primary)" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="var(--text-primary)" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                            border: '1px solid var(--border-color)', 
                                            borderRadius: '12px', 
                                            backdropFilter: 'blur(10px)',
                                            boxShadow: 'var(--shadow-md)'
                                        }}
                                        itemStyle={{ color: 'var(--text-primary)', fontSize: '13px' }}
                                        cursor={{ fill: 'rgba(0, 113, 227, 0.05)' }}
                                    />
                                    <Legend iconType="circle" />
                                    <Bar dataKey="complaints" name="New Reports" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={35} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* Priority Distribution Chart */}
                <div className="col-xl-4">
                    <motion.div 
                         initial={{ opacity: 0, x: 20 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: 0.6 }}
                         className="glass-card-premium p-4 h-100"
                    >
                        <h3 className="fs-5 fw-bold mb-4 d-flex align-items-center gap-2 text-primary">
                            <PieChartIcon size={20} className="text-info" />
                            Priority Distribution
                        </h3>
                        <div style={{ height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={priorityData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={8}
                                        dataKey="value"
                                        label={false}
                                    >
                                        {priorityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                            border: 'none', 
                                            borderRadius: '12px', 
                                            boxShadow: 'var(--shadow-lg)' 
                                        }}
                                        itemStyle={{ color: 'var(--text-primary)' }}
                                    />
                                    <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Geographic Pulse & Community Metrics */}
            <div className="row g-4 mb-5">
                <div className="col-lg-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="glass-card-premium overflow-hidden"
                    >
                        <div className="p-4 border-bottom border-secondary border-opacity-10 d-flex justify-content-between align-items-center">
                            <h3 className="fs-5 fw-bold mb-0 d-flex align-items-center gap-2 text-primary">
                                <MapIcon size={20} className="text-success" />
                                Geographic Hotspots
                            </h3>
                            <span className="badge bg-success bg-opacity-5 text-success border border-success border-opacity-10 px-3 py-2 rounded-pill small fw-800">
                                LIVE MAP
                            </span>
                        </div>
                        <MapSection />
                    </motion.div>
                </div>

                <div className="col-lg-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="glass-card-premium p-4 h-100"
                    >
                        <h3 className="fs-5 fw-bold mb-4 d-flex align-items-center gap-2 text-primary">
                            <Users size={20} />
                            Community Network
                        </h3>
                        
                        <div className="d-flex flex-column gap-3">
                            {[
                                { label: 'Registered Citizens', value: adminData.users - adminData.volunteers, icon: Users, color: '#3b82f6' },
                                { label: 'Active Volunteers', value: adminData.volunteers, icon: Zap, color: '#10b981' },
                                { label: 'Coverage Zones', value: adminData.zones, icon: MapIcon, color: '#8b5cf6' }
                            ].map((item, idx) => (
                                <div key={idx} className="p-3 rounded-3 d-flex align-items-center justify-content-between mb-2 shadow-sm"
                                     style={{ background: 'rgba(255, 255, 255, 0.4)', border: 'none' }}>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="p-2 rounded-lg" style={{ background: `${item.color}15`, color: item.color }}>
                                            <item.icon size={20} />
                                        </div>
                                        <div>
                                            <p className="small text-muted mb-0 fw-700 uppercase" style={{ fontSize: '0.6rem', letterSpacing: '0.8px' }}>{item.label}</p>
                                            <h4 className="fw-800 mb-0" style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{item.value || 0}</h4>
                                        </div>
                                    </div>
                                    <TrendingUp size={16} className="text-success opacity-40" />
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 p-4 rounded-premium glass-card-premium border-0 position-relative" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                            <p className="small fw-bold text-primary mb-2 uppercase tracking-wide">System Health</p>
                            <div className="d-flex align-items-center gap-3 mb-2">
                                <div className="flex-grow-1 bg-white rounded-pill overflow-hidden" style={{ height: '8px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: '85%' }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="bg-primary h-100" 
                                    />
                                </div>
                                <span className="small fw-800 text-primary">85%</span>
                            </div>
                            <p className="small text-muted mb-0 fw-500" style={{ fontSize: '0.7rem' }}>Platform operations are currently performing optimally.</p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Recent System Activity - Elite Wide View */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="mb-5"
            >
                <div className="glass-card-premium p-4 border border-white border-opacity-10">
                    <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-primary border-opacity-10">
                        <div>
                            <h3 className="fs-5 fw-bold mb-1 d-flex align-items-center gap-2 text-primary">
                                <Activity size={20} />
                                Infrastructure Activity Stream
                            </h3>
                            <p className="small text-primary opacity-60 mb-0 fw-500">Live system events across all city zones</p>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                             <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20 px-3 py-1 rounded small fw-800 shadow-sm">
                                LIVE SYNC
                             </span>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <RecentActivity activities={systemActivity} />
                        </div>
                    </div>
                </div>
            </motion.div>

        </div>
    );
};




export default AdminDashboardView;
