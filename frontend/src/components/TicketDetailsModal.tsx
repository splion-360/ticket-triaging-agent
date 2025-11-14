import React, { useState } from 'react';
import { AnalysisRun } from '../types';

interface TicketDetailsModalProps {
  analysis: AnalysisRun;
  onClose: () => void;
}

export const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({
  analysis,
  onClose
}) => {
  const [expandedTickets, setExpandedTickets] = useState<Set<number>>(new Set());

  const toggleTicketExpansion = (ticketId: number) => {
    setExpandedTickets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ticketId)) {
        newSet.delete(ticketId);
      } else {
        newSet.add(ticketId);
      }
      return newSet;
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' };
      case 'medium': return { bg: '#fff3cd', color: '#856404', border: '#ffeaa7' };
      case 'low': return { bg: '#d1ecf1', color: '#0c5460', border: '#bee5eb' };
      default: return { bg: '#e2e3e5', color: '#383d41', border: '#d6d8db' };
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = [
      { bg: '#e7f3ff', color: '#0066cc', border: '#b3d9ff' },
      { bg: '#e8f5e8', color: '#2d5a2d', border: '#b8e6b8' },
      { bg: '#fff0e6', color: '#cc6600', border: '#ffcc99' },
      { bg: '#f0e6ff', color: '#6600cc', border: '#cc99ff' },
      { bg: '#ffe6f0', color: '#cc0066', border: '#ff99cc' },
    ];
    const hash = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '2rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '800px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e9ecef',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8f9fa'
        }}>
          <div>
            <h2 style={{
              margin: '0 0 4px 0',
              color: '#2c3e50',
              fontSize: '1.25rem',
              fontWeight: 600
            }}>
              Details of analysis run #{analysis.id}
            </h2>
            <p style={{
              margin: 0,
              color: '#6c757d',
              fontSize: '0.875rem'
            }}>
              {analysis.ticket_analyses.length} tickets processed on {new Date(analysis.created_at).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#6c757d',
              fontSize: '1.5rem',
              cursor: 'pointer',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#e9ecef';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ×
          </button>
        </div>

        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {analysis.ticket_analyses.map((ticketAnalysis) => {
              const ticket = ticketAnalysis.ticket;
              if (!ticket) return null;

              const isExpanded = expandedTickets.has(ticket.id);
              const priorityStyle = getPriorityColor(ticketAnalysis.priority || 'unknown');
              const categoryStyle = getCategoryColor(ticketAnalysis.category || 'uncategorized');

              return (
                <div
                  key={ticket.id}
                  style={{
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: '#f8f9fa'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        margin: '0 0 6px 0',
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#2c3e50'
                      }}>
                        {ticket.title}
                      </h4>
                      <p style={{
                        margin: '0 0 12px 0',
                        fontSize: '0.875rem',
                        color: '#6c757d',
                        lineHeight: 1.4
                      }}>
                        {isExpanded
                          ? ticket.description
                          : truncateText(ticket.description, 120)
                        }
                      </p>

                      {ticketAnalysis.notes && isExpanded && (
                        <div style={{
                          padding: '12px',
                          backgroundColor: '#e9ecef',
                          borderRadius: '6px',
                          marginBottom: '12px'
                        }}>
                          <strong style={{ fontSize: '0.875rem', color: '#495057' }}>Agent Notes:</strong>
                          <p style={{
                            margin: '6px 0 0 0',
                            fontSize: '0.875rem',
                            color: '#495057',
                            lineHeight: 1.3
                          }}>
                            {ticketAnalysis.notes}
                          </p>
                        </div>
                      )}

                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                        alignItems: 'center'
                      }}>
                        {ticketAnalysis.category && (
                          <span style={{
                            fontSize: '0.75rem',
                            padding: '4px 8px',
                            backgroundColor: categoryStyle.bg,
                            color: categoryStyle.color,
                            border: `1px solid ${categoryStyle.border}`,
                            borderRadius: '4px',
                            fontWeight: 500
                          }}>
                            {ticketAnalysis.category}
                          </span>
                        )}
                        {ticketAnalysis.priority && (
                          <span style={{
                            fontSize: '0.75rem',
                            padding: '4px 8px',
                            backgroundColor: priorityStyle.bg,
                            color: priorityStyle.color,
                            border: `1px solid ${priorityStyle.border}`,
                            borderRadius: '4px',
                            fontWeight: 500
                          }}>
                            {ticketAnalysis.priority.toUpperCase()}
                          </span>
                        )}
                        <span style={{
                          fontSize: '0.7rem',
                          color: '#6c757d'
                        }}>
                          #{ticket.id} • {new Date(ticket.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleTicketExpansion(ticket.id)}
                      style={{
                        padding: '6px 10px',
                        border: '1px solid #dee2e6',
                        backgroundColor: 'white',
                        color: '#007bff',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        marginLeft: '12px',
                        borderRadius: '4px'
                      }}
                    >
                      {isExpanded ? '▲ Less' : '▼ More'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {analysis.ticket_analyses.length === 0 && (
            <div style={{
              textAlign: 'center',
              color: '#6c757d',
              fontSize: '0.875rem',
              padding: '2rem'
            }}>
              No ticket analyses found in this run.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};