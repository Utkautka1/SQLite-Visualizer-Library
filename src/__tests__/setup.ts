// Jest setup file
import '@testing-library/jest-dom';

// Mock sql.js
jest.mock('sql.js', () => {
  return {
    __esModule: true,
    default: jest.fn(() =>
      Promise.resolve({
        Database: jest.fn().mockImplementation(() => ({
          exec: jest.fn(() => []),
          prepare: jest.fn(() => ({
            step: jest.fn(() => false),
            get: jest.fn(() => []),
            getColumnNames: jest.fn(() => []),
            free: jest.fn(),
          })),
          run: jest.fn(),
          export: jest.fn(() => new Uint8Array()),
          close: jest.fn(),
        })),
      })
    ),
  };
});

