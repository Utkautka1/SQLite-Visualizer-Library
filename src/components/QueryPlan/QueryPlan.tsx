import React, { useState, useCallback, useEffect } from 'react';
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
`;

const TextArea = styled.textarea`
  flex: 1;
  min-height: 100px;
  padding: ${theme.spacing.md};
  border: none;
  border-bottom: 1px solid ${theme.colors.border};
  outline: none;
  font-family: ${theme.fonts.mono};
  font-size: 14px;
  resize: vertical;
  background: ${theme.colors.white};
  color: ${theme.colors.text};
`;

const Button = styled.button<{ variant?: 'primary' }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${(props) =>
    props.variant === 'primary' ? theme.colors.primary : theme.colors.white};
  color: ${(props) => (props.variant === 'primary' ? theme.colors.white : theme.colors.text)};
  border: 1px solid
    ${(props) => (props.variant === 'primary' ? theme.colors.primary : theme.colors.border)};
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${(props) =>
      props.variant === 'primary' ? '#0056b3' : theme.colors.light};
    border-color: ${theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const VisualizationContainer = styled.div`
  flex: 1;
  overflow: auto;
  padding: ${theme.spacing.xl};
  background: linear-gradient(90deg, #f5f5f5 0px, transparent 1px),
    linear-gradient(#f5f5f5 0px, transparent 1px);
  background-size: 20px 20px;
  position: relative;
`;

const PlanTree = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const PlanNode = styled.div<{ level: number }>`
  position: relative;
  background: ${theme.colors.white};
  border: 2px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  min-width: 300px;
  box-shadow: ${theme.shadows.md};
  margin-left: ${(props) => props.level * 50}px;

  &::before {
    content: '';
    position: absolute;
    top: -${theme.spacing.md};
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    height: ${theme.spacing.md};
    background: ${theme.colors.primary};
    ${(props) => (props.level === 0 ? 'display: none;' : '')}
  }
`;

const NodeHeader = styled.div`
  font-weight: bold;
  font-size: 16px;
  color: ${theme.colors.primary};
  margin-bottom: ${theme.spacing.sm};
  border-bottom: 1px solid ${theme.colors.border};
  padding-bottom: ${theme.spacing.xs};
`;

const NodeDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  font-size: 12px;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${theme.spacing.md};
`;

const DetailLabel = styled.span`
  font-weight: 600;
  color: ${theme.colors.textLight};
`;

const DetailValue = styled.span`
  color: ${theme.colors.text};
  font-family: ${theme.fonts.mono};
`;

const TableView = styled.div`
  flex: 1;
  overflow: auto;
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

const TableHeaderCell = styled.th`
  padding: ${theme.spacing.md};
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid ${theme.colors.border};
`;

const TableCell = styled.td`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border};
  font-family: ${theme.fonts.mono};
  font-size: 12px;
`;

const ErrorMessage = styled.div`
  padding: ${theme.spacing.md};
  background: #fee;
  color: ${theme.colors.danger};
  margin: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.sm};
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

interface QueryPlanNode {
  id: number;
  parent: number;
  detail: string;
  [key: string]: any;
}

interface QueryPlanProps {
  initialQuery?: string;
  viewMode?: 'tree' | 'table';
}

/**
 * QueryPlan - Visualizes EXPLAIN QUERY PLAN results
 */
