// Main exports
export { SQLiteProvider, useSQLite } from './context/SQLiteContext';

// Components
export { SQLiteViewer } from './components/SQLiteViewer/SQLiteViewer';
export { QueryBuilder } from './components/QueryBuilder/QueryBuilder';
export { DataExplorer } from './components/DataExplorer/DataExplorer';
export { QueryPlan } from './components/QueryPlan/QueryPlan';
export { DatabaseManager } from './components/DatabaseManager/DatabaseManager';
export { QueryHistory } from './components/QueryHistory/QueryHistory';

// Types
export type {
  TableInfo,
  ColumnInfo,
  IndexInfo,
  ForeignKeyInfo,
  QueryResult,
  QueryHistoryItem,
  DatabaseSchema,
  ExportOptions,
  Migration,
  SQLiteContextValue,
} from './types';

// Core utilities (for advanced usage)
export { DatabaseManager as DatabaseManagerCore } from './core/database';
export { QueryHistoryManager } from './core/queryHistory';
export { SQLAutocomplete } from './core/sqlAutocomplete';
export { MigrationManager } from './core/migrations';
export { HotkeyManager } from './core/hotkeys';
export { QueryShareManager } from './core/share';

// Theme
export { theme } from './styles/theme';

