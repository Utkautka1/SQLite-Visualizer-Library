# 🗄️ SQLite Visualizer

<div align="center">

**A powerful React library for visualizing SQLite databases directly in the browser**

[![npm version](https://badge.fury.io/js/sqlite-visualizer.svg)](https://badge.fury.io/js/sqlite-visualizer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

[Features](#-features) • [Installation](#-installation) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Demo](#-demo)

</div>

---

## 📋 Table of Contents

- [Problem & Solution](#-problem--solution)
- [Features](#-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Components](#-components)
- [API Reference](#-api-reference)
- [Examples](#-examples)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Problem & Solution

### The Problem

Working with SQLite databases in web applications has always been challenging:
- ❌ No native browser support for SQLite
- ❌ Difficult to visualize database schemas and relationships
- ❌ Lack of intuitive query building tools
- ❌ No easy way to explore data without backend infrastructure
- ❌ Query optimization requires external tools

### The Solution

**SQLite Visualizer** brings the full power of SQLite to your React applications:
- ✅ **100% Browser-Based**: Uses sql.js (WebAssembly) - no server required
- ✅ **Visual ER Diagrams**: Interactive schema visualization with relationships
- ✅ **Query Builder**: Intuitive SQL editor with autocomplete
- ✅ **Data Explorer**: Browse tables with filtering, sorting, and pagination
- ✅ **Query Plan Analyzer**: Visualize execution plans for optimization
- ✅ **Developer-Friendly**: Hotkeys, history, sharing, and more

---

## ✨ Features

### 🎨 Core Components

- **SQLiteViewer** - Interactive ER diagram with zoom, pan, and table selection
- **QueryBuilder** - SQL editor with autocomplete, syntax highlighting, and execution
- **DataExplorer** - Table viewer with advanced filtering, sorting, and pagination
- **QueryPlan** - Visual query plan analyzer with tree and table views

### 🚀 Advanced Features

- **Database Management**: Load `.db` files or create databases from scratch
- **Export Options**: Export to SQL, JSON, or CSV formats
- **Query History**: Track all executed queries with performance metrics
- **SQL Autocomplete**: Intelligent suggestions based on schema
- **Hotkeys**: DBeaver-like keyboard shortcuts for power users
- **Query Sharing**: Generate shareable links for queries
- **Migration Support**: Create and manage database migrations

### 🎯 Developer Experience

- **TypeScript**: Full type safety and IntelliSense support
- **Tree-Shaking**: Optimized bundle size
- **Styled Components**: Customizable theming
- **Zero Dependencies**: Only React and sql.js required

---

## 📦 Installation

```bash
npm install sqlite-visualizer
# or
yarn add sqlite-visualizer
# or
pnpm add sqlite-visualizer
```

### Peer Dependencies

```bash
npm install react react-dom styled-components
```

---

## 🚀 Quick Start

### 1. Wrap your app with SQLiteProvider

```tsx
import { SQLiteProvider } from 'sqlite-visualizer';

function App() {
  return (
    <SQLiteProvider>
      <YourApp />
    </SQLiteProvider>
  );
}
```

### 2. Use the components

```tsx
import { SQLiteViewer, QueryBuilder, DataExplorer } from 'sqlite-visualizer';

function DatabaseDashboard() {
  return (
    <div>
      <SQLiteViewer width={800} height={600} />
      <QueryBuilder />
      <DataExplorer />
    </div>
  );
}
```

---

## 📚 Components

### SQLiteViewer

Interactive ER diagram component for visualizing database schema.

```tsx
import { SQLiteViewer } from 'sqlite-visualizer';

<SQLiteViewer
  width={800}
  height={600}
  onTableSelect={(tableName) => console.log('Selected:', tableName)}
/>
```

**Props:**
- `width?: number` - Diagram width (default: 800)
- `height?: number` - Diagram height (default: 600)
- `onTableSelect?: (tableName: string) => void` - Callback when table is selected

### QueryBuilder

SQL query editor with autocomplete and execution.

```tsx
import { QueryBuilder } from 'sqlite-visualizer';

<QueryBuilder
  initialQuery="SELECT * FROM users;"
  onQueryChange={(query) => console.log('Query:', query)}
  onExecute={(query, result) => console.log('Result:', result)}
/>
```

**Props:**
- `initialQuery?: string` - Initial SQL query
- `onQueryChange?: (query: string) => void` - Callback on query change
- `onExecute?: (query: string, result: QueryResult) => void` - Callback on execution

**Hotkeys:**
- `Ctrl+Enter` - Execute query
- `Ctrl+Space` - Show autocomplete
- `Ctrl+Shift+F` - Format query

### DataExplorer

Table data viewer with filtering, sorting, and pagination.

```tsx
import { DataExplorer } from 'sqlite-visualizer';

<DataExplorer
  tableName="users"
  onTableChange={(tableName) => console.log('Table:', tableName)}
/>
```

**Props:**
- `tableName?: string` - Initial table to display
- `onTableChange?: (tableName: string) => void` - Callback on table change

### QueryPlan

Visual query plan analyzer.

```tsx
import { QueryPlan } from 'sqlite-visualizer';

<QueryPlan
  initialQuery="SELECT * FROM users WHERE id = 1;"
  viewMode="tree" // or "table"
/>
```

**Props:**
- `initialQuery?: string` - SQL query to analyze
- `viewMode?: 'tree' | 'table'` - Visualization mode

### DatabaseManager

Component for loading, creating, and exporting databases.

```tsx
import { DatabaseManager } from 'sqlite-visualizer';

<DatabaseManager
  onDatabaseLoaded={() => console.log('Database loaded!')}
  onDatabaseCreated={() => console.log('Database created!')}
/>
```

### QueryHistory

View and manage query execution history.

```tsx
import { QueryHistory } from 'sqlite-visualizer';

<QueryHistory
  onQuerySelect={(query) => console.log('Selected query:', query)}
  maxHeight={400}
/>
```

---

## 🔌 API Reference

### useSQLite Hook

Access the SQLite context in your components.

```tsx
import { useSQLite } from 'sqlite-visualizer';

function MyComponent() {
  const {
    db,                    // Database instance
    isLoading,             // Loading state
    error,                 // Error message
    loadDatabase,          // Load from binary data
    createDatabase,        // Create new database
    executeQuery,          // Execute SQL query
    getSchema,             // Get database schema
    getTableInfo,          // Get table information
    exportDatabase,        // Export database
    saveDatabase,          // Save as .db file
    closeDatabase,         // Close database
    queryHistory,          // Query history array
    addToHistory,          // Add to history
    clearHistory,          // Clear history
  } = useSQLite();

  // Use the methods...
}
```

### Core Utilities

```tsx
import {
  DatabaseManager as DatabaseManagerCore,
  QueryHistoryManager,
  SQLAutocomplete,
  HotkeyManager,
  QueryShareManager,
} from 'sqlite-visualizer';

// Use core utilities for advanced scenarios
```

---

## 💡 Examples

### Loading a Database File

```tsx
import { useSQLite } from 'sqlite-visualizer';

function LoadDatabase() {
  const { loadDatabase } = useSQLite();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      await loadDatabase(arrayBuffer);
    }
  };

  return <input type="file" accept=".db,.sqlite" onChange={handleFileChange} />;
}
```

### Creating a Database Programmatically

```tsx
import { useSQLite } from 'sqlite-visualizer';

function CreateDatabase() {
  const { createDatabase, executeQuery } = useSQLite();

  const setupDatabase = async () => {
    createDatabase();
    
    await executeQuery(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE
      );
    `);

    await executeQuery(`
      INSERT INTO users (name, email) VALUES
      ('John Doe', 'john@example.com'),
      ('Jane Smith', 'jane@example.com');
    `);
  };

  return <button onClick={setupDatabase}>Create Database</button>;
}
```

### Exporting Data

```tsx
import { useSQLite } from 'sqlite-visualizer';

function ExportData() {
  const { exportDatabase, db } = useSQLite();

  const handleExport = () => {
    if (!db) return;

    const sql = exportDatabase({ format: 'sql', schema: true, data: true });
    const blob = new Blob([sql], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'database.sql';
    a.click();
  };

  return <button onClick={handleExport}>Export SQL</button>;
}
```

---

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm

### Setup

```bash
# Clone the repository
git clone https://github.com/Utkautka1/SQLite-Visualizer-Library.git
cd SQLite-Visualizer-Library

# Install dependencies
npm install

# Build the library
npm run build

# Run tests
npm test

# Run demo
cd demo
npm install
npm run dev
```

### Project Structure

```
sqlite-visualizer/
├── src/
│   ├── components/      # React components
│   ├── core/           # Business logic
│   ├── context/        # React context
│   ├── styles/         # Theme and styles
│   ├── types/          # TypeScript types
│   └── index.ts        # Main export
├── demo/               # Next.js demo app
├── dist/               # Build output
└── package.json
```

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🙏 Acknowledgments

- [sql.js](https://github.com/sql-js/sql.js) - SQLite compiled to WebAssembly
- [React](https://reactjs.org/) - UI library
- [Styled Components](https://styled-components.com/) - CSS-in-JS

---

## 📞 Support

- 📧 Email: utkaplay1502craced12@gmail.com
- 💬 Issues: [GitHub Issues](https://github.com/Utkautka1/SQLite-Visualizer-Library/issues)
- 📖 Documentation: [Full Docs](https://github.com/Utkautka1/SQLite-Visualizer-Library.git)

---

<div align="center">

**Made with ❤️ for developers**

[⭐ Star on GitHub](https://github.com/Utkautka1/SQLite-Visualizer-Library.git) • [📦 npm](https://www.npmjs.com/package/sqlite-visualizer) • [🐛 Report Bug](https://github.com/Utkautka1/SQLite-Visualizer-Library/issues)

</div>

