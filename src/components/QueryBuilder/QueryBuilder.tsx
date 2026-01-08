import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useSQLite } from '../../context/SQLiteContext';
import { SQLAutocomplete } from '../../core/sqlAutocomplete';
import { HotkeyManager } from '../../core/hotkeys';
import { QueryShareManager } from '../../core/share';
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
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border};
  background: ${theme.colors.light};
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
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
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};

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

const EditorContainer = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
`;

const TextArea = styled.textarea`
  flex: 1;
  width: 100%;
  padding: ${theme.spacing.md};
  border: none;
  outline: none;
  font-family: ${theme.fonts.mono};
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  background: ${theme.colors.white};
  color: ${theme.colors.text};

  &::placeholder {
    color: ${theme.colors.textLight};
  }
`;

const AutocompleteDropdown = styled.div<{ visible: boolean }>`
  position: absolute;
  top: ${(props) => (props.visible ? '100%' : '-1000px')};
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  background: ${theme.colors.white};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  box-shadow: ${theme.shadows.lg};
  z-index: 1000;
  margin-top: 2px;
`;

const AutocompleteItem = styled.div<{ selected: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  cursor: pointer;
  background: ${(props) => (props.selected ? theme.colors.light : 'transparent')};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  &:hover {
    background: ${theme.colors.light};
  }
`;

const ItemLabel = styled.span`
  font-weight: 500;
`;

const ItemType = styled.span`
  font-size: 12px;
  color: ${theme.colors.textLight};
  margin-left: auto;
`;

const ResultsContainer = styled.div`
  border-top: 1px solid ${theme.colors.border};
  max-height: 300px;
  overflow: auto;
`;

const ResultsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
`;

const TableHeader = styled.thead`
  background: ${theme.colors.light};
  position: sticky;
  top: 0;
  z-index: 10;
`;

const TableHeaderCell = styled.th`
  padding: ${theme.spacing.sm};
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid ${theme.colors.border};
`;

const TableCell = styled.td`
  padding: ${theme.spacing.sm};
  border-bottom: 1px solid ${theme.colors.border};
  font-family: ${theme.fonts.mono};
  font-size: 11px;
`;

const ErrorMessage = styled.div`
  padding: ${theme.spacing.md};
  background: #fee;
  color: ${theme.colors.danger};
  border-top: 1px solid ${theme.colors.danger};
  font-size: 14px;
`;

const InfoMessage = styled.div`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.light};
  color: ${theme.colors.text};
  font-size: 12px;
  border-top: 1px solid ${theme.colors.border};
