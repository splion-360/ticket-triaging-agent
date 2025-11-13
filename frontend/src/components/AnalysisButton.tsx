import React from 'react';

interface AnalysisButtonProps {
  onAnalyze: () => void;
  loading?: boolean;
  disabled?: boolean;
  ticketCount: number;
}

export const AnalysisButton: React.FC<AnalysisButtonProps> = ({ 
  onAnalyze, 
  loading = false, 
  disabled = false,
  ticketCount 
}) => {
  const isDisabled = disabled || loading || ticketCount === 0;

  return (
    <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
      <button
        onClick={onAnalyze}
        disabled={isDisabled}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1.1rem',
          backgroundColor: isDisabled ? '#6c757d' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s'
        }}
      >
        {loading 
          ? '🤖 Analyzing Tickets...' 
          : `🔍 Analyze ${ticketCount} Ticket${ticketCount !== 1 ? 's' : ''}`
        }
      </button>
      {ticketCount === 0 && (
        <div style={{ marginTop: '0.5rem', color: '#dc3545', fontSize: '0.9rem' }}>
          Create some tickets first to run analysis
        </div>
      )}
    </div>
  );
};