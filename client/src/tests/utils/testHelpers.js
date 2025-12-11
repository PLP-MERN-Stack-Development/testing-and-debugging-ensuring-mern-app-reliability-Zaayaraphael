import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { faker } from '@faker-js/faker';

/**
 * Custom render function that wraps components with providers
 * @param {ReactElement} ui - Component to render
 * @param {Object} options - Render options
 * @returns {Object} Render result
 */
export const renderWithRouter = (ui, options = {}) => {
  const { route = '/', ...renderOptions } = options;

  window.history.pushState({}, 'Test page', route);

  return render(ui, {
    wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter>,
    ...renderOptions,
  });
};

/**
 * Mock data generators
 */

/**
 * Generate mock user data
 * @param {Object} overrides - Override default values
 * @returns {Object} User data
 */
export const generateMockUser = (overrides = {}) => {
  return {
    id: faker.string.uuid(),
    username: faker.internet.userName(),
    email: faker.internet.email(),
    role: 'user',
    createdAt: faker.date.past().toISOString(),
    ...overrides,
  };
};

/**
 * Generate mock post data
 * @param {Object} overrides - Override default values
 * @returns {Object} Post data
 */
export const generateMockPost = (overrides = {}) => {
  return {
    _id: faker.string.uuid(),
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(3),
    author: generateMockUser(),
    slug: faker.lorem.slug(),
    published: faker.datatype.boolean(),
    tags: [faker.lorem.word(), faker.lorem.word()],
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    ...overrides,
  };
};

/**
 * Generate multiple mock posts
 * @param {Number} count - Number of posts to generate
 * @returns {Array} Array of mock posts
 */
export const generateMockPosts = (count = 5) => {
  return Array.from({ length: count }, () => generateMockPost());
};

/**
 * Mock localStorage
 */
export const mockLocalStorage = () => {
  const store = {};

  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
  };
};

/**
 * Mock API responses
 */

/**
 * Create mock API success response
 * @param {*} data - Response data
 * @returns {Object} Mock response
 */
export const mockApiSuccess = (data) => {
  return Promise.resolve({
    data,
    status: 200,
    statusText: 'OK',
  });
};

/**
 * Create mock API error response
 * @param {String} message - Error message
 * @param {Number} status - HTTP status code
 * @returns {Object} Mock error
 */
export const mockApiError = (message = 'Error', status = 500) => {
  return Promise.reject({
    response: {
      data: { error: message },
      status,
      statusText: 'Error',
    },
  });
};

/**
 * Wait for async updates
 * @param {Number} ms - Milliseconds to wait
 * @returns {Promise}
 */
export const wait = (ms = 0) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Create mock event
 * @param {String} type - Event type
 * @param {Object} properties - Event properties
 * @returns {Object} Mock event
 */
export const createMockEvent = (type = 'click', properties = {}) => {
  return {
    type,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    target: { value: '' },
    ...properties,
  };
};

/**
 * Setup authenticated user in localStorage
 * @param {Object} user - User object
 * @param {String} token - Auth token
 */
export const setupAuthenticatedUser = (user = null, token = 'mock-token') => {
  const mockUser = user || generateMockUser();
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(mockUser));
  return { user: mockUser, token };
};

/**
 * Clear authentication from localStorage
 */
export const clearAuthentication = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Mock console methods to suppress output in tests
 */
export const suppressConsole = () => {
  const originalConsole = { ...console };
  
  beforeAll(() => {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  afterAll(() => {
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
  });
};
