# Testing Documentation

## Overview

This document provides comprehensive information about the testing strategy, setup, and execution for the MERN Testing Suite application.

## Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Setup Instructions](#setup-instructions)
3. [Running Tests](#running-tests)
4. [Test Structure](#test-structure)
5. [Writing Tests](#writing-tests)
6. [Coverage Reports](#coverage-reports)
7. [Debugging Tests](#debugging-tests)
8. [Best Practices](#best-practices)

## Testing Strategy

Our testing approach follows the testing pyramid with three layers:

### 1. Unit Tests (Base Layer)
- **Purpose**: Test individual functions, components, and modules in isolation
- **Tools**: Jest, React Testing Library
- **Coverage**: 70%+ code coverage requirement
- **Location**: 
  - Server: `server/tests/unit/`
  - Client: `client/src/tests/unit/`

### 2. Integration Tests (Middle Layer)
- **Purpose**: Test interactions between components and API endpoints
- **Tools**: Jest, Supertest, MongoDB Memory Server
- **Location**: `server/tests/integration/`

### 3. End-to-End Tests (Top Layer)
- **Purpose**: Test complete user workflows
- **Tools**: Cypress
- **Location**: `cypress/e2e/`

## Setup Instructions

### Prerequisites
- Node.js v18 or higher
- npm or yarn
- MongoDB (for local development)

### Installation

1. **Install all dependencies:**
   ```bash
   npm run install-all
   ```

   This will install dependencies for:
   - Root project
   - Client application
   - Server application

2. **Set up environment variables:**
   ```bash
   # Copy example env file
   cp server/.env.example server/.env
   
   # Edit server/.env with your configuration
   ```

3. **Set up test database (optional):**
   ```bash
   cd server
   npm run setup-test-db
   ```

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### End-to-End Tests
```bash
# Run E2E tests headlessly
npm run test:e2e

# Open Cypress UI
npm run test:e2e:open
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Structure

### Server Tests

```
server/tests/
├── setup.js                    # Global test setup
├── utils/
│   ├── testHelpers.js         # Factory functions, test data generators
│   ├── dbHandler.js           # Database connection management
│   └── testConstants.js       # Reusable test constants
├── unit/
│   ├── utils/
│   │   ├── auth.test.js       # Auth utility tests
│   │   └── logger.test.js     # Logger tests
│   ├── middleware/
│   │   ├── auth.test.js       # Auth middleware tests
│   │   ├── errorHandler.test.js
│   │   └── requestLogger.test.js
│   └── models/
│       ├── User.test.js       # User model tests
│       └── Post.test.js       # Post model tests
└── integration/
    └── posts.test.js          # Posts API integration tests
```

### Client Tests

```
client/src/tests/
├── setup.js                    # Global test setup
├── utils/
│   ├── testHelpers.js         # React testing utilities
│   ├── mockApi.js             # Mock API handlers
│   └── testConstants.js       # Client test constants
└── unit/
    ├── Button.test.jsx        # Button component tests
    ├── Form.test.jsx          # Form component tests
    ├── ErrorBoundary.test.jsx # Error boundary tests
    └── PostCard.test.jsx      # PostCard component tests
```

### Cypress Tests

```
cypress/
├── e2e/                       # E2E test files
├── support/
│   ├── commands.js            # Custom Cypress commands
│   └── e2e.js                 # Support file
└── fixtures/                  # Test data fixtures
```

## Writing Tests

### Unit Test Example (Server)

```javascript
const { generateToken } = require('../../../src/utils/auth');

describe('Auth Utilities', () => {
  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const user = { _id: '123', email: 'test@example.com' };
      const token = generateToken(user);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });
});
```

### Component Test Example (Client)

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../components/Button';

describe('Button Component', () => {
  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Test Example

```javascript
const request = require('supertest');
const app = require('../../src/app');

describe('POST /api/posts', () => {
  it('should create a new post when authenticated', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test', content: 'Content' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Test');
  });
});
```

### E2E Test Example

```javascript
describe('User Login', () => {
  it('should login successfully with valid credentials', () => {
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="submit-button"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

## Coverage Reports

### Viewing Coverage

After running `npm run test:coverage`, coverage reports are generated in:
- `coverage/server/` - Server-side coverage
- `coverage/client/` - Client-side coverage

Open `coverage/[server|client]/index.html` in a browser to view detailed coverage reports.

### Coverage Thresholds

Minimum coverage requirements:
- **Statements**: 70%
- **Branches**: 60%
- **Functions**: 70%
- **Lines**: 70%

## Debugging Tests

### Debug Single Test

```bash
# Run only one test file
npm test -- path/to/test.js

# Run only tests matching a pattern
npm test -- --testNamePattern="should render"
```

### Debug with VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Debug Cypress Tests

```bash
# Open Cypress UI for interactive debugging
npm run test:e2e:open
```

## Best Practices

### General

1. **Test Naming**: Use descriptive test names that explain what is being tested
   ```javascript
   it('should return 401 when token is invalid', () => {})
   ```

2. **Arrange-Act-Assert**: Structure tests clearly
   ```javascript
   // Arrange
   const user = createTestUser();
   
   // Act
   const result = authenticateUser(user);
   
   // Assert
   expect(result).toBe(true);
   ```

3. **Test Isolation**: Each test should be independent
   - Use `beforeEach` and `afterEach` for setup/cleanup
   - Don't rely on test execution order

4. **Mock External Dependencies**: Isolate code under test
   ```javascript
   jest.mock('../../../src/utils/logger');
   ```

### React Testing

1. **Query Priority** (React Testing Library):
   - `getByRole` (preferred)
   - `getByLabelText`
   - `getByPlaceholderText`
   - `getByText`
   - `getByTestId` (last resort)

2. **User Events**: Use `userEvent` over `fireEvent` when possible
   ```javascript
   import userEvent from '@testing-library/user-event';
   await userEvent.type(input, 'text');
   ```

3. **Async Testing**: Use `waitFor` for async operations
   ```javascript
   await waitFor(() => {
     expect(screen.getByText('Loaded')).toBeInTheDocument();
   });
   ```

### API Testing

1. **Use Test Database**: Always use MongoDB Memory Server or separate test database
2. **Clean Up**: Clear database between tests
3. **Test All Status Codes**: Test success and error cases
4. **Test Authentication**: Test both authenticated and unauthenticated requests

### E2E Testing

1. **Use Custom Commands**: Create reusable Cypress commands
   ```javascript
   cy.login('user@example.com', 'password');
   ```

2. **Use Data Attributes**: Use `data-testid` for stable selectors
3. **Seed Data**: Use API calls to seed data before tests
4. **Clean Up**: Clear database before each test suite

## Test Utilities

### Server Test Helpers

```javascript
const {
  createTestUser,
  createTestPost,
  generateAuthToken,
  clearDatabase,
} = require('./tests/utils/testHelpers');
```

### Client Test Helpers

```javascript
import {
  renderWithRouter,
  generateMockUser,
  generateMockPost,
  setupAuthenticatedUser,
} = from './tests/utils/testHelpers';
```

### Cypress Commands

```javascript
cy.login(email, password)
cy.logout()
cy.register(username, email, password)
cy.createPost(title, content)
cy.seedDatabase()
cy.clearDatabase()
```

## Continuous Integration

Tests are automatically run in CI/CD pipeline on:
- Pull requests
- Commits to main branch

CI configuration ensures:
- All tests pass
- Coverage thresholds are met
- No linting errors

## Troubleshooting

### Common Issues

**Issue**: Tests timeout
**Solution**: Increase timeout in jest.config.js or use `jest.setTimeout()`

**Issue**: Database connection errors
**Solution**: Ensure MongoDB Memory Server is properly initialized

**Issue**: React component not rendering
**Solution**: Check if component is wrapped with necessary providers

**Issue**: Cypress tests failing
**Solution**: Ensure server is running and database is seeded

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Cypress Documentation](https://docs.cypress.io/)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
