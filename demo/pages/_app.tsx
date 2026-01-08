import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import '../styles/globals.css';

// Client-only wrapper to avoid SSR issues
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  return <>{children}</>;
}

export default function App({ Component, pageProps }: AppProps) {
  const [SQLiteProvider, setSQLiteProvider] = useState<React.ComponentType<{ children: React.ReactNode }> | null>(null);
  
  useEffect(() => {
    import('sqlite-visualizer').then((mod) => {
      setSQLiteProvider(() => mod.SQLiteProvider);
    });
  }, []);
  
  return (
    <ClientOnly>
      {SQLiteProvider ? (
        <SQLiteProvider>
          <Component {...pageProps} />
        </SQLiteProvider>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          Loading...
        </div>
      )}
    </ClientOnly>
  );
}

