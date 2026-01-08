import React, { useCallback, useRef } from 'react';
import styled from 'styled-components';
import { useSQLite } from '../../context/SQLiteContext';
import { theme } from '../../styles/theme';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.white};
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.text};
`;

const Button = styled.button<{ variant?: 'primary' | 'danger' }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${(props) => {
    if (props.variant === 'primary') return theme.colors.primary;
    if (props.variant === 'danger') return theme.colors.danger;
    return theme.colors.white;
  }};
  color: ${(props) => {
    if (props.variant === 'primary' || props.variant === 'danger') return theme.colors.white;
    return theme.colors.text;
  }};
  border: 1px solid
    ${(props) => {
      if (props.variant === 'primary') return theme.colors.primary;
      if (props.variant === 'danger') return theme.colors.danger;
      return theme.colors.border;
    }};
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.md};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
`;

const Select = styled.select`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  background: ${theme.colors.white};
  font-size: 14px;
  cursor: pointer;
`;

const StatusMessage = styled.div<{ type?: 'success' | 'error' }>`
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  font-size: 14px;
  background: ${(props) =>
    props.type === 'error' ? '#fee' : props.type === 'success' ? '#efe' : theme.colors.light};
  color: ${(props) =>
    props.type === 'error'
      ? theme.colors.danger
      : props.type === 'success'
      ? theme.colors.success
      : theme.colors.text};
`;

interface DatabaseManagerProps {
  onDatabaseLoaded?: () => void;
  onDatabaseCreated?: () => void;
}

/**
 * DatabaseManager - Component for loading, creating, and exporting databases
 */
export const DatabaseManager: React.FC<DatabaseManagerProps> = ({
  onDatabaseLoaded,
  onDatabaseCreated,
}) => {
  const {
    loadDatabase,
    createDatabase,
    exportDatabase,
    saveDatabase,
    db,
    isLoading,
    error,
  } = useSQLite();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exportFormat, setExportFormat] = React.useState<'sql' | 'json' | 'csv'>('sql');
  const [statusMessage, setStatusMessage] = React.useState<{
    text: string;
    type?: 'success' | 'error';
  } | null>(null);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const arrayBuffer = await file.arrayBuffer();
        await loadDatabase(arrayBuffer);
        setStatusMessage({ text: `Database loaded: ${file.name}`, type: 'success' });
        onDatabaseLoaded?.();
      } catch (err: any) {
        setStatusMessage({ text: `Failed to load database: ${err.message}`, type: 'error' });
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [loadDatabase, onDatabaseLoaded]
  );

  const handleLoadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleCreate = useCallback(() => {
    try {
      createDatabase();
      setStatusMessage({ text: 'New database created successfully', type: 'success' });
      onDatabaseCreated?.();
    } catch (err: any) {
      setStatusMessage({ text: `Failed to create database: ${err.message}`, type: 'error' });
    }
  }, [createDatabase, onDatabaseCreated]);

  const handleExport = useCallback(() => {
    if (!db) {
      setStatusMessage({ text: 'No database loaded', type: 'error' });
      return;
    }

    try {
      const exported = exportDatabase({ format: exportFormat, schema: true, data: true });
      const blob = new Blob([exported], {
        type: exportFormat === 'json' ? 'application/json' : 'text/plain',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `database_export.${exportFormat === 'json' ? 'json' : exportFormat === 'csv' ? 'csv' : 'sql'}`;
      a.click();
      URL.revokeObjectURL(url);
      setStatusMessage({ text: 'Database exported successfully', type: 'success' });
    } catch (err: any) {
      setStatusMessage({ text: `Failed to export database: ${err.message}`, type: 'error' });
    }
  }, [db, exportDatabase, exportFormat]);

  const handleSave = useCallback(() => {
    if (!db) {
      setStatusMessage({ text: 'No database loaded', type: 'error' });
      return;
    }

    try {
      const data = saveDatabase();
      const blob = new Blob([data as BlobPart], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'database.db';
      a.click();
      URL.revokeObjectURL(url);
      setStatusMessage({ text: 'Database saved successfully', type: 'success' });
    } catch (err: any) {
      setStatusMessage({ text: `Failed to save database: ${err.message}`, type: 'error' });
    }
  }, [db, saveDatabase]);

  // Clear status message after 5 seconds
  React.useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  return (
    <Container>
      <Section>
        <SectionTitle>Database Operations</SectionTitle>
        <ButtonGroup>
          <Button variant="primary" onClick={handleLoadClick} disabled={isLoading}>
            Load Database (.db file)
          </Button>
          <FileInput
            ref={fileInputRef}
            type="file"
            accept=".db,.sqlite,.sqlite3"
            onChange={handleFileSelect}
          />
          <Button variant="primary" onClick={handleCreate} disabled={isLoading}>
            Create New Database
          </Button>
        </ButtonGroup>
      </Section>

      {db && (
        <>
          <Section>
            <SectionTitle>Export Database</SectionTitle>
            <ButtonGroup>
              <Select value={exportFormat} onChange={(e) => setExportFormat(e.target.value as any)}>
                <option value="sql">SQL</option>
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </Select>
              <Button onClick={handleExport}>Export</Button>
            </ButtonGroup>
          </Section>

          <Section>
            <SectionTitle>Save Database</SectionTitle>
            <ButtonGroup>
              <Button onClick={handleSave}>Save as .db file</Button>
            </ButtonGroup>
          </Section>
        </>
      )}

      {error && <StatusMessage type="error">Error: {error}</StatusMessage>}
      {statusMessage && (
        <StatusMessage type={statusMessage.type}>{statusMessage.text}</StatusMessage>
      )}

      {db && (
        <StatusMessage>
          Database loaded successfully
        </StatusMessage>
      )}
    </Container>
  );
};

