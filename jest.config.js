/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/tests/**/*.spec.ts'
  ],
  
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        target: 'es5',              // ES5 for Jest (matches your webpack target)
        module: 'commonjs',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        moduleResolution: 'node'
      }
    }]
  },
  
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  
  collectCoverageFrom: [
    'action-manager/**/*.ts',        // Test your actual implementation
    '!action-manager/**/*.d.ts',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  maxWorkers: '50%',
  verbose: true,
  
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],
  
  // Add globals for ExtendScript compatibility in tests
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  }
};