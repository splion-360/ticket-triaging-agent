import React, { useState, useEffect } from 'react';
import { TicketForm } from './components/TicketForm';
import { TicketList } from './components/TicketList';
import { AnalysisButton } from './components/AnalysisButton';
import { AnalysisResults } from './components/AnalysisResults';
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

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '2rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>
          🎫 Support Ticket Analyst
        </h1>
        <p style={{ color: '#7f8c8d', fontSize: '1.1rem' }}>
          AI-powered ticket categorization and priority analysis
        </p>
      </header>

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px',
          marginBottom: '1rem',
          border: '1px solid #f5c6cb'
        }}>
          ⚠️ {error}
        </div>
      )}

      <TicketForm 
        onSubmit={handleCreateTickets} 
        loading={loading.creating}
      />

      <TicketList 
        tickets={tickets} 
        loading={loading.tickets}
      />

      <AnalysisButton
        onAnalyze={handleAnalyze}
        loading={loading.analyzing}
        ticketCount={tickets.length}
      />

      <AnalysisResults
        analysis={analysis}
        loading={loading.analyzing}
      />
    </div>
  );
}

export default App;