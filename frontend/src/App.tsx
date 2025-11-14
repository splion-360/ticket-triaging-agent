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
      padding: '1rem',
      fontFamily: '"IBM Plex Mono", monospace',
      backgroundColor: '#f8f9fa'
    }}>
      <header style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '0.1rem', fontSize: '2rem', marginTop: '0.3rem' }}>
          Support Ticket Analyst
        </h1>
      </header>

      {error && (
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '6px',
          marginBottom: '1rem',
          border: '1px solid #f5c6cb',
          textAlign: 'center',
          fontSize: '0.875rem'
        }}>
          {error}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '50% 50%',
        gridTemplateRows: '50% 50%',
        gap: '1rem',
        height: 'calc(100vh - 120px)',
        maxWidth: '1450px',
        margin: '0 auto'
      }}>
        <div style={{ gridColumn: '1', gridRow: '1' }}>
          <TicketCreationPane
            onSubmit={handleCreateTickets}
            loading={loading.creating}
          />
        </div>

        <div style={{ gridColumn: '2', gridRow: '1' }}>
          <PendingTicketsPane
            tickets={pendingTickets}
            loading={loading.tickets}
            onAnalyze={handleAnalyze}
            analyzing={loading.analyzing}
          />
        </div>

        <div style={{ gridColumn: '1', gridRow: '2' }}>
          <AnalyzedTicketsPane
            tickets={analyzedTickets}
            loading={loading.tickets}
          />
        </div>

        <div style={{ gridColumn: '2', gridRow: '2' }}>
          <LatestAnalysisPane
            analysis={analysis}
            loading={loading.analyzing}
          />
        </div>
      </div>
    </div>
  );
}

export default App;