module.exports = {
  roots: ['<rootDir>/src/test/unit'],
  testRegex: '(/src/test/.*|\\.(test|spec))\\.(ts|js)$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^glob$': '<rootDir>/src/test/unit/modules/nunjucks/__mocks__/glob.ts',
    '^@router/(.*)$': '<rootDir>/src/main/router/$1',
    '^@routes/(.*)$': '<rootDir>/src/main/routes/$1',
    '^@modules/(.*)$': '<rootDir>/src/main/modules/$1',
    '^@utils/(.*)$': '<rootDir>/src/main/utils/$1',
  },
  testPathIgnorePatterns: ['/__mocks__/'],
  coverageProvider: 'v8',
};
