module.exports = {
  roots: ['<rootDir>/src/test/unit'],
  testRegex: '(/src/test/.*|\\.(test|spec))\\.(ts|js)$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@router/(.*)$': '<rootDir>/src/main/router/$1',
    '^@routes/(.*)$': '<rootDir>/src/main/routes/$1',
    '^@modules/(.*)$': '<rootDir>/src/main/modules/$1',
  },
  testPathIgnorePatterns: ['/__mocks__/'],
  coverageProvider: 'v8',
};
