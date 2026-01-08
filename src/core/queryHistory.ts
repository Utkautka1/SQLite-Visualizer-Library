import { QueryHistoryItem, QueryResult } from '../types';

/**
 * Query history manager with optimized storage and retrieval
 */
export class QueryHistoryManager {
  private history: QueryHistoryItem[] = [];
  private maxHistorySize: number = 100;
  private storageKey: string = 'sqlite-visualizer-history';

  constructor(maxSize: number = 100) {
    this.maxHistorySize = maxSize;
    this.loadFromStorage();
  }

  /**
   * Add query to history
   */
  add(query: string, executionTime: number, result?: QueryResult, error?: string): void {
    const item: QueryHistoryItem = {
      id: this.generateId(),
      query: query.trim(),
      timestamp: Date.now(),
      executionTime,
      result,
      error,
    };

    // Remove duplicates (same query executed recently)
    this.history = this.history.filter(
      (h) => h.query !== item.query || Date.now() - h.timestamp > 60000
    );

    this.history.unshift(item);

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(0, this.maxHistorySize);
    }

    this.saveToStorage();
  }

  /**
   * Get all history items
   */
  getAll(): QueryHistoryItem[] {
    return [...this.history];
  }

  /**
   * Get history items filtered by query text
   */
  search(query: string): QueryHistoryItem[] {
    const lowerQuery = query.toLowerCase();
    return this.history.filter((item) => item.query.toLowerCase().includes(lowerQuery));
  }

  /**
   * Get recent history items
   */
  getRecent(limit: number = 10): QueryHistoryItem[] {
    return this.history.slice(0, limit);
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.history = [];
    this.saveToStorage();
  }

  /**
   * Remove specific history item
   */
  remove(id: string): void {
    this.history = this.history.filter((item) => item.id !== id);
    this.saveToStorage();
  }

  /**
   * Load history from localStorage
   */
  private loadFromStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Validate and filter out old entries (older than 30 days)
          const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
          this.history = parsed.filter((item: QueryHistoryItem) => item.timestamp > thirtyDaysAgo);
        }
      }
    } catch (error) {
      console.warn('Failed to load query history from storage:', error);
    }
  }

  /**
   * Save history to localStorage
   */
  private saveToStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // Only save recent items to avoid storage bloat
        const recentHistory = this.history.slice(0, 50);
        localStorage.setItem(this.storageKey, JSON.stringify(recentHistory));
      }
    } catch (error) {
      console.warn('Failed to save query history to storage:', error);
    }
  }

  /**
   * Generate unique ID for history item
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

