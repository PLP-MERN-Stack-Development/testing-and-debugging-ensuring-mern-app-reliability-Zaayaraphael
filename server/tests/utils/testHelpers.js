const { faker } = require('@faker-js/faker');
const User = require('../../src/models/User');
const Post = require('../../src/models/Post');
const { generateToken } = require('../../src/utils/auth');
const mongoose = require('mongoose');

/**
 * Test Data Factory Functions
 */

/**
 * Generate user data
 * @param {Object} overrides - Override default values
 * @returns {Object} User data
 */
const generateUserData = (overrides = {}) => {
  return {
    username: faker.internet.userName(),
    email: faker.internet.email(),
    password: 'password123',
    ...overrides,
  };
};

/**
 * Generate post data
 * @param {Object} overrides - Override default values
 * @returns {Object} Post data
 */
const generatePostData = (overrides = {}) => {
  return {
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(3),
    category: new mongoose.Types.ObjectId(),
    tags: [faker.lorem.word(), faker.lorem.word()],
    ...overrides,
  };
};

/**
 * Create a test user in the database
 * @param {Object} userData - User data
 * @returns {Object} Created user
 */
const createTestUser = async (userData = {}) => {
  const data = generateUserData(userData);
  const user = await User.create(data);
  return user;
};

/**
 * Create a test post in the database
 * @param {Object} postData - Post data
 * @param {String} authorId - Author user ID
 * @returns {Object} Created post
 */
const createTestPost = async (postData = {}, authorId = null) => {
  // Create a user if no author provided
  if (!authorId) {
    const user = await createTestUser();
    authorId = user._id;
  }

  const data = generatePostData({ ...postData, author: authorId });
  const post = await Post.create(data);
  return post;
};

/**
 * Create multiple test users
 * @param {Number} count - Number of users to create
 * @returns {Array} Array of created users
 */
const createTestUsers = async (count = 3) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    const user = await createTestUser();
    users.push(user);
  }
  return users;
};

/**
 * Create multiple test posts
 * @param {Number} count - Number of posts to create
 * @param {String} authorId - Author user ID (optional)
 * @returns {Array} Array of created posts
 */
const createTestPosts = async (count = 3, authorId = null) => {
  const posts = [];
  
  // Create a user if no author provided
  if (!authorId) {
    const user = await createTestUser();
    authorId = user._id;
  }

  for (let i = 0; i < count; i++) {
    const post = await createTestPost({}, authorId);
    posts.push(post);
  }
  return posts;
};

/**
 * Generate authentication token for a user
 * @param {Object} user - User object
 * @returns {String} JWT token
 */
const generateAuthToken = (user) => {
  return generateToken(user);
};

/**
 * Create authenticated user with token
 * @param {Object} userData - User data
 * @returns {Object} User and token
 */
const createAuthenticatedUser = async (userData = {}) => {
  const user = await createTestUser(userData);
  const token = generateAuthToken(user);
  return { user, token };
};

/**
 * Database cleanup utilities
 */

/**
 * Clear all users from database
 */
const clearUsers = async () => {
  await User.deleteMany({});
};

/**
 * Clear all posts from database
 */
const clearPosts = async () => {
  await Post.deleteMany({});
};

/**
 * Clear all data from database
 */
const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

/**
 * Seed database with test data
 * @param {Object} options - Seeding options
 * @returns {Object} Seeded data
 */
const seedDatabase = async (options = {}) => {
  const {
    userCount = 3,
    postCount = 5,
  } = options;

  const users = await createTestUsers(userCount);
  const posts = [];

  // Create posts for each user
  for (const user of users) {
    const userPosts = await createTestPosts(
      Math.floor(postCount / userCount),
      user._id
    );
    posts.push(...userPosts);
  }

  return { users, posts };
};

module.exports = {
  // Data generators
  generateUserData,
  generatePostData,
  
  // Factory functions
  createTestUser,
  createTestPost,
  createTestUsers,
  createTestPosts,
  createAuthenticatedUser,
  
  // Auth helpers
  generateAuthToken,
  
  // Cleanup utilities
  clearUsers,
  clearPosts,
  clearDatabase,
  seedDatabase,
};
