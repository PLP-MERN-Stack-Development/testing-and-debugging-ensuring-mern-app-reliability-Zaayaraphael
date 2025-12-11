require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Post = require('../src/models/Post');

const setupTestDatabase = async () => {
  try {
    console.log('Setting up test database...');

    // Connect to test database
    const dbUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/mern-testing-test';
    await mongoose.connect(dbUri);

    console.log('Connected to test database');

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    console.log('Cleared existing data');

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
      {
        username: 'admin',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
      },
    ]);

    console.log(`Created ${users.length} test users`);

    // Create test posts
    const posts = await Post.create([
      {
        title: 'First Test Post',
        content: 'This is the content of the first test post. It contains enough text to pass validation.',
        author: users[0]._id,
      },
      {
        title: 'Second Test Post',
        content: 'This is the content of the second test post. It also contains enough text to pass validation.',
        author: users[1]._id,
      },
      {
        title: 'Third Test Post',
        content: 'This is the content of the third test post. More test content here for validation purposes.',
        author: users[0]._id,
      },
    ]);

    console.log(`Created ${posts.length} test posts`);

    console.log('\nTest database setup complete!');
    console.log('\nTest Users:');
    users.forEach((user) => {
      console.log(`  - ${user.email} (password: password123)`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error setting up test database:', error);
    process.exit(1);
  }
};

setupTestDatabase();
