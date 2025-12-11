import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PostCard from '../../components/PostCard';
import { generateMockPost } from '../utils/testHelpers';

describe('PostCard Component', () => {
  const mockPost = generateMockPost({
    title: 'Test Post Title',
    content: 'This is test post content that is long enough to display properly.',
    author: { username: 'testuser' },
    createdAt: '2024-01-15T10:00:00.000Z',
    tags: ['javascript', 'testing'],
    published: true,
  });

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    mockOnEdit.mockClear();
    mockOnDelete.mockClear();
  });

  describe('Rendering', () => {
    it('should render post title', () => {
      render(<PostCard post={mockPost} />);

      expect(screen.getByTestId('post-title')).toHaveTextContent('Test Post Title');
    });

    it('should render post content', () => {
      render(<PostCard post={mockPost} />);

      expect(screen.getByTestId('post-content')).toBeInTheDocument();
    });

    it('should render author username', () => {
      render(<PostCard post={mockPost} />);

      expect(screen.getByTestId('post-author')).toHaveTextContent('By testuser');
    });

    it('should render formatted date', () => {
      render(<PostCard post={mockPost} />);

      const dateElement = screen.getByTestId('post-date');
      expect(dateElement).toBeInTheDocument();
      expect(dateElement.textContent).toMatch(/January 15, 2024/);
    });

    it('should render published badge when post is published', () => {
      render(<PostCard post={mockPost} />);

      expect(screen.getByTestId('published-badge')).toBeInTheDocument();
      expect(screen.getByTestId('published-badge')).toHaveTextContent('Published');
    });

    it('should not render published badge when post is not published', () => {
      const unpublishedPost = { ...mockPost, published: false };
      render(<PostCard post={unpublishedPost} />);

      expect(screen.queryByTestId('published-badge')).not.toBeInTheDocument();
    });

    it('should render tags', () => {
      render(<PostCard post={mockPost} />);

      const tagsContainer = screen.getByTestId('post-tags');
      expect(tagsContainer).toBeInTheDocument();
      expect(screen.getByText('javascript')).toBeInTheDocument();
      expect(screen.getByText('testing')).toBeInTheDocument();
    });

    it('should not render tags section when no tags', () => {
      const postWithoutTags = { ...mockPost, tags: [] };
      render(<PostCard post={postWithoutTags} />);

      expect(screen.queryByTestId('post-tags')).not.toBeInTheDocument();
    });

    it('should handle missing author gracefully', () => {
      const postWithoutAuthor = { ...mockPost, author: null };
      render(<PostCard post={postWithoutAuthor} />);

      expect(screen.getByTestId('post-author')).toHaveTextContent('By Unknown');
    });
  });

  describe('Content truncation', () => {
    it('should truncate long content', () => {
      const longContent = 'a'.repeat(200);
      const postWithLongContent = { ...mockPost, content: longContent };
      
      render(<PostCard post={postWithLongContent} />);

      const contentElement = screen.getByTestId('post-content');
      expect(contentElement.textContent).toHaveLength(154); // 150 + '...'
      expect(contentElement.textContent).toMatch(/\.\.\.$/);
    });

    it('should not truncate short content', () => {
      const shortContent = 'Short content';
      const postWithShortContent = { ...mockPost, content: shortContent };
      
      render(<PostCard post={postWithShortContent} />);

      const contentElement = screen.getByTestId('post-content');
      expect(contentElement.textContent).toBe(shortContent);
      expect(contentElement.textContent).not.toMatch(/\.\.\.$/);
    });
  });

  describe('Actions', () => {
    it('should not show actions by default', () => {
      render(<PostCard post={mockPost} />);

      expect(screen.queryByTestId('post-actions')).not.toBeInTheDocument();
    });

    it('should show actions when showActions is true', () => {
      render(
        <PostCard
          post={mockPost}
          showActions={true}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('post-actions')).toBeInTheDocument();
      expect(screen.getByTestId('edit-button')).toBeInTheDocument();
      expect(screen.getByTestId('delete-button')).toBeInTheDocument();
    });

    it('should call onEdit when edit button is clicked', () => {
      render(
        <PostCard
          post={mockPost}
          showActions={true}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByTestId('edit-button');
      fireEvent.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledTimes(1);
      expect(mockOnEdit).toHaveBeenCalledWith(mockPost);
    });

    it('should call onDelete when delete button is clicked', () => {
      render(
        <PostCard
          post={mockPost}
          showActions={true}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByTestId('delete-button');
      fireEvent.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
      expect(mockOnDelete).toHaveBeenCalledWith(mockPost._id);
    });
  });

  describe('Date formatting', () => {
    it('should format date correctly', () => {
      const testDates = [
        { input: '2024-01-01T00:00:00.000Z', expected: 'January 1, 2024' },
        { input: '2024-12-31T23:59:59.999Z', expected: 'December 31, 2024' },
      ];

      testDates.forEach(({ input, expected }) => {
        const post = { ...mockPost, createdAt: input };
        const { unmount } = render(<PostCard post={post} />);

        expect(screen.getByTestId('post-date').textContent).toMatch(expected);
        unmount();
      });
    });
  });

  describe('Styling', () => {
    it('should have post-card class', () => {
      render(<PostCard post={mockPost} />);

      const card = screen.getByTestId('post-card');
      expect(card).toHaveClass('post-card');
    });

    it('should apply published badge styling', () => {
      render(<PostCard post={mockPost} />);

      const badge = screen.getByTestId('published-badge');
      expect(badge).toHaveClass('post-badge', 'published');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty tags array', () => {
      const postWithEmptyTags = { ...mockPost, tags: [] };
      render(<PostCard post={postWithEmptyTags} />);

      expect(screen.queryByTestId('post-tags')).not.toBeInTheDocument();
    });

    it('should handle undefined tags', () => {
      const postWithUndefinedTags = { ...mockPost, tags: undefined };
      render(<PostCard post={postWithUndefinedTags} />);

      expect(screen.queryByTestId('post-tags')).not.toBeInTheDocument();
    });

    it('should handle missing author object', () => {
      const postWithoutAuthor = { ...mockPost, author: undefined };
      render(<PostCard post={postWithoutAuthor} />);

      expect(screen.getByTestId('post-author')).toHaveTextContent('By Unknown');
    });
  });
});
