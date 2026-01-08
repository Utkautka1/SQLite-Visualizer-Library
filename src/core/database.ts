import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import {
  TableInfo,
  ColumnInfo,
  IndexInfo,
  ForeignKeyInfo,
  QueryResult,
  DatabaseSchema,
  ExportOptions,
} from '../types';

/**
 * Core database manager with optimized business logic
 * Handles all SQLite operations through sql.js
 */
export class DatabaseManager {
  private sqlJs: SqlJsStatic | null = null;
  private db: Database | null = null;
  private initialized: boolean = false;

  /**
   * Initialize sql.js library
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      this.sqlJs = await initSqlJs({
        locateFile: (file: string) => {
          // Use CDN for sql.js WASM file
          return `https://sql.js.org/dist/${file}`;
        },
      });
      this.initialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize sql.js: ${error}`);
    }
  }

  /**
   * Load database from binary data
   */
  async loadDatabase(data: Uint8Array | ArrayBuffer): Promise<void> {
    if (!this.sqlJs) {
      await this.initialize();
    }

    if (!this.sqlJs) {
      throw new Error('sql.js not initialized');
    }

    try {
      const uint8Array = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
      this.db = new this.sqlJs.Database(uint8Array);
    } catch (error) {
      throw new Error(`Failed to load database: ${error}`);
    }
  }

  /**
   * Create a new empty database
   */
  createDatabase(): void {
    if (!this.sqlJs) {
      throw new Error('sql.js not initialized. Call initialize() first.');
    }

    try {
      this.db = new this.sqlJs.Database();
    } catch (error) {
      throw new Error(`Failed to create database: ${error}`);
    }
  }