export const QueryPlan: React.FC<QueryPlanProps> = ({
  initialQuery = '',
  viewMode: initialViewMode = 'tree',
}) => {
  const { executeQuery, db } = useSQLite();
  const [query, setQuery] = useState(initialQuery);
  const [planData, setPlanData] = useState<any[][]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'table'>(initialViewMode);

  const executePlan = useCallback(async () => {
    if (!query.trim() || !db) return;

    setIsLoading(true);
    setError(null);

    try {
      // Ensure query starts with EXPLAIN QUERY PLAN
      const planQuery = query.trim().toUpperCase().startsWith('EXPLAIN')
        ? query.trim()
        : `EXPLAIN QUERY PLAN ${query.trim()}`;

      const result = await executeQuery(planQuery);
      setColumns(result.columns);
      setPlanData(result.values);
    } catch (err: any) {
      setError(err.message || 'Failed to execute query plan');
      setPlanData([]);
      setColumns([]);
    } finally {
      setIsLoading(false);
    }
  }, [query, executeQuery, db]);

  // Auto-execute if initial query provided
  useEffect(() => {
    if (initialQuery && db) {
      setQuery(initialQuery);
      executePlan();
    }
  }, [db]);

  // Parse plan data into tree structure
  const planTree = React.useMemo(() => {
    if (planData.length === 0 || columns.length === 0) {
      return [];
    }

    // SQLite EXPLAIN QUERY PLAN typically has: selectid, order, from, detail
    // We'll build a tree structure based on the order and parent relationships
    const nodes: QueryPlanNode[] = planData.map((row, index) => {
      const node: QueryPlanNode = {
        id: index,
        parent: -1,
        detail: '',
      };

      columns.forEach((col, colIndex) => {
        node[col] = row[colIndex];
        if (col.toLowerCase() === 'detail') {
          node.detail = String(row[colIndex] || '');
        }
      });

      return node;
    });

    // Build parent relationships (simplified - SQLite doesn't always provide explicit parent)
    // We'll use order/selectid to infer hierarchy
    nodes.forEach((node, index) => {
      if (index > 0) {
        // Simple heuristic: previous node is parent if order is less
        const order = (node as any).order;
        const prevOrder = (nodes[index - 1] as any).order;
        if (typeof order === 'number' && typeof prevOrder === 'number' && order > prevOrder) {
          node.parent = index - 1;
        } else {
          node.parent = 0; // Default to root
        }
      }
    });

    return nodes;
  }, [planData, columns]);

  const renderTreeView = () => {
    if (planTree.length === 0) {
      return <EmptyState>No query plan data available</EmptyState>;
    }

    return (
      <PlanTree>
        {planTree.map((node, index) => {
          const level = node.parent === -1 ? 0 : 1; // Simplified level calculation

          return (
            <PlanNode key={index} level={level}>
              <NodeHeader>
                Step {index + 1}
                {node.detail ? `: ${node.detail.split(' ')[0]}` : ''}
              </NodeHeader>
              <NodeDetails>
                {columns.map((col) => {
                  const value = (node as any)[col];
                  if (value === null || value === undefined || col === 'detail') return null;

                  return (
                    <DetailRow key={col}>
                      <DetailLabel>{col}:</DetailLabel>
                      <DetailValue>{String(value)}</DetailValue>
                    </DetailRow>
                  );
                })}
                {node.detail && (
                  <DetailRow>
                    <DetailLabel>Detail:</DetailLabel>
                    <DetailValue style={{ fontStyle: 'italic' }}>{node.detail}</DetailValue>
                  </DetailRow>
                )}
              </NodeDetails>
            </PlanNode>
          );
        })}
      </PlanTree>
    );
  };

  const renderTableView = () => {
    if (planData.length === 0) {
      return <EmptyState>No query plan data available</EmptyState>;
    }

    return (
      <TableView>
        <Table>
          <TableHeader>
            <tr>
              {columns.map((col) => (
                <TableHeaderCell key={col}>{col}</TableHeaderCell>
              ))}
            </tr>
          </TableHeader>
          <tbody>
            {planData.map((row, rowIndex) => (
              <tr key={rowIndex}>
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
              </tr>
            ))}
          </tbody>
        </Table>
      </TableView>
    );
  };

  return (
    <Container>
      <Toolbar>
        <Button variant="primary" onClick={executePlan} disabled={isLoading || !db}>
          {isLoading ? 'Analyzing...' : 'Analyze Query Plan'}
        </Button>
        <Button
          onClick={() => setViewMode(viewMode === 'tree' ? 'table' : 'tree')}
          disabled={planData.length === 0}
        >
          {viewMode === 'tree' ? 'Table View' : 'Tree View'}
        </Button>
        <div style={{ marginLeft: 'auto', fontSize: '12px', color: theme.colors.textLight }}>
          {planData.length} step(s)
        </div>
      </Toolbar>

      <TextArea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter SQL query to analyze...&#10;Example: SELECT * FROM users WHERE id = 1;"
        spellCheck={false}
      />

      {error && <ErrorMessage>Error: {error}</ErrorMessage>}

      <VisualizationContainer>
        {viewMode === 'tree' ? renderTreeView() : renderTableView()}
      </VisualizationContainer>
    </Container>
  );
};

