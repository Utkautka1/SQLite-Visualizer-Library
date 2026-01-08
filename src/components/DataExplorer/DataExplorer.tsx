import React, { useState, useMemo, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { useSQLite } from '../../context/SQLiteContext';
import { theme } from '../../styles/theme';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  overflow: hidden;
  background: ${theme.colors.white};
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border};
  background: ${theme.colors.light};
  flex-wrap: wrap;
`;

const Select = styled.select`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  background: ${theme.colors.white};
  font-size: 14px;
  cursor: pointer;
  min-width: 200px;
`;

const Input = styled.input`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  background: ${theme.colors.white};
  font-size: 14px;
  flex: 1;
  min-width: 200px;
`;

const Button = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.white};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.light};
    border-color: ${theme.colors.primary};
  }
`;

const TableContainer = styled.div`
  flex: 1;
  overflow: auto;
  position: relative;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`;

const TableHeader = styled.thead`
  background: ${theme.colors.light};
  position: sticky;
  top: 0;
  z-index: 10;
`;

const TableHeaderCell = styled.th<{ sortable?: boolean; sorted?: 'asc' | 'desc' }>`
  padding: ${theme.spacing.md};
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid ${theme.colors.border};
  cursor: ${(props) => (props.sortable ? 'pointer' : 'default')};
  user-select: none;
  position: relative;

  &:hover {
    background: ${(props) => (props.sortable ? '#e9ecef' : 'transparent')};
  }

  &::after {
    content: '';
    position: absolute;
    right: ${theme.spacing.sm};
    top: 50%;
    transform: translateY(-50%);
    ${(props) => {
      if (props.sorted === 'asc') {
        return "content: '▲'; font-size: 10px; color: " + theme.colors.primary + ';';
      }
      if (props.sorted === 'desc') {
        return "content: '▼'; font-size: 10px; color: " + theme.colors.primary + ';';
      }
      if (props.sortable) {
        return "content: '⇅'; font-size: 10px; color: " + theme.colors.textLight + '; opacity: 0.5;';
      }
      return '';
    }}
  }
`;

const TableCell = styled.td`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border};
  font-family: ${theme.fonts.mono};
  font-size: 12px;
`;

const TableRow = styled.tr<{ selected?: boolean }>`
  background: ${(props) => (props.selected ? '#e7f3ff' : 'transparent')};
  cursor: pointer;

  &:hover {
    background: ${(props) => (props.selected ? '#d0e7ff' : '#f8f9fa')};
  }
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.border};
  background: ${theme.colors.light};
`;

const PaginationInfo = styled.div`
  font-size: 14px;
  color: ${theme.colors.text};
`;

