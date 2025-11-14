import React, { useState, useMemo } from 'react';
import { Ticket } from '../types';

interface AnalyzedTicketsPaneProps {
  tickets: Ticket[];
  loading: boolean;
}

export const AnalyzedTicketsPane: React.FC<AnalyzedTicketsPaneProps> = ({
  tickets,
  loading
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedTickets, setExpandedTickets] = useState<Set<string>>(new Set());
  const ticketsPerPage = 3;

  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * ticketsPerPage;
    const endIndex = startIndex + ticketsPerPage;
    return tickets.slice(startIndex, endIndex);
  }, [tickets, currentPage]);

  const totalPages = Math.ceil(tickets.length / ticketsPerPage);

  const toggleTicketExpansion = (ticketId: string) => {
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
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e9ecef',
      display: 'flex',
      flexDirection: 'column',
      height: '85%',
      marginTop: '0.1rem'
    }}>
      <h2 style={{
        margin: '0 0 1rem 0',
        color: '#2c3e50',
        fontSize: '1.125rem',
        fontWeight: 600
      }}>
        Analyzed Tickets ({tickets.length})
      </h2>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        marginBottom: '1rem'
      }}>
        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100px',
            color: '#6c757d'
          }}>
            Loading tickets...
          </div>
        ) : tickets.length === 0 ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100px',
            color: '#6c757d',
            fontSize: '0.875rem'
          }}>
            No analyzed tickets
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {paginatedTickets.map((ticket) => {
              const isExpanded = expandedTickets.has(ticket.id);
              const priorityStyle = getPriorityColor(ticket.priority || 'unknown');
              const categoryStyle = getCategoryColor(ticket.category || 'uncategorized');

              return (
                <div
                  key={ticket.id}
                  style={{
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '10px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        margin: '0 0 6px 0',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: '#2c3e50'
                      }}>
                        {ticket.title} <span style={{ fontSize: '0.75rem', color: '#6c757d', fontWeight: 800 }}>(#{ticket.id})</span>
                      </h4>

                      {isExpanded && (
                        <p style={{
                          margin: '0 0 8px 0',
                          fontSize: '0.7rem',
                          color: '#6c757d',
                          lineHeight: 1.3,
                          padding: '6px',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '3px',
                          border: '1px solid #e9ecef'
                        }}>
                          <strong>Description:</strong><br />
                          {ticket.description}
                        </p>
                      )}
                      {ticket.notes && isExpanded && (
                        <div style={{
                          padding: '8px',
                          backgroundColor: '#e9ecef',
                          borderRadius: '4px',
                          marginBottom: '8px'
                        }}>
                          <strong style={{ fontSize: '0.7rem', color: '#495057' }}>Analysis Notes:</strong>
                          <p style={{
                            margin: '4px 0 0 0',
                            fontSize: '0.7rem',
                            color: '#495057',
                            lineHeight: 1.3
                          }}>
                            {ticket.notes}
                          </p>
                        </div>
                      )}
                      <div style={{
                        display: 'flex',
                        gap: '6px',
                        flexWrap: 'wrap',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          fontSize: '0.7rem',
                          padding: '2px 6px',
                          backgroundColor: '#d4edda',
                          color: '#155724',
                          borderRadius: '4px',
                          fontWeight: 500
                        }}>
                          COMPLETE
                        </span>
                        {ticket.category && (
                          <span style={{
                            fontSize: '0.7rem',
                            padding: '2px 6px',
                            backgroundColor: categoryStyle.bg,
                            color: categoryStyle.color,
                            border: `1px solid ${categoryStyle.border}`,
                            borderRadius: '4px',
                            fontWeight: 500
                          }}>
                            {ticket.category}
                          </span>
                        )}
                        {ticket.priority && (
                          <span style={{
                            fontSize: '0.7rem',
                            padding: '2px 6px',
                            backgroundColor: priorityStyle.bg,
                            color: priorityStyle.color,
                            border: `1px solid ${priorityStyle.border}`,
                            borderRadius: '4px',
                            fontWeight: 500
                          }}>
                            {ticket.priority.toUpperCase()}
                          </span>
                        )}
                        <span style={{
                          fontSize: '0.8rem',
                          color: '#6c757d'
                        }}>
                          • {new Date(ticket.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleTicketExpansion(ticket.id)}
                      style={{
                        padding: '4px 8px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: '#007bff',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        marginLeft: '8px'
                      }}
                    >
                      {isExpanded ? '▼' : '▶'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px'
        }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '4px 8px',
              border: '1px solid #dee2e6',
              backgroundColor: currentPage === 1 ? '#f8f9fa' : 'white',
              color: currentPage === 1 ? '#6c757d' : '#2c3e50',
              borderRadius: '4px',
              fontSize: '0.75rem',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit'
            }}
          >
            ◀
          </button>
          <span style={{
            fontSize: '0.75rem',
            color: '#6c757d',
            minWidth: '60px',
            textAlign: 'center'
          }}>
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '4px 8px',
              border: '1px solid #dee2e6',
              backgroundColor: currentPage === totalPages ? '#f8f9fa' : 'white',
              color: currentPage === totalPages ? '#6c757d' : '#2c3e50',
              borderRadius: '4px',
              fontSize: '0.75rem',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit'
            }}
          >
            ▶
          </button>
        </div>
      )}
    </div>
  );
};