// Custom Cypress commands
// These commands can be used in any test file

/**
 * Login command
 * Usage: cy.login('user@example.com', 'password123')
 */
Cypress.Commands.add('login', (email, password) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl') || 'http://localhost:5000'}/api/auth/login`,
    body: {
      email,
      password,
    },
  }).then((response) => {
    window.localStorage.setItem('token', response.body.token);
    window.localStorage.setItem('user', JSON.stringify(response.body.user));
  });
});

/**
 * Logout command
 * Usage: cy.logout()
 */
Cypress.Commands.add('logout', () => {
  window.localStorage.removeItem('token');
  window.localStorage.removeItem('user');
  cy.visit('/');
});

/**
 * Register command
 * Usage: cy.register('username', 'user@example.com', 'password123')
 */
Cypress.Commands.add('register', (username, email, password) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl') || 'http://localhost:5000'}/api/auth/register`,
    body: {
      username,
      email,
      password,
    },
  }).then((response) => {
    window.localStorage.setItem('token', response.body.token);
    window.localStorage.setItem('user', JSON.stringify(response.body.user));
  });
});

/**
 * Create post command
 * Usage: cy.createPost('Post Title', 'Post content here')
 */
Cypress.Commands.add('createPost', (title, content) => {
  const token = window.localStorage.getItem('token');
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl') || 'http://localhost:5000'}/api/posts`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      title,
      content,
    },
  });
});

/**
 * Seed database command
 * Usage: cy.seedDatabase()
 */
Cypress.Commands.add('seedDatabase', () => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl') || 'http://localhost:5000'}/api/test/seed`,
  });
});

/**
 * Clear database command
 * Usage: cy.clearDatabase()
 */
Cypress.Commands.add('clearDatabase', () => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl') || 'http://localhost:5000'}/api/test/clear`,
  });
});
