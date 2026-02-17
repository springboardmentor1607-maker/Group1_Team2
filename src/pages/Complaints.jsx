<<<<<<< HEAD
function Complaints() {
  return <h2 className="text-dark p-4">Complaints Page</h2>;
=======
import React from 'react';
import { motion } from 'framer-motion';

function Complaints() {
    const complaints = [
        { id: 1, title: 'Overflowing Garbage Bin', status: 'Pending', priority: 'High', date: '2026-02-10' },
        { id: 2, title: 'Broken Street Light', status: 'In Progress', priority: 'Medium', date: '2026-02-08' },
        { id: 3, title: 'Pothole on Main Road', status: 'Resolved', priority: 'High', date: '2026-02-05' },
        { id: 4, title: 'Illegal Dumping', status: 'Pending', priority: 'Critical', date: '2026-02-12' },
    ];

    const getStatusBadge = (status) => {
        const statusMap = {
            'Pending': 'warning',
            'In Progress': 'info',
            'Resolved': 'success',
        };
        return `badge bg-${statusMap[status]} rounded-pill`;
    };

    const getPriorityBadge = (priority) => {
        const priorityMap = {
            'Critical': 'danger',
            'High': 'warning',
            'Medium': 'info',
            'Low': 'secondary',
        };
        return `badge bg-${priorityMap[priority]} rounded-pill`;
    };

    return (
        <div className="container-lg px-3 px-md-4 py-3">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                    <div>
                        <h1 className="display-5 fw-bold mb-2" style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--accent-1))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            <i className="bi bi-megaphone me-3"></i>Complaints
                        </h1>
                        <p className="text-muted mb-0">Track and manage citizen complaints</p>
                    </div>
                    <button className="btn btn-primary rounded-3 px-4">
                        <i className="bi bi-plus-lg me-2"></i>New Complaint
                    </button>
                </div>

                <div className="card border-0 shadow-sm rounded-3" style={{ background: 'var(--bg-card)' }}>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="border-bottom">
                                    <tr>
                                        <th className="px-4 py-3">ID</th>
                                        <th className="px-4 py-3">Title</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Priority</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {complaints.map((complaint, index) => (
                                        <motion.tr
                                            key={complaint.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <td className="px-4 py-3 fw-medium">#{complaint.id}</td>
                                            <td className="px-4 py-3">{complaint.title}</td>
                                            <td className="px-4 py-3">
                                                <span className={getStatusBadge(complaint.status)}>{complaint.status}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={getPriorityBadge(complaint.priority)}>{complaint.priority}</span>
                                            </td>
                                            <td className="px-4 py-3 text-muted">{new Date(complaint.date).toLocaleDateString()}</td>
                                            <td className="px-4 py-3">
                                                <button className="btn btn-sm btn-outline-primary rounded-3 me-2">
                                                    <i className="bi bi-eye"></i>
                                                </button>
                                                <button className="btn btn-sm btn-outline-secondary rounded-3">
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
>>>>>>> main
}
export default Complaints;