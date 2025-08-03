const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  testEnvironment: 'node',
  // Do NOT include setupFilesAfterEnv for API tests
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], 
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/api/**/*.test.ts'],
};

module.exports = createJestConfig(customJestConfig);
