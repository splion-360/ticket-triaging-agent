import React, { useState, useEffect } from 'react';
import { TicketCreationPane } from './components/TicketCreationPane';
import { PendingTicketsPane } from './components/PendingTicketsPane';
import { AnalyzedTicketsPane } from './components/AnalyzedTicketsPane';
import { LatestAnalysisPane } from './components/LatestAnalysisPane';
import { ticketApi, analysisApi } from './services/api';
import { Ticket, TicketCreate, AnalysisRun } from './types';

function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisRun | null>(null);
  const [loading, setLoading] = useState({
    tickets: false,
    creating: false,
    analyzing: false
  });
  const [error, setError] = useState<string | null>(null);

  const loadTickets = async () => {
    try {
      setLoading(prev => ({ ...prev, tickets: true }));
      const fetchedTickets = await ticketApi.getTickets();
      setTickets(fetchedTickets);
    } catch (err) {
      setError('Failed to load tickets');
    } finally {
      setLoading(prev => ({ ...prev, tickets: false }));
    }
  };

  const loadLatestAnalysis = async () => {
    try {
      const latestAnalysis = await analysisApi.getLatestAnalysis();
      setAnalysis(latestAnalysis);
    } catch (err) {
      console.log('No previous analysis found');
    }
  };

  const handleCreateTickets = async (newTickets: TicketCreate[]) => {
    try {
      setLoading(prev => ({ ...prev, creating: true }));
      setError(null);
      const createdTickets = await ticketApi.createTickets(newTickets);
      setTickets(prev => [...prev, ...createdTickets]);
    } catch (err) {
      setError('Failed to create tickets');
    } finally {
      setLoading(prev => ({ ...prev, creating: false }));
    }
  };

  const handleAnalyze = async () => {
    try {
      setLoading(prev => ({ ...prev, analyzing: true }));
      setError(null);
      const result = await analysisApi.runAnalysis({});
      setAnalysis(result);
      await loadTickets();
    } catch (err) {
      setError('Failed to run analysis');
    } finally {
      setLoading(prev => ({ ...prev, analyzing: false }));
    }
  };

  useEffect(() => {
    loadTickets();
    loadLatestAnalysis();
  }, []);

  const pendingTickets = tickets.filter(t => t.status === 'incomplete');
  const analyzedTickets = tickets.filter(t => t.status === 'complete');

  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem',
      fontFamily: '"IBM Plex Mono", monospace',
      backgroundColor: '#f8f9fa'
    }}>
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '0.5rem', fontSize: '2rem' }}>
          Ticket Triaging Agent
        </h1>
        <p style={{ color: '#7f8c8d', fontSize: '1rem' }}>
          An agent capable of categorizing & analyzing incoming support tickets
        </p>
      </header>

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '8px',
          marginBottom: '1rem',
          border: '1px solid #f5c6cb',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: '1.5rem',
        height: 'calc(100vh - 200px)',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <TicketCreationPane
          onSubmit={handleCreateTickets}
          loading={loading.creating}
        />

        <PendingTicketsPane
          tickets={pendingTickets}
          loading={loading.tickets}
          onAnalyze={handleAnalyze}
          analyzing={loading.analyzing}
        />

        <AnalyzedTicketsPane
          tickets={analyzedTickets}
          loading={loading.tickets}
        />

        <LatestAnalysisPane
          analysis={analysis}
          loading={loading.analyzing}
        />
      </div>
    </div>
  );
}

export default App;