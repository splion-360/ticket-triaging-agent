import { useState, useEffect } from 'react';
import { TicketCreationPane } from './components/TicketCreationPane';
import { PendingTicketsPane } from './components/PendingTicketsPane';
import { AnalyzedTicketsPane } from './components/AnalyzedTicketsPane';
import { LatestAnalysisPane } from './components/LatestAnalysisPane';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { ticketApi, analysisApi } from './services/api';
import { Ticket, TicketCreate, AnalysisRun } from './types';

const AppContent = () => {
  const { addToast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisRun | null>(null);
  const [loading, setLoading] = useState({
    tickets: false,
    creating: false,
    analyzing: false
  });

  const loadTickets = async () => {
    try {
      setLoading(prev => ({ ...prev, tickets: true }));
      const fetchedTickets = await ticketApi.getTickets();
      setTickets(fetchedTickets);
    } catch (err) {
      addToast('Failed to load tickets', 'error');
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
      const createdTickets = await ticketApi.createTickets(newTickets);
      setTickets(prev => [...prev, ...createdTickets]);
      addToast(`Successfully created ${createdTickets.length} ticket${createdTickets.length > 1 ? 's' : ''}`, 'success');
    } catch (err) {
      addToast('Failed to create tickets', 'error');
    } finally {
      setLoading(prev => ({ ...prev, creating: false }));
    }
  };

  const handleAnalyze = async () => {
    try {
      setLoading(prev => ({ ...prev, analyzing: true }));
      const result = await analysisApi.runAnalysis({});
      console.log(result)
      setAnalysis(result);
      await loadTickets();
      addToast(`Analysis complete! Processed ${result.ticket_analyses.length} tickets`, 'success');
    } catch (err) {
      addToast('Failed to run analysis', 'error');
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
  console.log(pendingTickets)
  console.log(analyzedTickets)

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
            loading={loading.analyzing && !analysis}
            onRefresh={loadLatestAnalysis}
          />
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;