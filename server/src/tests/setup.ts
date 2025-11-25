// Mock the database module before any imports
const mockDb = jest.fn();
(mockDb as any).raw = jest.fn();

jest.mock('../config/database', () => ({
  db: mockDb,
}));
