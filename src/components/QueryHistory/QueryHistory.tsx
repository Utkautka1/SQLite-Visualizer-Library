import React, { useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useSQLite } from '../../context/SQLiteContext';
import { QueryHistoryItem } from '../../types';
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

const Button = styled.button<{ variant?: 'danger' }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${(props) => (props.variant === 'danger' ? theme.colors.danger : theme.colors.white)};
  color: ${(props) => (props.variant === 'danger' ? theme.colors.white : theme.colors.text)};
  border: 1px solid
    ${(props) => (props.variant === 'danger' ? theme.colors.danger : theme.colors.border)};
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Input = styled.input`
  flex: 1;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  background: ${theme.colors.white};
  font-size: 14px;
`;

const HistoryList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${theme.spacing.md};
`;

const HistoryItem = styled.div<{ selected: boolean; hasError: boolean }>`
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  background: ${(props) =>
    props.hasError
      ? '#fee'
      : props.selected
      ? '#e7f3ff'
      : theme.colors.white};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${theme.colors.primary};
    box-shadow: ${theme.shadows.sm};
  }
`;

const QueryText = styled.div`
  font-family: ${theme.fonts.mono};
  font-size: 12px;
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.xs};
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 100px;
  overflow-y: auto;
`;

const MetaInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: ${theme.colors.textLight};
  margin-top: ${theme.spacing.xs};
`;

const ErrorText = styled.div`
  color: ${theme.colors.danger};
  font-size: 12px;
  margin-top: ${theme.spacing.xs};
  font-style: italic;
`;

const ResultInfo = styled.div`
  color: ${theme.colors.success};
  font-size: 12px;
  margin-top: ${theme.spacing.xs};
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

interface QueryHistoryProps {
  onQuerySelect?: (query: string) => void;
  maxHeight?: number;
}

/**
 * QueryHistory - Component for viewing and managing query history
 */
export const QueryHistory: React.FC<QueryHistoryProps> = ({
  onQuerySelect,
  maxHeight,
}) => {
  const { queryHistory, clearHistory } = useSQLite();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) {
      return queryHistory;
    }

    const lowerQuery = searchQuery.toLowerCase();
    return queryHistory.filter((item) => item.query.toLowerCase().includes(lowerQuery));
  }, [queryHistory, searchQuery]);

  const handleItemClick = useCallback(
    (item: QueryHistoryItem) => {
      setSelectedItem(item.id === selectedItem ? null : item.id);
      onQuerySelect?.(item.query);
    },
    [selectedItem, onQuerySelect]
  );

  const handleClear = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all query history?')) {
      clearHistory();
      setSelectedItem(null);
    }
  }, [clearHistory]);

  const formatTime = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }, []);

  const formatExecutionTime = useCallback((time: number) => {
    if (time < 1) {
      return `${(time * 1000).toFixed(2)} ms`;
    }
    return `${time.toFixed(2)} s`;
  }, []);

  return (
    <Container style={{ maxHeight }}>
      <Toolbar>
        <Input
          type="text"
          placeholder="Search history..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button variant="danger" onClick={handleClear} disabled={queryHistory.length === 0}>
          Clear All
        </Button>
      </Toolbar>

      <HistoryList>
        {filteredHistory.length === 0 ? (
          <EmptyState>
            {searchQuery ? 'No queries found' : 'No query history yet'}
          </EmptyState>
        ) : (
          filteredHistory.map((item) => (
            <HistoryItem
              key={item.id}
              selected={selectedItem === item.id}
              hasError={!!item.error}
              onClick={() => handleItemClick(item)}
            >
              <QueryText>{item.query}</QueryText>
              {item.error ? (
                <ErrorText>Error: {item.error}</ErrorText>
              ) : item.result ? (
                <ResultInfo>
                  {item.result.rowsAffected !== undefined
                    ? `${item.result.rowsAffected} row(s) affected`
                    : `${item.result.values.length} row(s) returned`}
                </ResultInfo>
              ) : null}
              <MetaInfo>
                <span>{formatTime(item.timestamp)}</span>
                <span>Execution time: {formatExecutionTime(item.executionTime)}</span>
              </MetaInfo>
            </HistoryItem>
          ))
        )}
      </HistoryList>
    </Container>
  );
};