`;

interface QueryBuilderProps {
  initialQuery?: string;
  onQueryChange?: (query: string) => void;
  onExecute?: (query: string, result: any) => void;
}

/**
 * QueryBuilder - Visual query builder with SQL editor, autocomplete, and execution
 */
export const QueryBuilder: React.FC<QueryBuilderProps> = ({
  initialQuery = '',
  onQueryChange,
  onExecute,
}) => {
  const { executeQuery, getSchema, db } = useSQLite();
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [autocompleteVisible, setAutocompleteVisible] = useState(false);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<
    Array<{ label: string; type: string }>
  >([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autocompleteRef = useRef<SQLAutocomplete>(new SQLAutocomplete());
  const hotkeyManagerRef = useRef<HotkeyManager>(new HotkeyManager());
  const shareManagerRef = useRef<QueryShareManager>(new QueryShareManager());

  // Update autocomplete schema when database changes
  useEffect(() => {
    const schema = getSchema();
    autocompleteRef.current.updateSchema(schema);
  }, [getSchema, db]);

  // Setup hotkeys
  useEffect(() => {
    const hotkeys = hotkeyManagerRef.current;

    hotkeys.register('ctrl+enter', () => {
      handleExecute();
    });

    hotkeys.register('ctrl+space', () => {
      showAutocomplete();
    });

    hotkeys.register('ctrl+shift+f', () => {
      formatQuery();
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      hotkeys.handleKeyDown(e);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Load query from URL if present
  useEffect(() => {
    const sharedQuery = shareManagerRef.current.decodeFromUrl();
    if (sharedQuery) {
      setQuery(sharedQuery);
    }
  }, []);

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      setError(null);
      onQueryChange?.(value);

      // Update cursor position for autocomplete
      if (textareaRef.current) {
        setCursorPosition(textareaRef.current.selectionStart);
      }
    },
    [onQueryChange]
  );

  const showAutocomplete = useCallback(() => {
    if (!textareaRef.current) return;

    const pos = textareaRef.current.selectionStart;
    const suggestions = autocompleteRef.current.getSuggestions(query, pos);
    setAutocompleteSuggestions(suggestions);
    setAutocompleteVisible(suggestions.length > 0);
    setSelectedSuggestion(0);
  }, [query]);

  const handleExecute = useCallback(async () => {
    if (!query.trim() || isExecuting) return;

    setIsExecuting(true);
    setError(null);
    setResult(null);

    try {
      const queryResult = await executeQuery(query);
      setResult(queryResult);
      onExecute?.(query, queryResult);
    } catch (err: any) {
      setError(err.message || 'Query execution failed');
    } finally {
      setIsExecuting(false);
    }
  }, [query, executeQuery, isExecuting, onExecute]);

  const formatQuery = useCallback(() => {
    // Simple SQL formatter
    let formatted = query
      .replace(/\s+/g, ' ')
      .replace(/\s*,\s*/g, ', ')
      .replace(/\s*\(\s*/g, ' (')
      .replace(/\s*\)\s*/g, ') ')
      .trim();

    // Basic keyword capitalization
    const keywords = [
      'SELECT',
      'FROM',
      'WHERE',
      'JOIN',
      'INNER',
      'LEFT',
      'RIGHT',
      'ON',
      'AND',
      'OR',
      'ORDER',
      'BY',
      'GROUP',
      'HAVING',
      'LIMIT',
      'INSERT',
      'INTO',
      'VALUES',
      'UPDATE',
      'SET',
      'DELETE',
    ];

    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      formatted = formatted.replace(regex, keyword);
    });

    setQuery(formatted);
  }, [query]);

  const handleShare = useCallback(async () => {
    const success = await shareManagerRef.current.copyToClipboard(query);
    if (success) {
      alert('Shareable link copied to clipboard!');
    }
  }, [query]);

  const handleSuggestionSelect = useCallback(
    (suggestion: { label: string; type: string }) => {
      if (!textareaRef.current) return;

      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = query.substring(0, start);
      const after = query.substring(end);

      // Find the word to replace
      const wordMatch = before.match(/(\w+)$/);
      const wordStart = wordMatch ? start - wordMatch[1].length : start;

      const newQuery = query.substring(0, wordStart) + suggestion.label + ' ' + after;
      setQuery(newQuery);
      setAutocompleteVisible(false);

      // Set cursor after inserted text
      setTimeout(() => {
        if (textareaRef.current) {
          const newPos = wordStart + suggestion.label.length + 1;
          textareaRef.current.setSelectionRange(newPos, newPos);
          textareaRef.current.focus();
        }
      }, 0);
    },
    [query]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (autocompleteVisible && autocompleteSuggestions.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedSuggestion((prev) =>
            prev < autocompleteSuggestions.length - 1 ? prev + 1 : prev
          );
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedSuggestion((prev) => (prev > 0 ? prev - 1 : 0));
          return;
        }
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSuggestionSelect(autocompleteSuggestions[selectedSuggestion]);
          return;
        }
        if (e.key === 'Escape') {
          setAutocompleteVisible(false);
          return;
        }
      }

      // Update cursor position
      setCursorPosition(e.currentTarget.selectionStart);
    },
    [autocompleteVisible, autocompleteSuggestions, selectedSuggestion, handleSuggestionSelect]
  );

  return (
    <Container>
      <Toolbar>
        <Button variant="primary" onClick={handleExecute} disabled={isExecuting || !db}>
          {isExecuting ? 'Executing...' : 'Execute (Ctrl+Enter)'}
        </Button>
        <Button onClick={formatQuery}>Format (Ctrl+Shift+F)</Button>
        <Button onClick={showAutocomplete}>Autocomplete (Ctrl+Space)</Button>
        <Button onClick={handleShare}>Share Query</Button>
        <div style={{ marginLeft: 'auto', fontSize: '12px', color: theme.colors.textLight }}>
          {query.length} characters
        </div>
      </Toolbar>

      <EditorContainer>
        <TextArea
          ref={textareaRef}
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your SQL query here...&#10;Example: SELECT * FROM users WHERE id = 1;"
          spellCheck={false}
        />

        <AutocompleteDropdown visible={autocompleteVisible}>
          {autocompleteSuggestions.map((suggestion, index) => (
            <AutocompleteItem
              key={index}
              selected={index === selectedSuggestion}
              onClick={() => handleSuggestionSelect(suggestion)}
            >
              <ItemLabel>{suggestion.label}</ItemLabel>
              <ItemType>{suggestion.type}</ItemType>
            </AutocompleteItem>
          ))}
        </AutocompleteDropdown>
      </EditorContainer>

      {error && <ErrorMessage>Error: {error}</ErrorMessage>}

      {result && (
        <ResultsContainer>
          {result.rowsAffected !== undefined ? (
            <InfoMessage>
              Query executed successfully. Rows affected: {result.rowsAffected}
            </InfoMessage>
          ) : (
            <>
              <InfoMessage>
                Query executed successfully. {result.values.length} row(s) returned.
              </InfoMessage>
              {result.values.length > 0 && (
                <ResultsTable>
                  <TableHeader>
                    <tr>
                      {result.columns.map((col: string) => (
                        <TableHeaderCell key={col}>{col}</TableHeaderCell>
                      ))}
                    </tr>
                  </TableHeader>
                  <tbody>
                    {result.values.slice(0, 1000).map((row: any[], rowIndex: number) => (
                      <tr key={rowIndex}>
                        {row.map((cell: any, cellIndex: number) => (
                          <TableCell key={cellIndex}>
                            {cell === null ? (
                              <span style={{ color: theme.colors.textLight, fontStyle: 'italic' }}>
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
                </ResultsTable>
              )}
              {result.values.length > 1000 && (
                <InfoMessage>
                  Showing first 1000 rows of {result.values.length} total rows.
                </InfoMessage>
              )}
            </>
          )}
        </ResultsContainer>
      )}
    </Container>
  );
};

