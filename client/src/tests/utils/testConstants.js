/**
 * Client-side test constants
 */

// Test routes
export const TEST_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  POSTS: '/posts',
  POST_DETAIL: (id) => `/posts/${id}`,
  CREATE_POST: '/posts/create',
  EDIT_POST: (id) => `/posts/${id}/edit`,
  PROFILE: '/profile',
};

// Test user data
export const TEST_USER = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
};

// Test post data
export const TEST_POST = {
  title: 'Test Post Title',
  content: 'This is test post content with enough text to pass validation requirements.',
  tags: ['test', 'example'],
};

// Form field names
export const FORM_FIELDS = {
  AUTH: {
    USERNAME: 'username',
    EMAIL: 'email',
    PASSWORD: 'password',
    CONFIRM_PASSWORD: 'confirmPassword',
  },
  POST: {
    TITLE: 'title',
    CONTENT: 'content',
    TAGS: 'tags',
    PUBLISHED: 'published',
  },
};

// Error messages
export const ERROR_MESSAGES = {
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid credentials',
    UNAUTHORIZED: 'Not authorized',
    TOKEN_EXPIRED: 'Token expired',
  },
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Please provide a valid email',
    SHORT_PASSWORD: 'Password must be at least 6 characters',
    SHORT_TITLE: 'Title must be at least 3 characters',
    SHORT_CONTENT: 'Content must be at least 10 characters',
  },
  NETWORK: {
    CONNECTION_ERROR: 'Network error',
    SERVER_ERROR: 'Server error',
  },
};

// Success messages
export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Login successful',
    REGISTER_SUCCESS: 'Registration successful',
    LOGOUT_SUCCESS: 'Logout successful',
  },
  POST: {
    CREATE_SUCCESS: 'Post created successfully',
    UPDATE_SUCCESS: 'Post updated successfully',
    DELETE_SUCCESS: 'Post deleted successfully',
  },
};

// Test IDs for querying elements
export const TEST_IDS = {
  BUTTON: {
    SUBMIT: 'submit-button',
    CANCEL: 'cancel-button',
    DELETE: 'delete-button',
    EDIT: 'edit-button',
  },
  FORM: {
    LOGIN: 'login-form',
    REGISTER: 'register-form',
    POST: 'post-form',
  },
  INPUT: {
    EMAIL: 'email-input',
    PASSWORD: 'password-input',
    USERNAME: 'username-input',
    TITLE: 'title-input',
    CONTENT: 'content-input',
  },
  CONTAINER: {
    POST_LIST: 'post-list',
    POST_CARD: 'post-card',
    NAVBAR: 'navbar',
    FOOTER: 'footer',
  },
};

// API configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  TIMEOUT: 5000,
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};
