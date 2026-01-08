/**
 * Utility to create a sample SQLite database with test data
 * This creates a realistic database schema with relationships
 */

export interface SampleDatabaseConfig {
  includeData?: boolean;
}

/**
 * SQL script to create a sample database with multiple related tables
 */
export function getSampleDatabaseSQL(config: SampleDatabaseConfig = {}): string {
  const { includeData = true } = config;

  const schema = `
-- Sample E-Commerce Database Schema

-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active INTEGER DEFAULT 1
);

-- Categories table
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id INTEGER,
  FOREIGN KEY (parent_id) REFERENCES categories(id)
);

-- Products table
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  category_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Orders table
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  total_amount REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order items table
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Reviews table
CREATE TABLE reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for better query performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
`;

  if (!includeData) {
    return schema;
  }

  const data = `
-- Insert sample data

-- Users
INSERT INTO users (username, email, full_name, is_active) VALUES
  ('john_doe', 'john.doe@example.com', 'John Doe', 1),
  ('jane_smith', 'jane.smith@example.com', 'Jane Smith', 1),
  ('bob_wilson', 'bob.wilson@example.com', 'Bob Wilson', 1),
  ('alice_brown', 'alice.brown@example.com', 'Alice Brown', 1),
  ('charlie_davis', 'charlie.davis@example.com', 'Charlie Davis', 0);

-- Categories
INSERT INTO categories (name, description, parent_id) VALUES
  ('Electronics', 'Electronic devices and accessories', NULL),
  ('Computers', 'Laptops, desktops, and components', 1),
  ('Phones', 'Smartphones and accessories', 1),
  ('Clothing', 'Apparel and fashion items', NULL),
  ('Men''s Clothing', 'Clothing for men', 4),
  ('Women''s Clothing', 'Clothing for women', 4),
  ('Books', 'Books and e-books', NULL),
  ('Fiction', 'Fiction books', 7),
  ('Non-Fiction', 'Non-fiction books', 7);

-- Products
INSERT INTO products (name, description, price, stock_quantity, category_id) VALUES
  ('MacBook Pro 16"', 'Apple MacBook Pro with M2 chip', 2499.99, 15, 2),
  ('iPhone 15 Pro', 'Latest iPhone with Pro features', 999.99, 50, 3),
  ('Samsung Galaxy S24', 'Flagship Android smartphone', 899.99, 30, 3),
  ('Dell XPS 13', 'Ultrabook laptop', 1299.99, 20, 2),
  ('Men''s T-Shirt', 'Cotton t-shirt for men', 19.99, 100, 5),
  ('Women''s Dress', 'Elegant summer dress', 49.99, 75, 6),
  ('The Great Gatsby', 'Classic American novel', 12.99, 200, 8),
  ('Sapiens', 'A Brief History of Humankind', 16.99, 150, 9),
  ('AirPods Pro', 'Wireless earbuds with noise cancellation', 249.99, 80, 1),
  ('iPad Air', 'Tablet with M1 chip', 599.99, 40, 1);

-- Orders
INSERT INTO orders (user_id, total_amount, status, created_at) VALUES
  (1, 2499.99, 'completed', datetime('now', '-10 days')),
  (1, 999.99, 'completed', datetime('now', '-5 days')),
  (2, 1299.99, 'pending', datetime('now', '-2 days')),
  (2, 69.98, 'completed', datetime('now', '-1 day')),
  (3, 899.99, 'shipped', datetime('now', '-3 days')),
  (4, 16.99, 'completed', datetime('now', '-7 days'));

-- Order Items
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
  (1, 1, 1, 2499.99),
  (2, 2, 1, 999.99),
  (3, 4, 1, 1299.99),
  (4, 5, 2, 19.99),
  (4, 6, 1, 49.99),
  (5, 3, 1, 899.99),
  (6, 8, 1, 16.99);

-- Reviews
INSERT INTO reviews (product_id, user_id, rating, comment, created_at) VALUES
  (1, 1, 5, 'Excellent laptop, very fast and reliable!', datetime('now', '-8 days')),
  (2, 1, 5, 'Best phone I''ve ever had. Camera is amazing!', datetime('now', '-3 days')),
  (3, 3, 4, 'Great Android phone, good value for money.', datetime('now', '-1 day')),
  (4, 2, 4, 'Lightweight and powerful, perfect for work.', datetime('now', '-1 day')),
  (5, 2, 5, 'Comfortable and good quality fabric.', datetime('now', '-1 day')),
  (7, 4, 5, 'A timeless classic, highly recommended!', datetime('now', '-5 days')),
  (8, 4, 5, 'Fascinating read about human history.', datetime('now', '-6 days')),
  (9, 1, 5, 'Best earbuds I''ve used. Noise cancellation is perfect!', datetime('now', '-4 days'));
`;

  return schema + data;
}

/**
 * Create a sample database using the SQLite context
 */
export async function createSampleDatabase(
  executeQuery: (query: string) => Promise<any>,
  createDatabase: () => void
): Promise<void> {
  // Create empty database
  createDatabase();

  // Get SQL script
  const sql = getSampleDatabaseSQL({ includeData: true });

  // Remove comments first
  let cleanedSql = sql
    .split('\n')
    .map((line) => {
      const commentIndex = line.indexOf('--');
      if (commentIndex >= 0) {
        return line.substring(0, commentIndex).trim();
      }
      return line.trim();
    })
    .filter((line) => line.length > 0)
    .join('\n');

  // Split by semicolons, but be smarter about it
  // SQLite can handle multiple statements separated by semicolons
  // We'll split and execute each statement separately to get better error handling
  const statements: string[] = [];
  let currentStatement = '';
  let inString = false;
  let stringChar = '';
  let inParentheses = 0;

  for (let i = 0; i < cleanedSql.length; i++) {
    const char = cleanedSql[i];
    const prevChar = i > 0 ? cleanedSql[i - 1] : '';

    // Handle string literals
    if ((char === "'" || char === '"') && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = '';
      }
      currentStatement += char;
      continue;
    }

    // Track parentheses for nested structures
    if (!inString) {
      if (char === '(') {
        inParentheses++;
      } else if (char === ')') {
        inParentheses--;
      }
    }

    // Handle statement termination (semicolon outside of strings and parentheses)
    if (char === ';' && !inString && inParentheses === 0) {
      const trimmed = currentStatement.trim();
      if (trimmed) {
        statements.push(trimmed);
      }
      currentStatement = '';
      continue;
    }

    currentStatement += char;
  }

  // Add last statement if exists
  const lastTrimmed = currentStatement.trim();
  if (lastTrimmed) {
    statements.push(lastTrimmed);
  }

  // Execute statements in order
  for (const statement of statements) {
    if (statement) {
      try {
        await executeQuery(statement);
      } catch (error: any) {
        // Log error but continue - some statements might fail
        const errorMsg = error?.message || String(error);
        console.warn('Statement execution warning:', statement.substring(0, 50), errorMsg);
        // Re-throw if it's a critical error (like table doesn't exist for indexes)
        if (errorMsg.includes('no such table')) {
          throw new Error(`Failed to create database: ${errorMsg}. Statement: ${statement.substring(0, 100)}`);
        }
      }
    }
  }
}

