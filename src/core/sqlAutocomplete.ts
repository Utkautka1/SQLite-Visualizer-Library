import { TableInfo, DatabaseSchema } from '../types';

/**
 * SQL autocomplete engine with intelligent suggestions
 */
export class SQLAutocomplete {
  private schema: DatabaseSchema | null = null;
  private keywords: string[] = [
    'SELECT',
    'FROM',
    'WHERE',
    'JOIN',
    'INNER',
    'LEFT',
    'RIGHT',
    'FULL',
    'OUTER',
    'ON',
    'AS',
    'AND',
    'OR',
    'NOT',
    'IN',
    'LIKE',
    'BETWEEN',
    'IS',
    'NULL',
    'ORDER',
    'BY',
    'GROUP',
    'HAVING',
    'LIMIT',
    'OFFSET',
    'INSERT',
    'INTO',
    'VALUES',
    'UPDATE',
    'SET',
    'DELETE',
    'CREATE',
    'TABLE',
    'ALTER',
    'DROP',
    'INDEX',
    'PRIMARY',
    'KEY',
    'FOREIGN',
    'REFERENCES',
    'UNIQUE',
    'NOT',
    'DEFAULT',
    'AUTOINCREMENT',
    'INTEGER',
    'TEXT',
    'REAL',
    'BLOB',
    'NUMERIC',
    'BOOLEAN',
    'DATE',
    'DATETIME',
    'COUNT',
    'SUM',
    'AVG',
    'MAX',
    'MIN',
    'DISTINCT',
    'EXPLAIN',
    'QUERY',
    'PLAN',
  ];

  /**
   * Update schema for autocomplete suggestions
   */
  updateSchema(schema: DatabaseSchema): void {
    this.schema = schema;
  }

  /**
   * Get autocomplete suggestions based on current cursor position and context
   */
  getSuggestions(query: string, cursorPosition: number): Array<{ label: string; type: string }> {
    const suggestions: Array<{ label: string; type: string }> = [];
    const beforeCursor = query.substring(0, cursorPosition);
    const afterCursor = query.substring(cursorPosition);
    const wordMatch = beforeCursor.match(/(\w+)$/);
    const currentWord = wordMatch ? wordMatch[1].toUpperCase() : '';

    // Get context from query
    const context = this.getContext(beforeCursor);

    // Suggest keywords
    if (this.shouldSuggestKeywords(context)) {
      const matchingKeywords = this.keywords.filter((kw) =>
        kw.startsWith(currentWord.toUpperCase())
      );
      matchingKeywords.forEach((kw) => {
        suggestions.push({ label: kw, type: 'keyword' });
      });
    }

    // Suggest table names
    if (this.shouldSuggestTables(context)) {
      const tableNames = this.schema?.tables.map((t) => t.name) || [];
      const matchingTables = tableNames.filter((t) =>
        t.toLowerCase().startsWith(currentWord.toLowerCase())
      );
      matchingTables.forEach((table) => {
        suggestions.push({ label: table, type: 'table' });
      });
    }

    // Suggest column names
    if (this.shouldSuggestColumns(context)) {
      const columns = this.getRelevantColumns(beforeCursor);
      const matchingColumns = columns.filter((col) =>
        col.toLowerCase().startsWith(currentWord.toLowerCase())
      );
      matchingColumns.forEach((col) => {
        suggestions.push({ label: col, type: 'column' });
      });
    }

    // Sort suggestions: keywords first, then tables, then columns
    return suggestions.sort((a, b) => {
      const order = { keyword: 0, table: 1, column: 2 };
      return (order[a.type as keyof typeof order] || 3) - (order[b.type as keyof typeof order] || 3);
    });
  }

  /**
   * Determine query context
   */
  private getContext(query: string): {
    afterSelect: boolean;
    afterFrom: boolean;
    afterJoin: boolean;
    afterWhere: boolean;
    afterOn: boolean;
  } {
    const upperQuery = query.toUpperCase();
    const lastSelect = upperQuery.lastIndexOf('SELECT');
    const lastFrom = upperQuery.lastIndexOf('FROM');
    const lastJoin = upperQuery.lastIndexOf('JOIN');
    const lastWhere = upperQuery.lastIndexOf('WHERE');
    const lastOn = upperQuery.lastIndexOf('ON');

    return {
      afterSelect: lastSelect > lastFrom && lastSelect > lastJoin,
      afterFrom: lastFrom > lastSelect && lastFrom > lastJoin,
      afterJoin: lastJoin > lastFrom,
      afterWhere: lastWhere > lastFrom,
      afterOn: lastOn > lastJoin,
    };
  }

  /**
   * Check if keywords should be suggested
   */
  private shouldSuggestKeywords(context: any): boolean {
    return true; // Always suggest keywords
  }

  /**
   * Check if tables should be suggested
   */
  private shouldSuggestTables(context: any): boolean {
    return context.afterFrom || context.afterJoin;
  }

  /**
   * Check if columns should be suggested
   */
  private shouldSuggestColumns(context: any): boolean {
    return context.afterSelect || context.afterWhere || context.afterOn;
  }

  /**
   * Get relevant columns based on query context
   */
  private getRelevantColumns(query: string): string[] {
    if (!this.schema) {
      return [];
    }

    const upperQuery = query.toUpperCase();
    const fromMatch = upperQuery.match(/FROM\s+(\w+)/);
    const joinMatch = upperQuery.match(/JOIN\s+(\w+)/);

    const tables: string[] = [];
    if (fromMatch) {
      tables.push(fromMatch[1]);
    }
    if (joinMatch) {
      tables.push(joinMatch[1]);
    }

    const columns: string[] = [];
    tables.forEach((tableName) => {
      const table = this.schema!.tables.find((t) => t.name.toLowerCase() === tableName.toLowerCase());
      if (table) {
        columns.push(...table.columns.map((col) => col.name));
      }
    });

    // If no specific table, return all columns from all tables
    if (columns.length === 0) {
      this.schema.tables.forEach((table) => {
        columns.push(...table.columns.map((col) => `${table.name}.${col.name}`));
      });
    }

    return columns;
  }
}

