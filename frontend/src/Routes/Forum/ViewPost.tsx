import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as forumService from '../../services/forumService';
import 'react-quill/dist/quill.snow.css';
import './ViewPost.scss';

const ViewPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<forumService.PostWithDetails | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (id) {
      loadPost();
      loadComments();
    }
  }, [id]);

  const loadPost = async () => {
    try {
      const data = await forumService.getPost(id!);
      setPost(data);
    } catch (error) {
      console.error('Failed to load post:', error);
      alert('Post not found');
      navigate('/discussions');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const data = await forumService.getComments(id!);
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleUpvote = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await forumService.toggleVote(id);
      loadPost();
    } catch (error) {
      console.error('Failed to toggle vote:', error);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await forumService.toggleBookmark(id!);
      loadPost();
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!commentContent.trim()) {
      return;
    }

    setSubmittingComment(true);
    try {
      await forumService.createComment(id!, commentContent);
      setCommentContent('');
      loadComments();
      loadPost(); // Refresh to update comment count
    } catch (error: any) {
      console.error('Failed to create comment:', error);
      if (error.response?.status === 403) {
        alert('This post is locked and not accepting new comments.');
      } else {
        alert('Failed to create comment. Please try again.');
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    try {
      await forumService.deletePost(id!);
      navigate('/discussions');
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }
    try {
      await forumService.deleteComment(commentId);
      loadComments();
      loadPost();
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Failed to delete comment');
    }
  };

  const handleUpvoteComment = async (commentId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await forumService.toggleVote(undefined, commentId);
      loadComments();
    } catch (error) {
      console.error('Failed to toggle comment vote:', error);
    }
  };

  const canModerate = user?.role === 'admin' || user?.role === 'moderator';
  const canEditPost = post && (post.author_id === user?.id || canModerate);

  if (loading) {
    return (
      <div className="view-post-container">
        <div className="loading">Loading post...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="view-post-container">
        <div className="error">Post not found</div>
      </div>
    );
  }

  return (
    <div className="view-post-container">
      <div className="post-navigation">
        <button onClick={() => navigate('/discussions')} className="btn-back">
          ← Back to Discussions
        </button>
      </div>

      <div className="post-header">
        <div className="post-badges">
          {post.is_pinned && <span className="badge pinned">📌 Pinned</span>}
          {post.is_locked && <span className="badge locked">🔒 Locked</span>}
          <span className="badge category" style={{ backgroundColor: post.category_slug }}>
            {post.category_name}
          </span>
        </div>
        <h1>{post.title}</h1>
        <div className="post-meta">
          <span className="author">
            by <strong>{post.author_display_name || post.author_username}</strong>
          </span>
          <span className="separator">•</span>
          <span className="date">{new Date(post.created_at).toLocaleString()}</span>
          <span className="separator">•</span>
          <span className="views">👁 {post.view_count} views</span>
        </div>
      </div>

      <div className="post-main">
        <div className="post-sidebar">
          <button
            className={`vote-button ${post.user_upvoted ? 'active' : ''}`}
            onClick={handleUpvote}
            title="Upvote"
          >
            <i className="fas fa-arrow-up"></i>
            <span>{post.upvote_count}</span>
          </button>
          <button
            className={`bookmark-button ${post.user_bookmarked ? 'active' : ''}`}
            onClick={handleBookmark}
            title="Bookmark"
          >
            <i className={`fas ${post.user_bookmarked ? 'fa-bookmark' : 'fa-bookmark'}`}></i>
            <span>{post.bookmark_count || 0}</span>
          </button>
        </div>

        <div className="post-content">
          <div className="ql-editor" dangerouslySetInnerHTML={{ __html: post.content }} />
          
          {canEditPost && (
            <div className="post-actions">
              {post.author_id === user?.id && (
                <button onClick={() => navigate(`/forum/edit-post/${post.id}`)} className="btn-edit">
                  Edit
                </button>
              )}
              <button onClick={handleDeletePost} className="btn-delete">
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="comments-section">
        <h2>
          💬 {post.comment_count} {post.comment_count === 1 ? 'Comment' : 'Comments'}
        </h2>

        {!post.is_locked && user && (
          <form onSubmit={handleSubmitComment} className="comment-form">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Write a comment..."
              rows={4}
              disabled={submittingComment}
            />
            <button type="submit" className="btn-primary" disabled={submittingComment}>
              {submittingComment ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        )}

        {post.is_locked && (
          <div className="locked-notice">
            🔒 This post is locked and not accepting new comments.
          </div>
        )}

        {!user && (
          <div className="login-notice">
            <button onClick={() => navigate('/login')} className="btn-primary">
              Login to Comment
            </button>
          </div>
        )}

        <div className="comments-list">
          {comments.length === 0 ? (
            <div className="no-comments">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="comment">
                <div className="comment-sidebar">
                  <button
                    className={`vote-button ${comment.user_upvoted ? 'active' : ''}`}
                    onClick={() => handleUpvoteComment(comment.id)}
                    title="Upvote comment"
                  >
                    👍 {comment.upvote_count}
                  </button>
                </div>
                <div className="comment-content">
                  <div className="comment-header">
                    <span className="comment-author">
                      {comment.author_display_name || comment.author_username}
                    </span>
                    {comment.is_accepted && (
                      <span className="badge accepted">✓ Accepted</span>
                    )}
                    <span className="comment-date">
                      {new Date(comment.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="comment-text">{comment.content}</div>
                  {(comment.author_id === user?.id || canModerate) && (
                    <div className="comment-actions">
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="btn-delete-small"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewPost;
