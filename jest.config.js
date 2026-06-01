const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  
  collectCoverage: true,
  coverageDirectory: 'coverage',
  
  collectCoverageFrom: [
    'backend/src/**/*.ts',   
    '!backend/src/**/*.d.ts' 
  ],
  
  testMatch: ['**/backend/tests/**/*.test.ts'],
  
  coverageThreshold: {
    global: {
      functions: 80
    }
  }
};