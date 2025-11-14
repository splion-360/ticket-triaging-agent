import React, { useState, useMemo } from 'react';
import { Ticket } from '../types';
import { InfinityLoader } from '../components/LoadingSpinner';

interface PendingTicketsPaneProps {
  tickets: Ticket[];
  loading: boolean;
  onAnalyze: () => Promise<void>;
  analyzing: boolean;
}

export const PendingTicketsPane: React.FC<PendingTicketsPaneProps> = ({
  tickets,
  loading,
  onAnalyze,
  analyzing
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
      marginTop: '1rem'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h2 style={{
          margin: 0,
          color: '#2c3e50',
          fontSize: '1.125rem',
          fontWeight: 600
        }}>
          Pending Tickets ({tickets.length})
        </h2>
        <button
          onClick={onAnalyze}
          disabled={analyzing || tickets.length === 0}
          style={{
            padding: '8px 16px',
            backgroundColor: analyzing ? '#6c757d' : tickets.length === 0 ? '#dee2e6' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: analyzing || tickets.length === 0 ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            if (!analyzing && tickets.length > 0) {
              e.currentTarget.style.backgroundColor = '#218838';
            }
          }}
          onMouseOut={(e) => {
            if (!analyzing && tickets.length > 0) {
              e.currentTarget.style.backgroundColor = '#28a745';
            }
          }}
        >
          {analyzing ? 'Analyzing...' : 'Analyze All'}
        </button>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        marginBottom: '1rem'
      }}>
        {analyzing ? (
          <InfinityLoader
            size={32}
            message="Analyzing tickets..."
          />
        ) : loading ? (
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
            No pending tickets
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {paginatedTickets.map((ticket) => {
              const isExpanded = expandedTickets.has(ticket.id);
              return (
                <div
                  key={ticket.id}
                  style={{
                    border: '1px solid #e9ecef',
                    borderRadius: '6px',
                    padding: '10px',
                    backgroundColor: '#f8f9fa'
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
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: '#2c3e50'
                      }}>
                        {ticket.title} <span style={{ fontSize: '0.75rem', color: '#6c757d', fontWeight: 800 }}>(#{ticket.id})</span>
                      </h4>

                      {isExpanded && (
                        <p style={{
                          margin: '0 0 8px 0',
                          fontSize: '0.8rem',
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

                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          fontSize: '0.7rem',
                          padding: '2px 6px',
                          backgroundColor: '#fff3cd',
                          color: '#590808ff',
                          borderRadius: '4px',
                          fontWeight: 500
                        }}>
                          INCOMPLETE
                        </span>
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
                      {isExpanded ? '▼ Less' : '▶ More'}
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