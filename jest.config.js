module.exports = {
  testEnvironment: "node",
  testMatch: ["**/test/**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/test/setup.js"],
  clearMocks: true,
  restoreMocks: true,
};
