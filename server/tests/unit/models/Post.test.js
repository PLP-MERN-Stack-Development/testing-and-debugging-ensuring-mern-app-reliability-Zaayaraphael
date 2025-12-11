const mongoose = require('mongoose');
const Post = require('../../../src/models/Post');
const User = require('../../../src/models/User');
const dbHandler = require('../../utils/dbHandler');

describe('Post Model', () => {
  let testUser;

  // Connect to test database before tests
  beforeAll(async () => {
    await dbHandler.connect();
  });

  // Create a test user before each test
  beforeEach(async () => {
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });
  });

  // Clear database after each test
  afterEach(async () => {
    await dbHandler.clearDatabase();
  });

  // Close database connection after tests
  afterAll(async () => {
    await dbHandler.closeDatabase();
  });

  describe('Post creation', () => {
    it('should create a valid post', async () => {
      const postData = {
        title: 'Test Post',
        content: 'This is test post content with enough characters.',
        author: testUser._id,
      };

      const post = await Post.create(postData);

      expect(post._id).toBeDefined();
      expect(post.title).toBe(postData.title);
      expect(post.content).toBe(postData.content);
      expect(post.author.toString()).toBe(testUser._id.toString());
      expect(post.published).toBe(false); // Default value
      expect(post.createdAt).toBeDefined();
      expect(post.updatedAt).toBeDefined();
    });

    it('should generate slug from title', async () => {
      const postData = {
        title: 'Test Post Title',
        content: 'This is test post content.',
        author: testUser._id,
      };

      const post = await Post.create(postData);

      expect(post.slug).toBe('test-post-title');
    });

    it('should handle special characters in slug generation', async () => {
      const postData = {
        title: 'Test Post! @#$ Title',
        content: 'This is test post content.',
        author: testUser._id,
      };

      const post = await Post.create(postData);

      expect(post.slug).toBe('test-post-title');
      expect(post.slug).not.toContain('!');
      expect(post.slug).not.toContain('@');
    });

    it('should handle multiple spaces in slug generation', async () => {
      const postData = {
        title: 'Test    Post    Title',
        content: 'This is test post content.',
        author: testUser._id,
      };

      const post = await Post.create(postData);

      expect(post.slug).toBe('test-post-title');
      expect(post.slug).not.toContain('  ');
    });

    it('should create post with tags', async () => {
      const postData = {
        title: 'Test Post',
        content: 'This is test post content.',
        author: testUser._id,
        tags: ['javascript', 'testing', 'nodejs'],
      };

      const post = await Post.create(postData);

      expect(post.tags).toHaveLength(3);
      expect(post.tags).toContain('javascript');
      expect(post.tags).toContain('testing');
    });

    it('should create post with category', async () => {
      const categoryId = new mongoose.Types.ObjectId();
      const postData = {
        title: 'Test Post',
        content: 'This is test post content.',
        author: testUser._id,
        category: categoryId,
      };

      const post = await Post.create(postData);

      expect(post.category.toString()).toBe(categoryId.toString());
    });
  });

  describe('Post validation', () => {
    it('should require title', async () => {
      const postData = {
        content: 'This is test post content.',
        author: testUser._id,
      };

      await expect(Post.create(postData)).rejects.toThrow();
    });

    it('should require content', async () => {
      const postData = {
        title: 'Test Post',
        author: testUser._id,
      };

      await expect(Post.create(postData)).rejects.toThrow();
    });

    it('should require author', async () => {
      const postData = {
        title: 'Test Post',
        content: 'This is test post content.',
      };

      await expect(Post.create(postData)).rejects.toThrow();
    });

    it('should enforce minimum title length', async () => {
      const postData = {
        title: 'ab', // Too short
        content: 'This is test post content.',
        author: testUser._id,
      };

      await expect(Post.create(postData)).rejects.toThrow();
    });

    it('should enforce maximum title length', async () => {
      const postData = {
        title: 'a'.repeat(201), // Too long
        content: 'This is test post content.',
        author: testUser._id,
      };

      await expect(Post.create(postData)).rejects.toThrow();
    });

    it('should enforce minimum content length', async () => {
      const postData = {
        title: 'Test Post',
        content: 'short', // Too short
        author: testUser._id,
      };

      await expect(Post.create(postData)).rejects.toThrow();
    });

    it('should trim whitespace from title', async () => {
      const postData = {
        title: '  Test Post  ',
        content: 'This is test post content.',
        author: testUser._id,
      };

      const post = await Post.create(postData);

      expect(post.title).toBe('Test Post');
    });

    it('should enforce unique slug', async () => {
      const postData1 = {
        title: 'Test Post',
        content: 'This is test post content.',
        author: testUser._id,
        slug: 'test-post',
      };

      await Post.create(postData1);

      const postData2 = {
        title: 'Another Post',
        content: 'This is another post content.',
        author: testUser._id,
        slug: 'test-post', // Duplicate slug
      };

      await expect(Post.create(postData2)).rejects.toThrow();
    });
  });

  describe('Post slug generation', () => {
    it('should not regenerate slug if already set', async () => {
      const postData = {
        title: 'Test Post',
        content: 'This is test post content.',
        author: testUser._id,
        slug: 'custom-slug',
      };

      const post = await Post.create(postData);

      expect(post.slug).toBe('custom-slug');
    });

    it('should regenerate slug when title changes', async () => {
      const postData = {
        title: 'Original Title',
        content: 'This is test post content.',
        author: testUser._id,
      };

      const post = await Post.create(postData);
      const originalSlug = post.slug;

      post.title = 'Updated Title';
      await post.save();

      expect(post.slug).not.toBe(originalSlug);
      expect(post.slug).toBe('updated-title');
    });

    it('should convert slug to lowercase', async () => {
      const postData = {
        title: 'Test POST Title',
        content: 'This is test post content.',
        author: testUser._id,
      };

      const post = await Post.create(postData);

      expect(post.slug).toBe('test-post-title');
      expect(post.slug).not.toContain('POST');
    });
  });

  describe('Post published status', () => {
    it('should default to unpublished', async () => {
      const postData = {
        title: 'Test Post',
        content: 'This is test post content.',
        author: testUser._id,
      };

      const post = await Post.create(postData);

      expect(post.published).toBe(false);
    });

    it('should allow setting published status', async () => {
      const postData = {
        title: 'Test Post',
        content: 'This is test post content.',
        author: testUser._id,
        published: true,
      };

      const post = await Post.create(postData);

      expect(post.published).toBe(true);
    });
  });

  describe('Post relationships', () => {
    it('should reference author user', async () => {
      const postData = {
        title: 'Test Post',
        content: 'This is test post content.',
        author: testUser._id,
      };

      const post = await Post.create(postData);
      const populatedPost = await Post.findById(post._id).populate('author');

      expect(populatedPost.author._id.toString()).toBe(testUser._id.toString());
      expect(populatedPost.author.username).toBe(testUser.username);
    });

    it('should handle invalid author reference', async () => {
      const postData = {
        title: 'Test Post',
        content: 'This is test post content.',
        author: new mongoose.Types.ObjectId(), // Non-existent user
      };

      const post = await Post.create(postData);
      const populatedPost = await Post.findById(post._id).populate('author');

      expect(populatedPost.author).toBeNull();
    });
  });

  describe('Post tags', () => {
    it('should trim whitespace from tags', async () => {
      const postData = {
        title: 'Test Post',
        content: 'This is test post content.',
        author: testUser._id,
        tags: ['  javascript  ', '  testing  '],
      };

      const post = await Post.create(postData);

      expect(post.tags[0]).toBe('javascript');
      expect(post.tags[1]).toBe('testing');
    });

    it('should allow empty tags array', async () => {
      const postData = {
        title: 'Test Post',
        content: 'This is test post content.',
        author: testUser._id,
        tags: [],
      };

      const post = await Post.create(postData);

      expect(post.tags).toHaveLength(0);
    });
  });

  describe('Post timestamps', () => {
    it('should have createdAt timestamp', async () => {
      const postData = {
        title: 'Test Post',
        content: 'This is test post content.',
        author: testUser._id,
      };

      const post = await Post.create(postData);

      expect(post.createdAt).toBeInstanceOf(Date);
    });

    it('should have updatedAt timestamp', async () => {
      const postData = {
        title: 'Test Post',
        content: 'This is test post content.',
        author: testUser._id,
      };

      const post = await Post.create(postData);

      expect(post.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt on modification', async () => {
      const postData = {
        title: 'Test Post',
        content: 'This is test post content.',
        author: testUser._id,
      };

      const post = await Post.create(postData);
      const originalUpdatedAt = post.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      post.title = 'Updated Title';
      await post.save();

      expect(post.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
