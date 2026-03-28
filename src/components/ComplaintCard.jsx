import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, User, CheckCircle, RefreshCw, ThumbsUp, ThumbsDown, MessageSquare, Send, Trash2, Image as ImageIcon, Map as MapIcon, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import Skeleton from './Skeleton';

const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    const statusMap = {
        'pending': 'status-pending',
        'progress': 'status-progress',
        'in progress': 'status-progress',
        'resolved': 'status-resolved',
    };
    return `status-badge ${statusMap[s] || 'status-pending'}`;
};

const getPriorityBadge = (priority) => {
    const p = (priority || 'medium').toLowerCase();
    const priorityMap = {
        'critical': 'priority-critical',
        'high': 'priority-high',
        'medium': 'priority-medium',
        'low': 'priority-low'
    };
    return `priority-badge ${priorityMap[p] || 'priority-medium'}`;
};

const getStatusIcon = (status) => {
    const s = (status || 'pending').toLowerCase();
    switch (s) {
        case 'resolved': return <CheckCircle size={14} className="text-success opacity-75" />;
        case 'progress':
        case 'in progress': return <RefreshCw size={14} className="text-primary opacity-75" />;
        default: return <Clock size={14} className="text-warning opacity-75" />;
    }
};

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

const ComplaintCard = ({ complaint, viewMode, index, onDelete }) => {
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
    const [isRevealed, setIsRevealed] = useState(false);
    const [isPhotoFocused, setIsPhotoFocused] = useState(false);
    const [fetchedPhotoData, setFetchedPhotoData] = useState(null);
    const [loadingPhoto, setLoadingPhoto] = useState(false);
    const [viewingOriginal, setViewingOriginal] = useState(false);

    // Derived photo data (prefers props if already present in complaint object)
    const photoData = fetchedPhotoData || {
        photo: complaint.photo,
        volunteer_photo: complaint.volunteer_photo
    };

    const hasAnyPhoto = complaint.has_photo || complaint.has_volunteer_photo || photoData.photo || photoData.volunteer_photo;
    const isResolved = complaint.status?.toLowerCase() === 'resolved';

    // If resolved, default to volunteer photo, otherwise original
    const displayPhoto = viewingOriginal ? photoData.photo : (photoData.volunteer_photo || photoData.photo);
    const isShowingProof = !viewingOriginal && photoData.volunteer_photo;

    const fetchPhoto = async (e, shouldFocus = true) => {
        if (e) e.stopPropagation();
        
        // Mark as revealed immediately on click
        setIsRevealed(true);
        
        // Only fetch if data is missing
        if ((complaint.has_photo || complaint.has_volunteer_photo) && !photoData.photo && !photoData.volunteer_photo && !loadingPhoto) {
            setLoadingPhoto(true);
            try {
                const res = await api.get(`/complaints/${complaint.id}/photo`);
                setFetchedPhotoData(res.data);
                if (shouldFocus) setIsPhotoFocused(true); 
            } catch (err) {
                console.error('Error fetching complaint photo:', err);
            } finally {
                setLoadingPhoto(false);
            }
        } else if (shouldFocus) {
            setIsPhotoFocused(true); 
        }
    };

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
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
                duration: 0.8, 
                ease: [0.16, 1, 0.3, 1],
                layout: { duration: 0.5, type: 'spring', bounce: 0.2 }
            }}
            whileHover={{ y: -5, scale: 1.01 }}
            className="glass-card-premium overflow-hidden position-relative h-100"
            style={{
                border: '1px solid rgba(255, 255, 255, 0.3)',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 40px rgba(0,0,0,0.08)'
            }}
        >
            {/* Focus Mode Navigation Overlay */}
            <AnimatePresence>
                {isPhotoFocused && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            left: '20px',
                            zIndex: 10,
                            pointerEvents: 'auto'
                        }}
                    >
                        <motion.button
                            whileHover={{ scale: 1.1, x: -5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsPhotoFocused(false);
                            }}
                            className="btn btn-light rounded-pill shadow-lg d-flex align-items-center gap-2 px-3 py-2 fw-bold"
                            style={{ 
                                background: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(0,0,0,0.1)',
                                color: 'var(--text-primary)',
                                fontSize: '0.8rem'
                            }}
                        >
                            <ChevronRight size={18} className="rotate-180" style={{ transform: 'rotate(180deg)' }} />
                            Show Details
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
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

            {hasAnyPhoto && (
                <motion.div 
                    layout
                    onClick={!isPhotoFocused ? fetchPhoto : undefined}
                    animate={{
                        height: isPhotoFocused ? '500px' : (photoData?.photo ? '240px' : '160px'),
                    }}
                    transition={{
                        layout: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                        height: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
                    }}
                    style={{
                        width: '100%', 
                        backgroundColor: 'var(--bg-secondary)',
                        borderBottom: isPhotoFocused ? 'none' : '1px solid var(--border-color)',
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: !photoData || !isPhotoFocused ? 'zoom-in' : 'default',
                        zIndex: 2
                    }}
                >
                    {loadingPhoto ? (
                        <div className="h-100"><Skeleton width="100%" height="100%" /></div>
                    ) : (isRevealed && (photoData?.photo || photoData?.volunteer_photo)) ? (
                        <div className="h-100 position-relative">
                            <motion.img 
                                initial={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                src={displayPhoto}
                                alt="Complaint"
                                className="w-100 h-100 object-fit-cover"
                            />
                            {photoData.volunteer_photo && (
                                <div 
                                    className="position-absolute top-0 end-0 p-2 z-10"
                                    onClick={e => e.stopPropagation()}
                                >
                                    <div className="d-flex flex-column gap-2 align-items-end">
                                        <span className={`badge ${isShowingProof ? 'bg-success' : 'bg-primary'} shadow-lg border border-white border-opacity-25`} style={{ backdropFilter: 'blur(8px)', padding: '8px 12px' }}>
                                            {isShowingProof ? (
                                                <><CheckCircle size={14} className="me-1" /> Proof of Work</>
                                            ) : (
                                                <><Clock size={14} className="me-1" /> Original Issue</>
                                            )}
                                        </span>
                                        
                                        {photoData.volunteer_photo && photoData.photo && (
                                            <button 
                                                className="btn btn-sm btn-light rounded-pill shadow-sm py-1 px-3 border-0 bg-white"
                                                style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--primary-color)' }}
                                                onClick={() => setViewingOriginal(!viewingOriginal)}
                                            >
                                                Switch to {viewingOriginal ? 'Proof' : 'Original'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div 
                            className="d-flex flex-column align-items-center justify-content-center h-100 p-4 cursor-pointer"
                            onClick={fetchPhoto}
                            style={{
                                background: 'radial-gradient(circle at center, rgba(128, 128, 128, 0.08) 0%, rgba(0, 0, 0, 0.03) 100%)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="d-flex flex-column align-items-center gap-3"
                            >
                                <div 
                                    className="rounded-circle d-flex align-items-center justify-content-center mb-1 shadow-lg"
                                    style={{ 
                                        width: '64px', height: '64px', 
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        backdropFilter: 'blur(12px)',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        color: 'var(--primary-color)'
                                    }}
                                >
                                    <ImageIcon size={32} strokeWidth={1.5} className="opacity-75" />
                                </div>
                                <div 
                                    className="px-4 py-2 rounded-pill fw-bold position-relative overflow-hidden glass-surface shadow-lg"
                                    style={{
                                        color: 'var(--text-primary)',
                                        fontSize: '0.85rem',
                                        letterSpacing: '0.5px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.6rem',
                                        background: 'rgba(255, 255, 255, 0.8)',
                                        border: '1px solid rgba(0,0,0,0.05)'
                                    }}
                                >
                                    {isResolved ? 'View Proof of Work' : 
                                     (complaint.status?.toLowerCase().includes('progress') ? 'View Progress / Issue' : 'View Issue Photo')}
                                    <ChevronRight size={14} />
                                </div>
                            </motion.div>
                        </div>
                    )}
                </motion.div>
            )}
            <motion.div 
                layout
                className="card-body p-4 d-flex flex-column" 
                animate={{
                    opacity: isPhotoFocused ? 0 : 1,
                    y: isPhotoFocused ? 100 : 0,
                    height: isPhotoFocused ? 0 : 'auto',
                    padding: isPhotoFocused ? 0 : '1.5rem'
                }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{ flex: 1, position: 'relative', zIndex: 1, overflow: 'hidden' }}
            >
                <div style={{ display: isPhotoFocused ? 'none' : 'block' }}>
                    <motion.div layout className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-primary bg-opacity-10 text-primary fs-6">#{complaint.id}</span>
                            <span className={getPriorityBadge(complaint.priority)}>{complaint.priority || 'Medium'}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            {getStatusIcon(complaint.status)}
                            <span className={getStatusBadge(complaint.status)}>{complaint.status || 'Pending'}</span>
                        </div>
                    </motion.div>

                    <motion.h5 layout className="fw-bold mb-2 text-truncate" style={{ color: 'var(--text-primary)' }}>{complaint.title}</motion.h5>

                    <motion.div layout className="d-flex align-items-center gap-2 mb-2" style={{ color: 'var(--text-muted)' }}>
                        <span className="badge bg-secondary bg-opacity-10 text-secondary small">{complaint.type || 'Other'}</span>
                        <span>•</span><Clock size={14} /><span className="small">{formatDate(complaint.created_at)}</span>
                    </motion.div>

                    <motion.div layout className="d-flex align-items-center gap-2 mb-2" style={{ color: 'var(--text-muted)' }}>
                        <User size={14} /><span className="small">Reported by: {complaint.user_name || 'Unknown'}</span>
                    </motion.div>

                    {complaint.volunteer_name && (
                        <motion.div layout className="d-flex align-items-center gap-2 mb-2" style={{ color: 'var(--text-muted)' }}>
                            <User size={14} /><span className="small">Assigned to: {complaint.volunteer_name}</span>
                        </motion.div>
                    )}

                    <motion.div layout className="d-flex align-items-start gap-2 mb-3">
                        <MapPin size={14} className="mt-1 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                        <div className="small" style={{ color: 'var(--text-muted)' }}>
                            <div>{complaint.address}</div>
                            {complaint.landmark && <div className="opacity-75">Near: {complaint.landmark}</div>}
                        </div>
                    </motion.div>

                    <div className="mt-auto">
                        {complaint.description && (
                            <motion.div 
                                layout
                                style={{
                                    background: 'rgba(0, 113, 227, 0.04)',
                                    padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(0, 113, 227, 0.08)',
                                    marginBottom: '1.25rem', boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.02)'
                                }}
                            >
                                <p className="small mb-0" style={{
                                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden', lineHeight: '1.6', fontWeight: '500', color: 'var(--text-primary)'
                                }}>
                                    {complaint.description}
                                </p>
                            </motion.div>
                        )}

                        <motion.div layout className="d-flex align-items-center gap-3 mt-auto">
                            <div className="d-flex align-items-center gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={(e) => handleVote(e, 'upvote')}
                                    className={`btn btn-sm rounded-pill px-3 py-1.5 d-flex align-items-center justify-content-center gap-2 ${userVoteType === 'upvote' ? 'btn-primary shadow-md' : 'btn-outline-secondary'}`}
                                    style={userVoteType !== 'upvote' ? { background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' } : {}}
                                >
                                    <ThumbsUp size={15} className={userVoteType === 'upvote' ? 'text-white' : 'text-primary'} fill={userVoteType === 'upvote' ? 'currentColor' : 'none'} />
                                    <span className={`fw-bold ${userVoteType === 'upvote' ? 'text-white' : ''}`} style={userVoteType !== 'upvote' ? { color: 'var(--text-primary)' } : {}}>{upvotesCount}</span>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={(e) => handleVote(e, 'downvote')}
                                    className={`btn btn-sm rounded-pill px-3 py-1.5 d-flex align-items-center justify-content-center gap-2 ${userVoteType === 'downvote' ? 'btn-danger shadow-md' : 'btn-outline-secondary'}`}
                                    style={userVoteType !== 'downvote' ? { background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' } : {}}
                                >
                                    <ThumbsDown size={15} className={userVoteType === 'downvote' ? 'text-white' : 'text-danger'} fill={userVoteType === 'downvote' ? 'currentColor' : 'none'} />
                                    <span className={`fw-bold ${userVoteType === 'downvote' ? 'text-white' : ''}`} style={userVoteType !== 'downvote' ? { color: 'var(--text-primary)' } : {}}>{downvotesCount}</span>
                                </motion.button>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={toggleComments}
                                className={`btn btn-sm rounded-pill px-3 py-1.5 d-flex align-items-center justify-content-center gap-2 ${showComments ? 'bg-primary bg-opacity-10 text-primary border border-primary shadow-sm' : 'btn-outline-secondary'}`}
                                style={!showComments ? { background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', color: 'var(--text-primary)' } : {}}
                            >
                                <MessageSquare size={15} className={showComments ? 'text-primary' : 'text-secondary'} fill={showComments ? 'currentColor' : 'none'} />
                                <span className="fw-bold">{commentsCount}</span>
                            </motion.button>

                            <div className="ms-auto d-flex gap-2">
                                {complaint.latitude && complaint.longitude && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate('/map', { state: { focusLat: complaint.latitude, focusLng: complaint.longitude, complaintId: complaint.id } });
                                        }}
                                        className="btn btn-sm rounded-pill btn-outline-primary px-3 py-1.5 d-flex align-items-center justify-content-center gap-2"
                                        style={{ background: 'rgba(0, 113, 227, 0.05)', borderColor: 'rgba(0, 113, 227, 0.1)', color: 'var(--primary-color)' }}
                                    >
                                        <MapPin size={14} />
                                        <span className="fw-bold">Map</span>
                                    </motion.button>
                                )}
                                
                                {viewMode === 'my' && onDelete && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm('Are you sure you want to delete this complaint?')) {
                                                onDelete(complaint.id);
                                            }
                                        }}
                                        className="btn btn-sm rounded-pill btn-outline-danger px-3 py-1.5 d-flex align-items-center justify-content-center gap-2"
                                        style={{ background: 'rgba(220, 53, 69, 0.05)', borderColor: 'rgba(220, 53, 69, 0.1)' }}
                                    >
                                        <Trash2 size={14} />
                                        <span className="fw-bold">Delete</span>
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
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
                                    <div className="d-flex flex-column gap-2 py-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="p-2 rounded-3" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                                                <div className="d-flex justify-content-between mb-2">
                                                    <Skeleton width="80px" height="12px" />
                                                    <Skeleton width="60px" height="10px" />
                                                </div>
                                                <Skeleton width="100%" height="16px" />
                                            </div>
                                        ))}
                                    </div>
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
            </motion.div>
        </motion.div>
    );
};

export default ComplaintCard;
