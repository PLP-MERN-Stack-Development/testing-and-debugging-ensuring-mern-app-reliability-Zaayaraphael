const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');

/**
 * Seed database with test data
 * Only available in test environment
 */
router.post('/seed', async (req, res) => {
  try {
    // Create test users
    const users = await User.create([
      {
        username: 'testuser1',
        email: 'test1@example.com',
        password: 'password123',
      },
      {
        username: 'testuser2',
        email: 'test2@example.com',
        password: 'password123',
      },
    ]);

    // Create test posts
    await Post.create([
      {
        title: 'Test Post 1',
        content: 'This is test post content 1',
        author: users[0]._id,
      },
      {
        title: 'Test Post 2',
        content: 'This is test post content 2',
        author: users[1]._id,
      },
    ]);

    res.status(200).json({ message: 'Database seeded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Clear all data from database
 * Only available in test environment
 */
router.post('/clear', async (req, res) => {
  try {
    await User.deleteMany({});
    await Post.deleteMany({});
    res.status(200).json({ message: 'Database cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
