const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to the Next.js app to load next.config.js and .env files
  dir: "./",
});

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    // Handle CSS imports (with CSS modules)
    "^.+\\.(css|sass|scss)$": "identity-obj-proxy",
    // Handle image and other static file imports
    "^.+\\.(png|jpg|jpeg|gif|webp|avif|svg)$":
      "<rootDir>/test/__mocks__/fileMock.js",
  },
};

module.exports = createJestConfig(customJestConfig);
