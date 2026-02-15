import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

const ChartCard = ({ title, children, delay }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, duration: 0.5 }}
        className="card shadow-lg border p-3 p-sm-4 p-lg-5"
    >
        <h3 className="card-title fs-6 fs-sm-5 fw-semibold mb-3 mb-sm-4">{title}</h3>
        <div className="w-100" style={{ height: '200px' }}>
            {children}
        </div>
    </motion.div>
);

export default function AnalyticsSection({ distribution, weekly }) {
    return (
        <div className="row g-3 g-sm-4 mb-4 mb-sm-5">
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
                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Legend layout="vertical" verticalAlign="middle" align="right" />
                    </PieChart>
                </ResponsiveContainer>
                </ChartCard>
            </div>

            <div className="col-12 col-xl-6">
                <ChartCard title="Weekly Complaints Activity" delay={0.6}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weekly}>
                        <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                        />
                        <Bar dataKey="complaints" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
                </ChartCard>
            </div>
        </div>
    );
}
