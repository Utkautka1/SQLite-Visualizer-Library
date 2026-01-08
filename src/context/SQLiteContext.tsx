import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import {
  SQLiteContextValue,
  QueryResult,
  QueryHistoryItem,
  DatabaseSchema,
  ExportOptions,
} from '../types';
import { DatabaseManager } from '../core/database';
import { QueryHistoryManager } from '../core/queryHistory';

const SQLiteContext = createContext<SQLiteContextValue | null>(null);

interface SQLiteProviderProps {
  children: React.ReactNode;
}

export const SQLiteProvider: React.FC<SQLiteProviderProps> = ({ children }) => {
  const [db, setDb] = useState<import('sql.js').Database | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);

  const dbManagerRef = useRef<DatabaseManager | null>(null);
  const historyManagerRef = useRef<QueryHistoryManager | null>(null);

  // Initialize managers
  useEffect(() => {
    dbManagerRef.current = new DatabaseManager();
    historyManagerRef.current = new QueryHistoryManager();

    // Initialize sql.js
    dbManagerRef.current.initialize().catch((err) => {
      setError(`Failed to initialize database: ${err.message}`);
    });

    // Load history
    if (historyManagerRef.current) {
      setQueryHistory(historyManagerRef.current.getAll());
    }

    return () => {
      if (dbManagerRef.current) {
        dbManagerRef.current.close();
      }
    };
  }, []);

  const loadDatabase = useCallback(async (data: Uint8Array | ArrayBuffer) => {
    if (!dbManagerRef.current) {
      throw new Error('Database manager not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      await dbManagerRef.current.loadDatabase(data);
      const database = dbManagerRef.current.getDatabase();
      setDb(database);
    } catch (err: any) {
      setError(err.message || 'Failed to load database');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createDatabase = useCallback(() => {
    if (!dbManagerRef.current) {
      throw new Error('Database manager not initialized');
    }

    setError(null);
    try {
      dbManagerRef.current.createDatabase();
      const database = dbManagerRef.current.getDatabase();
      setDb(database);
    } catch (err: any) {
      setError(err.message || 'Failed to create database');
      throw err;
    }
  }, []);

  const executeQuery = useCallback(
    async (query: string): Promise<QueryResult> => {
      if (!dbManagerRef.current) {
        throw new Error('Database manager not initialized');
      }

      const startTime = performance.now();
      let result: QueryResult | undefined;
      let error: string | undefined;

      try {
        result = dbManagerRef.current.executeQuery(query);
        const executionTime = performance.now() - startTime;

        // Add to history
        if (historyManagerRef.current) {
          historyManagerRef.current.add(query, executionTime, result);
          setQueryHistory(historyManagerRef.current.getAll());
        }

        return result;
      } catch (err: any) {
        error = err.message || 'Query execution failed';
        const executionTime = performance.now() - startTime;

        // Add to history with error
        if (historyManagerRef.current) {
          historyManagerRef.current.add(query, executionTime, undefined, error);
          setQueryHistory(historyManagerRef.current.getAll());
        }

        throw err;
      }
    },
    []
  );

  const getSchema = useCallback((): DatabaseSchema => {
    if (!dbManagerRef.current) {
      return { tables: [], version: '0.0.0' };
    }

    return dbManagerRef.current.getSchema();
  }, []);

  const getTableInfo = useCallback(
    (tableName: string) => {
      if (!dbManagerRef.current) {
        return null;
      }

      return dbManagerRef.current.getTableInfo(tableName);
    },
    []
  );

  const exportDatabase = useCallback(
    (options?: ExportOptions): string => {
      if (!dbManagerRef.current) {
        throw new Error('Database manager not initialized');
      }

      return dbManagerRef.current.exportDatabase(options);
    },
    []
  );

  const saveDatabase = useCallback((): Uint8Array => {
    if (!dbManagerRef.current) {
      throw new Error('Database manager not initialized');
    }

    return dbManagerRef.current.saveDatabase();
  }, []);

  const closeDatabase = useCallback(() => {
    if (dbManagerRef.current) {
      dbManagerRef.current.close();
      setDb(null);
    }
  }, []);

  const addToHistory = useCallback(
    (item: Omit<QueryHistoryItem, 'id' | 'timestamp'>) => {
      if (historyManagerRef.current) {
        historyManagerRef.current.add(item.query, item.executionTime, item.result, item.error);
        setQueryHistory(historyManagerRef.current.getAll());
      }
    },
    []
  );

  const clearHistory = useCallback(() => {
    if (historyManagerRef.current) {
      historyManagerRef.current.clear();
      setQueryHistory([]);
    }
  }, []);

  const value: SQLiteContextValue = {
    db,
    isLoading,
    error,
    loadDatabase,
    createDatabase,
    executeQuery,
    getSchema,
    getTableInfo,
    exportDatabase,
    saveDatabase,
    closeDatabase,
    queryHistory,
    addToHistory,
    clearHistory,
  };

  return <SQLiteContext.Provider value={value}>{children}</SQLiteContext.Provider>;
};

export const useSQLite = (): SQLiteContextValue => {
  const context = useContext(SQLiteContext);
  if (!context) {
    throw new Error('useSQLite must be used within SQLiteProvider');
  }
  return context;
};

