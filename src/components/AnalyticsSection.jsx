import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

const ChartCard = ({ title, children, delay }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, duration: 0.5 }}
        className="bg-white dark:bg-dark-card p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700"
    >
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 sm:mb-6">{title}</h3>
        <div className="h-48 sm:h-56 lg:h-64 w-full">
            {children}
        </div>
    </motion.div>
);

export default function AnalyticsSection({ distribution, weekly }) {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
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
    );
}
