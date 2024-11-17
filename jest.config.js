module.exports = {
  // Indicates that we are using TypeScript with Jest
  preset: 'ts-jest',

  // Specifies the testing environment (e.g., jsdom for browser-like environment, node for Node.js)
  testEnvironment: 'node',

  // Configures module resolution to work with TypeScript file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Tells Jest to look for test files with any of these patterns in their filenames
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],

  // Optional: Custom compiler options (e.g., paths or moduleNameMapper for aliasing)
  // globals: {
  //   'ts-jest': {
  //     tsconfig: 'tsconfig.json',
  //   },
  // },
};