  /**
   * Execute SQL query with optimized error handling
   */
  executeQuery(query: string): QueryResult {
    if (!this.db) {
      throw new Error('Database not loaded. Load or create a database first.');
    }

    try {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) {
        throw new Error('Empty query');
      }

      const isSelect = trimmedQuery.toLowerCase().startsWith('select');
      const isExplain = trimmedQuery.toLowerCase().startsWith('explain');

      if (isSelect || isExplain) {
        const stmt = this.db.prepare(trimmedQuery);
        const result: QueryResult = {
          columns: stmt.getColumnNames(),
          values: [],
        };

        while (stmt.step()) {
          result.values.push(stmt.get());
        }

        stmt.free();
        return result;
      } else {
        // For INSERT, UPDATE, DELETE, CREATE, etc.
        this.db.run(trimmedQuery);
        const changes = this.db.exec('SELECT changes() as changes')[0];
        const rowsAffected = changes?.values[0]?.[0] || 0;

        return {
          columns: [],
          values: [],
          rowsAffected: rowsAffected as number,
        };
      }
    } catch (error: any) {
      throw new Error(`Query execution failed: ${error.message || error}`);
    }
  }

  /**
   * Get comprehensive table information
   */
  getTableInfo(tableName: string): TableInfo | null {
    if (!this.db) {
      return null;
    }

    try {
      // Get table SQL
      const tableInfo = this.db.exec(
        `SELECT sql FROM sqlite_master WHERE type='table' AND name='${tableName}'`
      );

      if (!tableInfo.length || !tableInfo[0].values.length) {
        return null;
      }

      const sql = tableInfo[0].values[0][0] as string;

      // Get column information
      const pragmaResult = this.db.exec(`PRAGMA table_info('${tableName}')`);
      const columns: ColumnInfo[] = pragmaResult[0].values.map((row: any[]) => ({
        name: row[1] as string,
        type: row[2] as string,
        notnull: Boolean(row[3]),
        dflt_value: row[4] as string | null,
        pk: Boolean(row[5]),
      }));

      // Get indexes
      const indexes = this.getTableIndexes(tableName);

      // Get foreign keys
      const foreignKeys = this.getTableForeignKeys(tableName);

      return {
        name: tableName,
        sql,
        columns,
        indexes,
        foreignKeys,
      };
    } catch (error) {
      console.error(`Error getting table info for ${tableName}:`, error);
      return null;
    }
  }

  /**
   * Get all indexes for a table
   */
  private getTableIndexes(tableName: string): IndexInfo[] {
    if (!this.db) {
      return [];
    }

    try {
      const indexList = this.db.exec(
        `SELECT name, sql FROM sqlite_master WHERE type='index' AND tbl_name='${tableName}'`
      );

      return indexList[0]?.values.map((row: any[]) => {
        const sql = row[1] as string;
        const unique = sql?.toUpperCase().includes('UNIQUE') || false;
        // Extract column names from SQL
        const columns: string[] = [];
        const match = sql?.match(/\(([^)]+)\)/);
        if (match) {
          columns.push(...match[1].split(',').map((col) => col.trim().replace(/["`]/g, '')));
        }

        return {
          name: row[0] as string,
          unique,
          columns,
        };
      }) || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get all foreign keys for a table
   */
  private getTableForeignKeys(tableName: string): ForeignKeyInfo[] {
    if (!this.db) {
      return [];
    }

    try {
      const fkResult = this.db.exec(`PRAGMA foreign_key_list('${tableName}')`);
      if (!fkResult.length) {
        return [];
      }

      return fkResult[0].values.map((row: any[]) => ({
        from: tableName,
        to: row[2] as string,
        fromColumn: row[3] as string,
        toColumn: row[4] as string,
      }));
    } catch (error) {
      return [];
    }
  }

  /**
   * Get complete database schema
   */
  getSchema(): DatabaseSchema {
    if (!this.db) {
      return { tables: [], version: '0.0.0' };
    }

    try {
      const tablesResult = this.db.exec(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
      );

      const tableNames: string[] =
        tablesResult[0]?.values.map((row: any[]) => row[0] as string) || [];

      const tables: TableInfo[] = tableNames
        .map((name) => this.getTableInfo(name))
        .filter((info): info is TableInfo => info !== null);

      const versionResult = this.db.exec("PRAGMA user_version");
      const version = versionResult[0]?.values[0]?.[0]?.toString() || '0.0.0';

      return {
        tables,
        version,
      };
    } catch (error) {
      console.error('Error getting schema:', error);
      return { tables: [], version: '0.0.0' };
    }
  }

  /**
   * Export database with flexible options
   */
  exportDatabase(options: ExportOptions = {}): string {
    if (!this.db) {
      throw new Error('Database not loaded');
    }

    const { schema = true, data = true, format = 'sql' } = options;

    if (format === 'json') {
      return this.exportAsJSON(schema, data);
    } else if (format === 'csv') {
      return this.exportAsCSV();
    } else {
      return this.exportAsSQL(schema, data);
    }
  }

  /**
   * Export as SQL
   */
  private exportAsSQL(schema: boolean, data: boolean): string {
    if (!this.db) {
      return '';
    }

    const parts: string[] = [];

    if (schema) {
      const schemaResult = this.db.exec(
        "SELECT sql FROM sqlite_master WHERE type IN ('table', 'index', 'trigger', 'view') AND name NOT LIKE 'sqlite_%'"
      );

      if (schemaResult[0]?.values) {
        schemaResult[0].values.forEach((row: any[]) => {
          const sql = row[0];
          if (sql) {
            parts.push(sql as string);
            parts.push(';');
          }
        });
      }
    }

    if (data) {
      const tables = this.getSchema().tables;
      tables.forEach((table) => {
        const dataResult = this.db!.exec(`SELECT * FROM ${table.name}`);
        if (dataResult[0]?.values.length) {
          dataResult[0].values.forEach((row: any[]) => {
            const values = row.map((val) => {
              if (val === null) return 'NULL';
              if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
              return val;
            });
            parts.push(`INSERT INTO ${table.name} VALUES (${values.join(', ')});`);
          });
        }
      });
    }

    return parts.join('\n');
  }

  /**
   * Export as JSON
   */
  private exportAsJSON(schema: boolean, data: boolean): string {
    const schemaData = schema ? this.getSchema() : null;
    const dataExport: Record<string, any[][]> = {};

    if (data && this.db) {
      const tables = this.getSchema().tables;
      tables.forEach((table) => {
        const result = this.db!.exec(`SELECT * FROM ${table.name}`);
        if (result[0]) {
          dataExport[table.name] = result[0].values;
        }
      });
    }

    return JSON.stringify(
      {
        schema: schemaData,
        data: dataExport,
      },
      null,
      2
    );
  }

  /**
   * Export as CSV
   */
  private exportAsCSV(): string {
    if (!this.db) {
      return '';
    }

    const tables = this.getSchema().tables;
    const csvParts: string[] = [];

    tables.forEach((table) => {
      const result = this.db!.exec(`SELECT * FROM ${table.name}`);
      if (result[0]?.values.length) {
        const columns = result[0].columns;
        csvParts.push(`Table: ${table.name}`);
        csvParts.push(columns.join(','));
        result[0].values.forEach((row: any[]) => {
          csvParts.push(row.map((val) => (val === null ? '' : String(val))).join(','));
        });
        csvParts.push('');
      }
    });

    return csvParts.join('\n');
  }

  /**
   * Save database to binary format
   */
  saveDatabase(): Uint8Array {
    if (!this.db) {
      throw new Error('Database not loaded');
    }

    return this.db.export();
  }

  /**
   * Get database instance
   */
  getDatabase(): Database | null {
    return this.db;
  }

  /**
   * Close database and free resources
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Check if database is loaded
   */
  isLoaded(): boolean {
    return this.db !== null;
  }
}

