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
        target: 'es5',              // ES5 target for Jest (ES3 handled by webpack)
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
    'ActionManager/**/*.ts',
    '!ActionManager/**/*.d.ts',
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
  ]
};