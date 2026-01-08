import { Migration } from '../types';

/**
 * Migration manager for database schema changes
 */
export class MigrationManager {
  private migrations: Migration[] = [];

  /**
   * Create a new migration
   */
  createMigration(name: string, up: string, down: string): Migration {
    const migration: Migration = {
      id: this.generateId(),
      name,
      up,
      down,
      timestamp: Date.now(),
    };

    this.migrations.push(migration);
    return migration;
  }

  /**
   * Get all migrations
   */
  getAll(): Migration[] {
    return [...this.migrations];
  }

  /**
   * Get migration by ID
   */
  getById(id: string): Migration | null {
    return this.migrations.find((m) => m.id === id) || null;
  }

  /**
   * Generate SQL for all migrations
   */
  generateMigrationSQL(): string {
    return this.migrations
      .map((m) => `-- Migration: ${m.name}\n${m.up}`)
      .join('\n\n');
  }

  /**
   * Generate rollback SQL
   */
  generateRollbackSQL(): string {
    return this.migrations
      .reverse()
      .map((m) => `-- Rollback: ${m.name}\n${m.down}`)
      .join('\n\n');
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

