// Cypress support file for E2E tests
// This file is processed and loaded automatically before test files

// Import commands
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests from command log (optional)
// const app = window.top;
// if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
//   const style = app.document.createElement('style');
//   style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
//   style.setAttribute('data-hide-command-log-request', '');
//   app.document.head.appendChild(style);
// }

// Preserve cookies between tests
Cypress.Cookies.debug(true);

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  // You can customize this based on your needs
  console.error('Uncaught exception:', err);
  return false;
});
