import React, { useState } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import { SampleDatabaseButton } from '../components/SampleDatabaseLoader';

// Dynamic imports to avoid SSR issues
const SQLiteViewer = dynamic(() => import('sqlite-visualizer').then(mod => mod.SQLiteViewer), { ssr: false });
const QueryBuilder = dynamic(() => import('sqlite-visualizer').then(mod => mod.QueryBuilder), { ssr: false });
const DataExplorer = dynamic(() => import('sqlite-visualizer').then(mod => mod.DataExplorer), { ssr: false });
const QueryPlan = dynamic(() => import('sqlite-visualizer').then(mod => mod.QueryPlan), { ssr: false });
const DatabaseManager = dynamic(() => import('sqlite-visualizer').then(mod => mod.DatabaseManager), { ssr: false });
const QueryHistory = dynamic(() => import('sqlite-visualizer').then(mod => mod.QueryHistory), { ssr: false });

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
`;

const Main = styled.main`
  flex: 1;
  padding: 2rem;
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
`;

const Tabs = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e0e0e0;
  flex-wrap: wrap;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 1rem 2rem;
  background: ${(props) => (props.active ? '#667eea' : 'transparent')};
  color: ${(props) => (props.active ? 'white' : '#666')};
  border: none;
  border-bottom: 3px solid ${(props) => (props.active ? '#667eea' : 'transparent')};
  cursor: pointer;
  font-size: 1rem;
  font-weight: ${(props) => (props.active ? 600 : 400)};
  transition: all 0.2s ease;
  margin-bottom: -2px;

  &:hover {
    color: ${(props) => (props.active ? 'white' : '#667eea')};
    border-bottom-color: ${(props) => (props.active ? '#667eea' : '#667eea')};
  }
`;

const TabContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-height: 600px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const FullWidth = styled.div`
  width: 100%;
  height: 600px;
`;

export default function Home() {
  const [activeTab, setActiveTab] = useState('manager');

  return (
    <>
      <Head>
        <title>SQLite Visualizer - Demo</title>
        <meta name="description" content="SQLite Visualizer Library Demo" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container>
        <Header>
          <Title>🗄️ SQLite Visualizer</Title>
          <Subtitle>
            Powerful React library for visualizing SQLite databases in the browser
          </Subtitle>
        </Header>

        <Main>
          <Tabs>
            <Tab active={activeTab === 'manager'} onClick={() => setActiveTab('manager')}>
              Database Manager
            </Tab>
            <Tab active={activeTab === 'viewer'} onClick={() => setActiveTab('viewer')}>
              ER Diagram
            </Tab>
            <Tab active={activeTab === 'query'} onClick={() => setActiveTab('query')}>
              Query Builder
            </Tab>
            <Tab active={activeTab === 'explorer'} onClick={() => setActiveTab('explorer')}>
              Data Explorer
            </Tab>
            <Tab active={activeTab === 'plan'} onClick={() => setActiveTab('plan')}>
              Query Plan
            </Tab>
            <Tab active={activeTab === 'history'} onClick={() => setActiveTab('history')}>
              Query History
            </Tab>
          </Tabs>

          <TabContent>
            {activeTab === 'manager' && (
              <div>
                <h2 style={{ marginBottom: '1rem' }}>Database Manager</h2>
                <p style={{ marginBottom: '1rem', color: '#666' }}>
                  Load an existing SQLite database file, create a new one, or load a sample database to get started.
                </p>
                <div style={{ marginBottom: '1rem' }}>
                  <SampleDatabaseButton />
                </div>
                <DatabaseManager />
              </div>
            )}

            {activeTab === 'viewer' && (
              <div>
                <h2 style={{ marginBottom: '1rem' }}>ER Diagram</h2>
                <p style={{ marginBottom: '1rem', color: '#666' }}>
                  Visual representation of your database schema with relationships.
                </p>
                <FullWidth>
                  <SQLiteViewer width={800} height={600} />
                </FullWidth>
              </div>
            )}

            {activeTab === 'query' && (
              <div>
                <h2 style={{ marginBottom: '1rem' }}>Query Builder</h2>
                <p style={{ marginBottom: '1rem', color: '#666' }}>
                  Write and execute SQL queries with autocomplete and syntax highlighting.
                </p>
                <FullWidth>
                  <QueryBuilder />
                </FullWidth>
              </div>
            )}

            {activeTab === 'explorer' && (
              <div>
                <h2 style={{ marginBottom: '1rem' }}>Data Explorer</h2>
                <p style={{ marginBottom: '1rem', color: '#666' }}>
                  Browse table data with filtering, sorting, and pagination.
                </p>
                <FullWidth>
                  <DataExplorer />
                </FullWidth>
              </div>
            )}

            {activeTab === 'plan' && (
              <div>
                <h2 style={{ marginBottom: '1rem' }}>Query Plan Analyzer</h2>
                <p style={{ marginBottom: '1rem', color: '#666' }}>
                  Visualize and analyze query execution plans for optimization.
                </p>
                <FullWidth>
                  <QueryPlan />
                </FullWidth>
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <h2 style={{ marginBottom: '1rem' }}>Query History</h2>
                <p style={{ marginBottom: '1rem', color: '#666' }}>
                  View and manage your query execution history.
                </p>
                <FullWidth>
                  <QueryHistory />
                </FullWidth>
              </div>
            )}
          </TabContent>
        </Main>
      </Container>
    </>
  );
}

