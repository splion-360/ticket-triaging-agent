import React from 'react';
import { AnalysisRun } from '../types';

interface AnalysisResultsProps {
  analysis: AnalysisRun | null;
  loading?: boolean;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysis, loading = false }) => {
  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>🤖 AI Agent is analyzing tickets...</div>
        <div style={{ color: '#6c757d' }}>This may take a few seconds</div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#6c757d' }}>
        No analysis results yet. Run an analysis to see insights.
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'billing': '#007bff',
      'bug': '#dc3545',
      'feature_request': '#28a745',
      'authentication': '#fd7e14',
      'other': '#6c757d'
    };
    return colors[category] || '#6c757d';
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>📊 Analysis Results</h2>

      <div style={{
        padding: '1rem',
        backgroundColor: '#e7f3ff',
        borderLeft: '4px solid #007bff',
        marginBottom: '2rem',
        borderRadius: '4px'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#0056b3' }}>Summary</h3>
        <p style={{ margin: 0, lineHeight: '1.5' }}>{analysis.summary}</p>
        <div style={{ marginTop: '0.5rem', fontSize: '0.875em', color: '#6c757d' }}>
          Analysis completed: {new Date(analysis.created_at).toLocaleString()}
        </div>
      </div>

      <h3>Individual Ticket Analysis</h3>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {analysis.ticket_analyses.map((ta) => (
          <div
            key={ta.id}
            style={{
              padding: '1rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: '#ffffff'
            }}
          >
            <div style={{ marginBottom: '0.75rem' }}>
              <strong style={{ fontSize: '1.1em', fontFamily: '"IBM Plex Mono", monospace' }}>
                #{ta.ticket?.id}: {ta.ticket?.title}
              </strong>
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ marginRight: '1rem' }}>
                <strong>Category:</strong>{' '}
                <span
                  style={{
                    color: getCategoryColor(ta.category),
                    fontWeight: 'bold',
                    textTransform: 'capitalize'
                  }}
                >
                  {ta.category.replace('_', ' ')}
                </span>
              </span>
              <span>
                <strong>Priority:</strong>{' '}
                <span
                  style={{
                    color: getPriorityColor(ta.priority),
                    fontWeight: 'bold',
                    textTransform: 'capitalize'
                  }}
                >
                  {ta.priority}
                </span>
              </span>
            </div>

            {ta.notes && (
              <div style={{
                marginTop: '0.5rem',
                padding: '0.5rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                fontStyle: 'italic',
                color: '#495057'
              }}>
                💡 {ta.notes}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};