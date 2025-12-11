import { generateMockUser, generateMockPost, generateMockPosts } from './testHelpers';

/**
 * Mock API handlers for testing
 */

/**
 * Mock authentication API
 */
export const mockAuthApi = {
  login: jest.fn((email, password) => {
    if (email === 'test@example.com' && password === 'password123') {
      const user = generateMockUser({ email });
      return Promise.resolve({
        data: {
          success: true,
          token: 'mock-jwt-token',
          user,
        },
      });
    }
    return Promise.reject({
      response: {
        data: { error: 'Invalid credentials' },
        status: 401,
      },
    });
  }),

  register: jest.fn((username, email, password) => {
    const user = generateMockUser({ username, email });
    return Promise.resolve({
      data: {
        success: true,
        token: 'mock-jwt-token',
        user,
      },
    });
  }),

  getMe: jest.fn(() => {
    const user = generateMockUser();
    return Promise.resolve({
      data: {
        success: true,
        user,
      },
    });
  }),
};

/**
 * Mock posts API
 */
export const mockPostsApi = {
  getPosts: jest.fn((params = {}) => {
    const posts = generateMockPosts(5);
    return Promise.resolve({
      data: posts,
    });
  }),

  getPost: jest.fn((id) => {
    const post = generateMockPost({ _id: id });
    return Promise.resolve({
      data: post,
    });
  }),

  createPost: jest.fn((postData) => {
    const post = generateMockPost(postData);
    return Promise.resolve({
      data: post,
      status: 201,
    });
  }),

  updatePost: jest.fn((id, postData) => {
    const post = generateMockPost({ _id: id, ...postData });
    return Promise.resolve({
      data: post,
    });
  }),

  deletePost: jest.fn((id) => {
    return Promise.resolve({
      data: { success: true, message: 'Post deleted' },
    });
  }),
};

/**
 * Reset all mock API functions
 */
export const resetMockApi = () => {
  Object.values(mockAuthApi).forEach((fn) => fn.mockClear());
  Object.values(mockPostsApi).forEach((fn) => fn.mockClear());
};

/**
 * Setup mock API with custom responses
 */
export const setupMockApi = (customMocks = {}) => {
  return {
    ...mockAuthApi,
    ...mockPostsApi,
    ...customMocks,
  };
};
