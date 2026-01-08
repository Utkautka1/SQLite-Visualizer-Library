declare module 'sql.js' {
  export interface Database {
    exec(sql: string, options?: any): any[];
    prepare(sql: string): Statement;
    run(sql: string, params?: any): void;
    export(): Uint8Array;
    close(): void;
  }

  export interface Statement {
    step(): boolean;
    get(): any[];
    getColumnNames(): string[];
    free(): void;
  }

  export interface SqlJsStatic {
    Database: new (data?: Uint8Array) => Database;
  }

  export interface InitSqlJsConfig {
    locateFile?: (file: string) => string;
  }

  function initSqlJs(config?: InitSqlJsConfig): Promise<SqlJsStatic>;
  export default initSqlJs;
}

