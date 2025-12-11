/**
 * Test constants and configuration
 */

// Test user credentials
const TEST_USERS = {
  VALID_USER: {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
  },
  ANOTHER_USER: {
    username: 'anotheruser',
    email: 'another@example.com',
    password: 'password123',
  },
  ADMIN_USER: {
    username: 'admin',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
  },
};

// Test post data
const TEST_POSTS = {
  VALID_POST: {
    title: 'Test Post Title',
    content: 'This is a test post content with enough characters to pass validation.',
  },
  ANOTHER_POST: {
    title: 'Another Test Post',
    content: 'This is another test post with different content for testing purposes.',
  },
};

// Invalid data for validation testing
const INVALID_DATA = {
  USER: {
    SHORT_USERNAME: {
      username: 'ab',
      email: 'test@example.com',
      password: 'password123',
    },
    INVALID_EMAIL: {
      username: 'testuser',
      email: 'invalid-email',
      password: 'password123',
    },
    SHORT_PASSWORD: {
      username: 'testuser',
      email: 'test@example.com',
      password: '12345',
    },
    MISSING_FIELDS: {
      username: 'testuser',
    },
  },
  POST: {
    SHORT_TITLE: {
      title: 'ab',
      content: 'This is valid content',
    },
    SHORT_CONTENT: {
      title: 'Valid Title',
      content: 'short',
    },
    MISSING_TITLE: {
      content: 'This is valid content',
    },
    MISSING_CONTENT: {
      title: 'Valid Title',
    },
  },
};

// API endpoints
const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    ME: '/api/auth/me',
  },
  POSTS: {
    BASE: '/api/posts',
    BY_ID: (id) => `/api/posts/${id}`,
  },
  TEST: {
    SEED: '/api/test/seed',
    CLEAR: '/api/test/clear',
  },
};

// HTTP status codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Test timeouts
const TIMEOUTS = {
  SHORT: 1000,
  MEDIUM: 5000,
  LONG: 10000,
};

module.exports = {
  TEST_USERS,
  TEST_POSTS,
  INVALID_DATA,
  API_ENDPOINTS,
  HTTP_STATUS,
  TIMEOUTS,
};