const PaginationControls = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  align-items: center;
`;

const PageButton = styled.button<{ active?: boolean }>`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${(props) => (props.active ? theme.colors.primary : theme.colors.white)};
  color: ${(props) => (props.active ? theme.colors.white : theme.colors.text)};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  font-size: 12px;
  min-width: 32px;

  &:hover:not(:disabled) {
    background: ${(props) => (props.active ? '#0056b3' : theme.colors.light)};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${theme.colors.textLight};
  padding: ${theme.spacing.xxl};
`;

interface DataExplorerProps {
  tableName?: string;
  onTableChange?: (tableName: string) => void;
}

type SortConfig = {
  column: string;
  direction: 'asc' | 'desc';
} | null;

/**
 * DataExplorer - Table viewer with filtering, sorting, and pagination
 */
export const DataExplorer: React.FC<DataExplorerProps> = ({ tableName, onTableChange }) => {
  const { getSchema, executeQuery, db } = useSQLite();
  const [selectedTable, setSelectedTable] = useState<string>(tableName || '');
  const [data, setData] = useState<any[][]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  const schema = getSchema();
  const tables = schema.tables.map((t) => t.name);

  // Load table data when table changes
  useEffect(() => {
    if (selectedTable && db) {
      loadTableData(selectedTable);
    } else {
      setData([]);
      setColumns([]);
    }
  }, [selectedTable, db]);

  // Update when prop changes
  useEffect(() => {
    if (tableName && tableName !== selectedTable) {
      setSelectedTable(tableName);
    }
  }, [tableName]);

  const loadTableData = useCallback(
    async (table: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await executeQuery(`SELECT * FROM ${table} LIMIT 10000`);
        setColumns(result.columns);
        setData(result.values);
        setCurrentPage(1);
      } catch (err: any) {
        setError(err.message || 'Failed to load table data');
        setData([]);
        setColumns([]);
      } finally {
        setIsLoading(false);
      }
    },
    [executeQuery]
  );

  const handleTableChange = useCallback(
    (newTable: string) => {
      setSelectedTable(newTable);
      setFilter('');
      setSortConfig(null);
      setCurrentPage(1);
      onTableChange?.(newTable);
    },
    [onTableChange]
  );

  // Filter and sort data
  const processedData = useMemo(() => {
    let processed = [...data];

    // Apply filter
    if (filter.trim()) {
      const lowerFilter = filter.toLowerCase();
      processed = processed.filter((row) =>
        row.some((cell) => String(cell || '').toLowerCase().includes(lowerFilter))
      );
    }

    // Apply sorting
    if (sortConfig) {
      const { column, direction } = sortConfig;
      const columnIndex = columns.indexOf(column);

      if (columnIndex !== -1) {
        processed.sort((a, b) => {
          const aVal = a[columnIndex];
          const bVal = b[columnIndex];

          // Handle null values
          if (aVal === null && bVal === null) return 0;
          if (aVal === null) return 1;
          if (bVal === null) return -1;

          // Compare values
          let comparison = 0;
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            comparison = aVal - bVal;
          } else {
            comparison = String(aVal).localeCompare(String(bVal));
          }

          return direction === 'asc' ? comparison : -comparison;
        });
      }
    }

    return processed;
  }, [data, filter, sortConfig, columns]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = processedData.slice(startIndex, endIndex);

  const handleSort = useCallback(
    (column: string) => {
      if (sortConfig?.column === column) {
        // Toggle direction
        setSortConfig(
          sortConfig.direction === 'asc'
            ? { column, direction: 'desc' }
            : null
        );
      } else {
        // New column, default to ascending
        setSortConfig({ column, direction: 'asc' });
      }
      setCurrentPage(1);
    },
    [sortConfig]
  );

  const handleExport = useCallback(() => {
    if (processedData.length === 0) return;

    // Export as CSV
    const csvRows: string[] = [];
    csvRows.push(columns.join(','));
    processedData.forEach((row) => {
      csvRows.push(row.map((cell) => (cell === null ? '' : String(cell))).join(','));
    });

    const csv = csvRows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTable || 'data'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [processedData, columns, selectedTable]);

  if (!db) {
    return (
      <Container>
        <EmptyState>Load or create a database to explore data</EmptyState>
      </Container>
    );
  }

  if (tables.length === 0) {
    return (
      <Container>
        <EmptyState>No tables in database</EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Toolbar>
        <Select value={selectedTable} onChange={(e) => handleTableChange(e.target.value)}>
          <option value="">Select a table...</option>
          {tables.map((table) => (
            <option key={table} value={table}>
              {table}
            </option>
          ))}
        </Select>

        <Input
          type="text"
          placeholder="Filter rows..."
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setCurrentPage(1);
          }}
        />

        <Button onClick={handleExport} disabled={processedData.length === 0}>
          Export CSV
        </Button>

        <div style={{ marginLeft: 'auto', fontSize: '12px', color: theme.colors.textLight }}>
          {processedData.length} row(s)
        </div>
      </Toolbar>

      {error && (
        <div style={{ padding: theme.spacing.md, background: '#fee', color: theme.colors.danger }}>
          Error: {error}
        </div>
      )}

      {isLoading ? (
        <EmptyState>Loading...</EmptyState>
      ) : !selectedTable ? (
        <EmptyState>Select a table to view data</EmptyState>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHeader>
                <tr>
                  {columns.map((column) => (
                    <TableHeaderCell
                      key={column}
                      sortable
                      sorted={sortConfig?.column === column ? sortConfig.direction : undefined}
                      onClick={() => handleSort(column)}
                    >
                      {column}
                    </TableHeaderCell>
                  ))}
                </tr>
              </TableHeader>
              <tbody>
                {paginatedData.map((row, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    selected={selectedRow === startIndex + rowIndex}
                    onClick={() => setSelectedRow(startIndex + rowIndex)}
                  >
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>
                        {cell === null ? (
                          <span
                            style={{ color: theme.colors.textLight, fontStyle: 'italic' }}
                          >
                            NULL
                          </span>
                        ) : (
                          String(cell)
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Pagination>
              <PaginationInfo>
                Showing {startIndex + 1} to {Math.min(endIndex, processedData.length)} of{' '}
                {processedData.length} rows
              </PaginationInfo>
              <PaginationControls>
                <PageButton
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  ««
                </PageButton>
                <PageButton
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  ‹
                </PageButton>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <PageButton
                      key={pageNum}
                      active={currentPage === pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </PageButton>
                  );
                })}
                <PageButton
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  ›
                </PageButton>
                <PageButton
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  »»
                </PageButton>
                <Select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{ width: 'auto', minWidth: '100px' }}
                >
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                  <option value={200}>200 per page</option>
                </Select>
              </PaginationControls>
            </Pagination>
          )}
        </>
      )}
    </Container>
  );
};

