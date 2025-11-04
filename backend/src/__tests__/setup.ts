/**
 * Global test setup file
 * Runs before all tests
 */

// Set test environment
process.env.NODE_ENV = 'test';

// Increase test timeout for integration tests
jest.setTimeout(10000);

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  log: jest.fn(), // Mock console.log
  debug: jest.fn(), // Mock console.debug
  info: jest.fn(), // Mock console.info
  warn: jest.fn(), // Mock console.warn
  // Keep error for debugging
};
