import React from 'react';
import Button from './Button';
import './PostCard.css';

/**
 * PostCard component to display post information
 */
const PostCard = ({ post, onEdit, onDelete, showActions = false }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="post-card" data-testid="post-card">
      <div className="post-card-header">
        <h3 className="post-card-title" data-testid="post-title">
          {post.title}
        </h3>
        {post.published && (
          <span className="post-badge published" data-testid="published-badge">
            Published
          </span>
        )}
      </div>

      <div className="post-card-meta">
        <span className="post-author" data-testid="post-author">
          By {post.author?.username || 'Unknown'}
        </span>
        <span className="post-date" data-testid="post-date">
          {formatDate(post.createdAt)}
        </span>
      </div>

      <p className="post-card-content" data-testid="post-content">
        {truncateContent(post.content)}
      </p>

      {post.tags && post.tags.length > 0 && (
        <div className="post-tags" data-testid="post-tags">
          {post.tags.map((tag, index) => (
            <span key={index} className="post-tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      {showActions && (
        <div className="post-card-actions" data-testid="post-actions">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(post)}
            data-testid="edit-button"
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(post._id)}
            data-testid="delete-button"
          >
            Delete
          </Button>
        </div>
      )}
    </div>
  );
};

export default PostCard;
