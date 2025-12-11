const { validationResult } = require('express-validator');
const Post = require('../models/Post');

/**
 * Get all posts
 * GET /api/posts
 */
exports.getPosts = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;

    // Build query
    const query = {};
    if (category) {
      query.category = category;
    }

    // Execute query with pagination
    const posts = await Post.find(query)
      .populate('author', 'username email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Post.countDocuments(query);

    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
};

/**
 * Get single post
 * GET /api/posts/:id
 */
exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username email');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new post
 * POST /api/posts
 */
exports.createPost = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { title, content, category, tags } = req.body;

    const post = await Post.create({
      title,
      content,
      author: req.user.id,
      category,
      tags,
    });

    const populatedPost = await Post.findById(post._id).populate('author', 'username email');

    res.status(201).json(populatedPost);
  } catch (error) {
    next(error);
  }
};

/**
 * Update post
 * PUT /api/posts/:id
 */
exports.updatePost = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this post' });
    }

    const { title, content, category, tags, published } = req.body;

    post = await Post.findByIdAndUpdate(
      req.params.id,
      { title, content, category, tags, published },
      { new: true, runValidators: true }
    ).populate('author', 'username email');

    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete post
 * DELETE /api/posts/:id
 */
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await post.deleteOne();

    res.status(200).json({ success: true, message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
};
