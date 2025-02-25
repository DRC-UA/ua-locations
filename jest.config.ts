/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: false,
  noStackTrace: true,
  testTimeout: 20000,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Path to your setup file
  extensionsToTreatAsEsm: [".ts"],
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
}
