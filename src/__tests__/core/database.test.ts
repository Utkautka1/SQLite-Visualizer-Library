import { DatabaseManager } from '../../core/database';

describe('DatabaseManager', () => {
  let dbManager: DatabaseManager;

  beforeEach(() => {
    dbManager = new DatabaseManager();
  });

  afterEach(() => {
    dbManager.close();
  });

  describe('initialize', () => {
    it('should initialize sql.js', async () => {
      await expect(dbManager.initialize()).resolves.not.toThrow();
    });

    it('should be idempotent', async () => {
      await dbManager.initialize();
      await expect(dbManager.initialize()).resolves.not.toThrow();
    });
  });

  describe('createDatabase', () => {
    it('should create a new database after initialization', async () => {
      await dbManager.initialize();
      expect(() => dbManager.createDatabase()).not.toThrow();
      expect(dbManager.isLoaded()).toBe(true);
    });

    it('should throw error if not initialized', () => {
      expect(() => dbManager.createDatabase()).toThrow();
    });
  });

  describe('getSchema', () => {
    it('should return empty schema when no database loaded', () => {
      const schema = dbManager.getSchema();
      expect(schema).toEqual({ tables: [], version: '0.0.0' });
    });
  });

  describe('isLoaded', () => {
    it('should return false initially', () => {
      expect(dbManager.isLoaded()).toBe(false);
    });
  });
});

