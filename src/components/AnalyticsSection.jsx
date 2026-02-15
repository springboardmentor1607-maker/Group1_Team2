import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

const ChartCard = ({ title, children, delay }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, duration: 0.5 }}
        whileHover={{ 
            scale: 1.01,
            transition: { duration: 0.2 }
        }}
        className="card shadow-lg border p-4 bg-card h-100 d-flex flex-column"
        style={{ minHeight: '400px' }}
    >
        <h3 className="card-title fs-5 fw-semibold mb-4" style={{ color: 'var(--bs-body-color)' }}>{title}</h3>
        <div className="flex-grow-1 d-flex align-items-center justify-content-center" style={{ width: '100%', minHeight: '320px', padding: '10px' }}>
            {children}
        </div>
    </motion.div>
);

export default function AnalyticsSection({ distribution, weekly }) {
    return (
        <div className="row g-4 mb-0">
            <div className="col-12 col-xl-6 d-flex">
                <ChartCard title="Complaint Status Distribution" delay={0.5}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={distribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {distribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ 
                                    backgroundColor: 'var(--card-bg)', 
                                    borderColor: 'var(--bs-border-color)', 
                                    color: 'var(--bs-body-color)' 
                                }}
                                itemStyle={{ color: 'var(--bs-body-color)' }}
                            />
                            <Legend 
                                layout="vertical" 
                                verticalAlign="middle" 
                                align="right"
                                wrapperStyle={{ 
                                    fontSize: '12px', 
                                    padding: '0 10px',
                                    color: 'var(--bs-body-color)'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            <div className="col-12 col-xl-6 d-flex">
                <ChartCard title="Weekly Complaints Activity" delay={0.6}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weekly} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <XAxis dataKey="day" stroke="var(--bs-secondary-color)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--bs-secondary-color)" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                cursor={{ fill: 'rgba(102, 126, 234, 0.1)' }}
                                contentStyle={{ 
                                    backgroundColor: 'var(--card-bg)', 
                                    borderColor: 'var(--bs-border-color)', 
                                    color: 'var(--bs-body-color)' 
                                }}
                            />
                            <Bar dataKey="complaints" fill="#667eea" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </div>
    );
}
