import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, User, CheckCircle, RefreshCw, ThumbsUp, ThumbsDown, MessageSquare, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import AnimatedLikeButton from './AnimatedLikeButton';
import AnimatedDislikeButton from './AnimatedDislikeButton';
import AnimatedCommentButton from './AnimatedCommentButton';

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
        'critical': { bg: '#ef4444', text: '#ffffff' }, // Bootstrap danger red
        'high': { bg: '#f59e0b', text: '#000000' },     // Amber/warning
        'medium': { bg: '#3b82f6', text: '#ffffff' },   // Blue/info
        'low': { bg: '#10b981', text: '#ffffff' }       // Emerald/success
    };

    const style = priorityMap[p] || priorityMap['medium'];

    // Instead of returning class names that might clash with dark mode overrides,
    // we'll return an object with both the base classes and the inline styles needed
    return {
        className: 'badge px-2 py-1',
        style: {
            backgroundColor: style.bg,
            color: style.text,
            fontWeight: '600',
            letterSpacing: '0.02em',
            border: `1px solid ${style.bg}80` // 50% opacity border
        }
    };
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

const ComplaintCard = ({ complaint, viewMode, index = 0 }) => {
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
            className="card border-0 shadow-sm rounded-4 h-100 hover-shadow-lg overflow-hidden"
            style={{
                background: 'var(--card-bg, #1a1a1c)',
                border: '1px solid var(--border-color)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
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
                        <span
                            className={getPriorityBadge(complaint.priority).className}
                            style={getPriorityBadge(complaint.priority).style}
                        >
                            {complaint.priority || 'Medium'}
                        </span>
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

                {viewMode === 'all' && (
                    <div className="d-flex align-items-center gap-2 mb-2" style={{ color: 'var(--text-muted)' }}>
                        <User size={14} /><span className="small">Reported by: {complaint.user_name || 'Unknown'}</span>
                    </div>
                )}

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
                    <div className="d-flex align-items-center gap-3 mb-3">
                        <AnimatedLikeButton
                            isLiked={userVoteType === 'upvote'}
                            onClick={(e) => handleVote(e, 'upvote')}
                            count={upvotesCount}
                        />

                        <AnimatedDislikeButton
                            isDisliked={userVoteType === 'downvote'}
                            onClick={(e) => handleVote(e, 'downvote')}
                            count={downvotesCount}
                        />

                        <AnimatedCommentButton
                            isActive={showComments}
                            onClick={toggleComments}
                            count={commentsCount}
                        />

                        {complaint.latitude && complaint.longitude && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate('/map', { state: { focusLat: complaint.latitude, focusLng: complaint.longitude, complaintId: complaint.id } });
                                }}
                                className="btn btn-sm rounded-pill btn-outline-primary ms-auto"
                            >
                                <MapPin size={14} className="me-1" />
                                View Map
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
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            color: 'var(--text-primary)',
                                            border: '1px solid var(--border-color)'
                                        }}
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        type="submit"
                                        className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 p-0"
                                        style={{
                                            width: '42px',
                                            height: '42px',
                                            minWidth: '42px',
                                            minHeight: '42px',
                                            padding: 0,
                                            boxShadow: '0 4px 15px rgba(0, 113, 227, 0.4)',
                                            backgroundColor: '#0071e3',
                                            color: '#ffffff',
                                            opacity: newComment.trim() ? 1 : 0.8,
                                            border: '2px solid rgba(255,255,255,0.2)'
                                        }}
                                        disabled={!newComment.trim() || isSubmittingComment}
                                    >
                                        <Send size={18} style={{ color: '#ffffff', stroke: '#ffffff', fill: 'none' }} strokeWidth={2.5} />
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
