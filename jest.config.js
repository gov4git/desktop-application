const { pathsToModuleNameMapper } = require('ts-jest')

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  moduleNameMapper: {
    // eslint-disable-next-line
    // prettier-ignore
    '^\~\/shared$': '<rootDir>/src/shared/index',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  resolver: undefined,
  preset: 'ts-jest',
  runner: '@kayahr/jest-electron-runner/main',
  testEnvironment: 'node',
}
