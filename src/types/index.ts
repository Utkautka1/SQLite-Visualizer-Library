import { Database } from 'sql.js';

export interface TableInfo {
  name: string;
  sql: string;
  columns: ColumnInfo[];
  indexes: IndexInfo[];
  foreignKeys: ForeignKeyInfo[];
}

export interface ColumnInfo {
  name: string;
  type: string;
  notnull: boolean;
  dflt_value: string | null;
  pk: boolean;
}

export interface IndexInfo {
  name: string;
  unique: boolean;
  columns: string[];
}

export interface ForeignKeyInfo {
  from: string;
  to: string;
  fromColumn: string;
  toColumn: string;
}

export interface QueryResult {
  columns: string[];
  values: any[][];
  rowsAffected?: number;
}

export interface QueryHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  executionTime: number;
  result?: QueryResult;
  error?: string;
}

export interface DatabaseSchema {
  tables: TableInfo[];
  version: string;
}

export interface ExportOptions {
  schema?: boolean;
  data?: boolean;
  format?: 'sql' | 'json' | 'csv';
}

export interface Migration {
  id: string;
  name: string;
  up: string;
  down: string;
  timestamp: number;
}

export interface SQLiteContextValue {
  db: Database | null;
  isLoading: boolean;
  error: string | null;
  loadDatabase: (data: Uint8Array | ArrayBuffer) => Promise<void>;
  createDatabase: () => void;
  executeQuery: (query: string) => Promise<QueryResult>;
  getSchema: () => DatabaseSchema;
  getTableInfo: (tableName: string) => TableInfo | null;
  exportDatabase: (options?: ExportOptions) => string;
  saveDatabase: () => Uint8Array;
  closeDatabase: () => void;
  queryHistory: QueryHistoryItem[];
  addToHistory: (item: Omit<QueryHistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
}

