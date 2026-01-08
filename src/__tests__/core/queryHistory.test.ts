import { QueryHistoryManager } from '../../core/queryHistory';
import { QueryResult } from '../../types';

describe('QueryHistoryManager', () => {
  let historyManager: QueryHistoryManager;

  beforeEach(() => {
    historyManager = new QueryHistoryManager(10);
  });

  describe('add', () => {
    it('should add query to history', () => {
      historyManager.add('SELECT * FROM users', 10.5);
      const history = historyManager.getAll();
      expect(history).toHaveLength(1);
      expect(history[0].query).toBe('SELECT * FROM users');
      expect(history[0].executionTime).toBe(10.5);
    });

    it('should limit history size', () => {
      for (let i = 0; i < 15; i++) {
        historyManager.add(`SELECT ${i}`, 1);
      }
      const history = historyManager.getAll();
      expect(history.length).toBeLessThanOrEqual(10);
    });

    it('should add result to history', () => {
      const result: QueryResult = {
        columns: ['id', 'name'],
        values: [[1, 'John']],
      };
      historyManager.add('SELECT * FROM users', 5, result);
      const history = historyManager.getAll();
      expect(history[0].result).toEqual(result);
    });

    it('should add error to history', () => {
      historyManager.add('SELECT * FROM invalid', 1, undefined, 'Table not found');
      const history = historyManager.getAll();
      expect(history[0].error).toBe('Table not found');
    });
  });

  describe('search', () => {
    it('should find queries by text', () => {
      historyManager.add('SELECT * FROM users', 1);
      historyManager.add('SELECT * FROM posts', 1);
      historyManager.add('INSERT INTO users', 1);

      const results = historyManager.search('users');
      expect(results).toHaveLength(2);
    });
  });

  describe('clear', () => {
    it('should clear all history', () => {
      historyManager.add('SELECT 1', 1);
      historyManager.add('SELECT 2', 1);
      historyManager.clear();
      expect(historyManager.getAll()).toHaveLength(0);
    });
  });
});

