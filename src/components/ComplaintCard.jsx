import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, User, CheckCircle, RefreshCw, ThumbsUp, ThumbsDown, MessageSquare, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    const statusMap = {
        'pending': 'warning',
        'progress': 'info',
        'in progress': 'info',
        'resolved': 'success',
    };
    return `badge bg-${statusMap[s] || 'warning'} rounded-pill`;
};

const getPriorityBadge = (priority) => {
    const p = (priority || 'medium').toLowerCase();
    const priorityMap = {
        'critical': 'bg-danger',
        'high': 'bg-warning',
        'medium': 'bg-info',
        'low': 'bg-success'
    };
    return `badge ${priorityMap[p] || 'bg-info'} bg-opacity-10 text-dark small fw-normal`;
};

const getStatusIcon = (status) => {
    const s = (status || 'pending').toLowerCase();
    switch (s) {
        case 'resolved': return <CheckCircle size={16} className="text-success" />;
        case 'progress':
        case 'in progress': return <RefreshCw size={16} className="text-info" />;
        default: return <Clock size={16} className="text-warning" />;
    }
};

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

const ComplaintCard = ({ complaint, viewMode, index }) => {
    const navigate = useNavigate();

    // State for votes and comments
    const [upvotesCount, setUpvotesCount] = useState(complaint.upvotes_count || 0);
    const [downvotesCount, setDownvotesCount] = useState(complaint.downvotes_count || 0);
    const [userVoteType, setUserVoteType] = useState(complaint.user_vote_type || null); // 'upvote', 'downvote', or null

    const [showComments, setShowComments] = useState(false);
    const [commentsCount, setCommentsCount] = useState(complaint.comments_count || 0);
    const [commentsList, setCommentsList] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [showBigIcon, setShowBigIcon] = useState(null);

    const handleVote = async (e, type) => {
        e.stopPropagation();
        try {
            if (userVoteType === type) {
                // Remove vote if clicking the same button
                await api.delete(`/complaints/${complaint.id}/vote`);
                if (type === 'upvote') setUpvotesCount(prev => prev - 1);
                if (type === 'downvote') setDownvotesCount(prev => prev - 1);
                setUserVoteType(null);
            } else {
                // Switch or add vote
                await api.post(`/complaints/${complaint.id}/vote`, { voteType: type });

                // If switching from upvote to downvote
                if (userVoteType === 'upvote' && type === 'downvote') {
                    setUpvotesCount(prev => prev - 1);
                    setDownvotesCount(prev => prev + 1);
                }
                // If switching from downvote to upvote
                else if (userVoteType === 'downvote' && type === 'upvote') {
                    setDownvotesCount(prev => prev - 1);
                    setUpvotesCount(prev => prev + 1);
                }
                // If fresh vote
                else {
                    if (type === 'upvote') setUpvotesCount(prev => prev + 1);
                    if (type === 'downvote') setDownvotesCount(prev => prev + 1);
                }
                setUserVoteType(type);

                // Show big overlay animation
                setShowBigIcon(type);
                setTimeout(() => setShowBigIcon(null), 1000);
            }
        } catch (err) {
            console.error(`Error ${type}ing:`, err);
        }
    };

    const toggleComments = async (e) => {
        e.stopPropagation();
        if (!showComments) {
            setShowComments(true);
            // Fetch comments
            setLoadingComments(true);
            try {
                const res = await api.get(`/complaints/${complaint.id}/comments`);
                setCommentsList(res.data || []);
            } catch (err) {
                console.error('Error fetching comments:', err);
            } finally {
                setLoadingComments(false);
            }
        } else {
            setShowComments(false);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!newComment.trim()) return;

        setIsSubmittingComment(true);
        try {
            const res = await api.post(`/complaints/${complaint.id}/comments`, {
                content: newComment
            });
            const addedComment = res.data;
            // Optimistically update list
            // We might need to map it if backend doesn't return full details,
            // but for now we'll fetch them again or wait, standard response.
            setCommentsList([{
                ...addedComment,
                user_name: 'You',
                timestamp: new Date().toISOString()
            }, ...commentsList]);
            setCommentsCount(prev => prev + 1);
            setNewComment('');
        } catch (err) {
            console.error('Error adding comment:', err);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card border-0 shadow-sm rounded-4 hover-shadow-lg overflow-hidden position-relative"
            style={{
                background: 'var(--card-bg)', border: '1px solid var(--border-glass)',
                transition: 'all 0.3s ease', cursor: 'pointer', display: 'flex', flexDirection: 'column'
            }}
        >
            {/* Big Icon Animation Overlay */}
            <AnimatePresence>
                {showBigIcon && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, x: '-50%', y: '-50%' }}
                        animate={{ opacity: 1, scale: 1.5, x: '-50%', y: '-50%' }}
                        exit={{ opacity: 0, scale: 0.8, x: '-50%', y: '-50%' }}
                        transition={{ duration: 0.4, type: "spring" }}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            zIndex: 100,
                            pointerEvents: 'none',
                            background: showBigIcon === 'upvote' ? 'rgba(13, 110, 253, 0.15)' : 'rgba(220, 53, 69, 0.15)',
                            backdropFilter: 'blur(4px)',
                            WebkitBackdropFilter: 'blur(4px)',
                            borderRadius: '50%',
                            padding: '2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        {showBigIcon === 'upvote' ? (
                            <ThumbsUp size={80} className="text-primary" fill="currentColor" />
                        ) : (
                            <ThumbsDown size={80} className="text-danger" fill="currentColor" />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {complaint.photo && (
                <div style={{
                    width: '100%', height: '160px', backgroundImage: `url(${complaint.photo})`,
                    backgroundSize: 'cover', backgroundPosition: 'center', borderBottom: '1px solid var(--border-color)'
                }} />
            )}
            <div className="card-body p-4 d-flex flex-column" style={{ flex: 1 }}>
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-primary bg-opacity-10 text-primary fs-6">#{complaint.id}</span>
                        <span className={getPriorityBadge(complaint.priority)}>{complaint.priority || 'Medium'}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        {getStatusIcon(complaint.status)}
                        <span className={getStatusBadge(complaint.status)}>{complaint.status || 'Pending'}</span>
                    </div>
                </div>

                <h5 className="fw-bold mb-2 text-truncate" style={{ color: 'var(--text-primary)' }}>{complaint.title}</h5>

                <div className="d-flex align-items-center gap-2 mb-2" style={{ color: 'var(--text-muted)' }}>
                    <span className="badge bg-secondary bg-opacity-10 text-secondary small">{complaint.type || 'Other'}</span>
                    <span>•</span><Clock size={14} /><span className="small">{formatDate(complaint.created_at)}</span>
                </div>

                <div className="d-flex align-items-center gap-2 mb-2" style={{ color: 'var(--text-muted)' }}>
                    <User size={14} /><span className="small">Reported by: {complaint.user_name || 'Unknown'}</span>
                </div>

                {complaint.volunteer_name && (
                    <div className="d-flex align-items-center gap-2 mb-2" style={{ color: 'var(--text-muted)' }}>
                        <User size={14} /><span className="small">Assigned to: {complaint.volunteer_name}</span>
                    </div>
                )}

                <div className="d-flex align-items-start gap-2 mb-3">
                    <MapPin size={14} className="mt-1 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    <div className="small" style={{ color: 'var(--text-muted)' }}>
                        <div>{complaint.address}</div>
                        {complaint.landmark && <div className="opacity-75">Near: {complaint.landmark}</div>}
                    </div>
                </div>

                <div className="mt-auto">
                    {complaint.description && (
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(167, 139, 250, 0.1) 100%)',
                            padding: '0.875rem 1rem', borderRadius: '12px', border: '1px solid rgba(96, 165, 250, 0.2)',
                            marginBottom: '1rem', boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.02)'
                        }}>
                            <p className="small mb-0" style={{
                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                overflow: 'hidden', lineHeight: '1.6', fontWeight: '500', color: 'var(--text-primary)'
                            }}>
                                {complaint.description}
                            </p>
                        </div>
                    )}

                    {/* Actions Row: Vote and Comment */}
                    <div className="d-flex align-items-center gap-2 mb-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => handleVote(e, 'upvote')}
                            className={`btn btn-sm rounded-pill px-3 py-1 d-flex align-items-center justify-content-center gap-2 ${userVoteType === 'upvote' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        >
                            <motion.div
                                animate={userVoteType === 'upvote' ? { scale: [1, 1.3, 1], y: [0, -4, 0] } : {}}
                                transition={{ duration: 0.3 }}
                                className={`d-flex align-items-center ${userVoteType === 'upvote' ? 'text-white' : ''}`}
                                style={userVoteType !== 'upvote' ? { color: 'var(--text-primary)' } : {}}
                            >
                                <ThumbsUp size={15} />
                            </motion.div>
                            <span className={`fw-medium ${userVoteType === 'upvote' ? 'text-white' : ''}`} style={userVoteType !== 'upvote' ? { color: 'var(--text-primary)' } : {}}>{upvotesCount}</span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => handleVote(e, 'downvote')}
                            className={`btn btn-sm rounded-pill px-3 py-1 d-flex align-items-center justify-content-center gap-2 ${userVoteType === 'downvote' ? 'btn-danger' : 'btn-outline-secondary'}`}
                        >
                            <motion.div
                                animate={userVoteType === 'downvote' ? { scale: [1, 1.3, 1], y: [0, 4, 0] } : {}}
                                transition={{ duration: 0.3 }}
                                className={`d-flex align-items-center ${userVoteType === 'downvote' ? 'text-white' : ''}`}
                                style={userVoteType !== 'downvote' ? { color: 'var(--text-primary)' } : {}}
                            >
                                <ThumbsDown size={15} />
                            </motion.div>
                            <span className={`fw-medium ${userVoteType === 'downvote' ? 'text-white' : ''}`} style={userVoteType !== 'downvote' ? { color: 'var(--text-primary)' } : {}}>{downvotesCount}</span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleComments}
                            className={`btn btn-sm rounded-pill px-3 py-1 d-flex align-items-center justify-content-center gap-2 ${showComments ? 'bg-primary bg-opacity-10 text-primary border border-primary' : 'btn-outline-secondary'}`}
                            style={!showComments ? { color: 'var(--text-primary)' } : {}}
                        >
                            <MessageSquare size={15} />
                            <span className="fw-medium">{commentsCount}</span>
                        </motion.button>

                        {complaint.latitude && complaint.longitude && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate('/map', { state: { focusLat: complaint.latitude, focusLng: complaint.longitude, complaintId: complaint.id } });
                                }}
                                className="btn btn-sm rounded-pill btn-outline-primary px-3 py-1 d-flex align-items-center justify-content-center gap-1 ms-auto"
                                style={{ color: 'var(--text-primary)', borderColor: 'var(--text-primary)' }}
                            >
                                <MapPin size={15} />
                                <span className="fw-medium">View Map</span>
                            </button>
                        )}
                    </div>

                    {/* Comments Section */}
                    <AnimatePresence>
                        {showComments && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="border-top pt-3 mt-2"
                                onClick={e => e.stopPropagation()} // Prevent navigating/closing card
                            >
                                <h6 className="fw-bold mb-3" style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>Comments</h6>

                                <form onSubmit={handleCommentSubmit} className="mb-3 d-flex gap-2">
                                    <input
                                        type="text"
                                        className="form-control form-control-sm rounded-pill"
                                        placeholder="Add a comment..."
                                        value={newComment}
                                        onChange={e => setNewComment(e.target.value)}
                                        style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="submit"
                                        className="btn btn-primary btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-1"
                                        disabled={!newComment.trim() || isSubmittingComment}
                                    >
                                        {isSubmittingComment ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm text-white" role="status" aria-hidden="true" style={{ width: '14px', height: '14px' }}></span>
                                                Posting...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={15} /> Post
                                            </>
                                        )}
                                    </motion.button>
                                </form>

                                {loadingComments ? (
                                    <div className="text-center py-2"><span className="spinner-border spinner-border-sm text-primary"></span></div>
                                ) : (
                                    <div className="comments-list d-flex flex-column gap-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                        {commentsList.length === 0 ? (
                                            <div className="text-muted small text-center py-2">No comments yet. Be the first to comment!</div>
                                        ) : (
                                            commentsList.map(comment => (
                                                <div key={comment.id} className="d-flex gap-2 p-2 rounded-3" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                                                    <div className="flex-grow-1 min-w-0">
                                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                                            <span className="fw-bold small text-truncate" style={{ color: 'var(--text-primary)' }}>{comment.user_name || 'User'}</span>
                                                            <span className="small text-muted" style={{ fontSize: '0.7rem' }}>{new Date(comment.timestamp).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>{comment.content}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default ComplaintCard;
