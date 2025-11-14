import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
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
            flexDirection: 'column',
            minHeight: 0
          }}>
            <div style={{
              padding: '12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e9ecef',
              marginBottom: '0.75rem',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
                flexShrink: 0
              }}>
                <h4 style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#2c3e50'
                }}>
                  Run (#{analysis.id})
                </h4>
              </div>
              <div style={{
                flex: 1,
                overflowY: 'auto',
                minHeight: 0
              }}>
                <div style={{
                  margin: 0,
                  fontSize: '0.75rem',
                  color: '#495057',
                  lineHeight: 1.3,
                  wordWrap: 'break-word'
                }}>
                  <ReactMarkdown
                    components={{
                    p: ({ children }) => (
                      <p style={{ margin: '0 0 6px 0', fontSize: '0.8rem', color: '#495057', lineHeight: 1.3 }}>
                        {children}
                      </p>
                    ),
                    h1: ({ children }) => (
                      <h1 style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: '#2c3e50', fontWeight: 600 }}>
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 style={{ margin: '0 0 6px 0', fontSize: '0.8rem', color: '#2c3e50', fontWeight: 600 }}>
                        {children}
                      </h2>
                    ),
                    ul: ({ children }) => (
                      <ul style={{ margin: '0 0 6px 12px', fontSize: '0.75rem', color: '#495057' }}>
                        {children}
                      </ul>
                    ),
                    li: ({ children }) => (
                      <li style={{ margin: '0 0 2px 0', fontSize: '0.75rem', color: '#495057' }}>
                        {children}
                      </li>
                    ),
                    strong: ({ children }) => (
                      <strong style={{ fontWeight: 600, color: '#2c3e50' }}>
                        {children}
                      </strong>
                    ),
                    code: ({ children }) => (
                      <code style={{
                        backgroundColor: '#f8f9fa',
                        padding: '1px 3px',
                        borderRadius: '3px',
                        fontSize: '0.7rem',
                        fontFamily: 'monospace'
                      }}>
                        {children}
                      </code>
                    )
                  }}
                  >
                    {analysis.summary}
                  </ReactMarkdown>
                </div>
              </div>

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