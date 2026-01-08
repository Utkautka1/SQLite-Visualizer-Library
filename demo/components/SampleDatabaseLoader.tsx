import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { createSampleDatabase } from '../utils/createSampleDatabase';

/**
 * Internal component that uses useSQLite hook directly
 * Must be rendered inside SQLiteProvider
 * Module is loaded dynamically to avoid SSR issues
 */
const createSampleDatabaseButton = (useSQLite: any) => {
  const SampleDatabaseButtonInternal: React.FC = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    
    // Use the hook directly on top level - must be inside SQLiteProvider
    const sqlite = useSQLite();

    const handleCreateSample = async () => {
      setIsCreating(true);
      setMessage(null);
      
      try {
        await createSampleDatabase(sqlite.executeQuery, sqlite.createDatabase);
        setMessage({ type: 'success', text: 'Sample database created successfully!' });
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } catch (error: any) {
        setMessage({ type: 'error', text: `Failed to create sample database: ${error.message}` });
        
        // Clear error message after 5 seconds
        setTimeout(() => setMessage(null), 5000);
      } finally {
        setIsCreating(false);
      }
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button
          onClick={handleCreateSample}
          disabled={isCreating || !!sqlite.db}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isCreating || sqlite.db ? 'not-allowed' : 'pointer',
            opacity: isCreating || sqlite.db ? 0.5 : 1,
            fontSize: '14px',
            fontWeight: 500,
            transition: 'opacity 0.2s ease',
          }}
        >
          {isCreating ? 'Creating...' : sqlite.db ? 'Database Already Loaded' : 'Create Sample Database'}
        </button>
        {message && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
              color: message.type === 'success' ? '#155724' : '#721c24',
              border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
              animation: 'fadeIn 0.3s ease',
            }}
          >
            {message.text}
          </div>
        )}
      </div>
    );
  };

  return SampleDatabaseButtonInternal;
};

/**
 * Client-side wrapper component with dynamic import
 */
export const SampleDatabaseButton = dynamic(
  () =>
    import('sqlite-visualizer').then((mod) => {
      const ButtonComponent = createSampleDatabaseButton(mod.useSQLite);
      return { default: ButtonComponent };
    }),
  {
    ssr: false,
    loading: () => (
      <button
        disabled
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'not-allowed',
          opacity: 0.5,
        }}
      >
        Loading...
      </button>
    ),
  }
);

