import React, { useState } from 'react';
import { AnalysisRun } from '../types';
import { TicketDetailsModal } from './TicketDetailsModal';

interface LatestAnalysisPaneProps {
  analysis: AnalysisRun | null;
  loading: boolean;
}

export const LatestAnalysisPane: React.FC<LatestAnalysisPaneProps> = ({
  analysis,
  loading
}) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '1rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e9ecef',
        display: 'flex',
        flexDirection: 'column',
        height: '85%'
      }}>
        <h2 style={{
          margin: '0 0 1rem 0',
          color: '#2c3e50',
          fontSize: '1.125rem',
          fontWeight: 600
        }}>
          Latest Analysis
        </h2>

        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
            color: '#6c757d',
            fontSize: '0.875rem'
          }}>
            Running analysis...
          </div>
        ) : !analysis ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
            color: '#6c757d',
            fontSize: '0.875rem',
            textAlign: 'center'
          }}>
            No analysis available yet.<br />
            Analyze some tickets to see results.
          </div>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              padding: '12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e9ecef',
              marginBottom: '0.75rem',
              flex: 1
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <h4 style={{
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: '#2c3e50'
                }}>
                  Run #{analysis.id}
                </h4>
              </div>
              <p style={{
                margin: '0 0 8px 0',
                fontSize: '1rem',
                color: '#495057',
                lineHeight: 1.4,
                flex: 1
              }}>
                {analysis.summary}
              </p>

            </div>

            <button
              onClick={() => setShowModal(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'background-color 0.2s',
                width: '100%'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#0056b3';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#007bff';
              }}
            >
              Show processed tickets
            </button>
          </div>
        )}
      </div>

      {showModal && analysis && (
        <TicketDetailsModal
          analysis={analysis}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};