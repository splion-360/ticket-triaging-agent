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
  const [expandedTickets, setExpandedTickets] = useState<Set<number>>(new Set());
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const categories = useMemo(() => {
    const cats = new Set<string>();
    tickets.forEach(ticket => {
      if (ticket.category) cats.add(ticket.category);
    });
    return Array.from(cats).sort();
  }, [tickets]);

  const priorities = useMemo(() => {
    const priors = new Set<string>();
    tickets.forEach(ticket => {
      if (ticket.priority) priors.add(ticket.priority);
    });
    return Array.from(priors).sort();
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const categoryMatch = filterCategory === 'all' || ticket.category === filterCategory;
      const priorityMatch = filterPriority === 'all' || ticket.priority === filterPriority;
      return categoryMatch && priorityMatch;
    });
  }, [tickets, filterCategory, filterPriority]);

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
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1.25rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e9ecef',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      <h2 style={{
        margin: '0 0 1rem 0',
        color: '#2c3e50',
        fontSize: '1.125rem',
        fontWeight: 600
      }}>
        Analyzed Tickets ({tickets.length})
      </h2>

      {tickets.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '1rem',
          flexWrap: 'wrap'
        }}>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{
              padding: '4px 8px',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontFamily: 'inherit',
              backgroundColor: 'white'
            }}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            style={{
              padding: '4px 8px',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontFamily: 'inherit',
              backgroundColor: 'white'
            }}
          >
            <option value="all">All Priorities</option>
            {priorities.map(priority => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </select>
        </div>
      )}

      <div style={{
        flex: 1,
        overflowY: 'auto'
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
        ) : filteredTickets.length === 0 ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100px',
            color: '#6c757d',
            fontSize: '0.875rem'
          }}>
            No tickets match the selected filters
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredTickets.map((ticket) => {
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
                    marginBottom: '8px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        margin: '0 0 4px 0',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: '#2c3e50'
                      }}>
                        {ticket.title}
                      </h4>
                      <p style={{
                        margin: '0 0 8px 0',
                        fontSize: '0.7rem',
                        color: '#6c757d',
                        lineHeight: 1.3
                      }}>
                        {isExpanded 
                          ? ticket.description 
                          : truncateText(ticket.description, 50)
                        }
                      </p>
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
                        flexWrap: 'wrap'
                      }}>
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
                      {isExpanded ? '▲' : '▼'}
                    </button>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontSize: '0.7rem',
                      color: '#6c757d'
                    }}>
                      #{ticket.id} • {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '2px 6px',
                      backgroundColor: '#d4edda',
                      color: '#155724',
                      borderRadius: '4px',
                      fontWeight: 500
                    }}>
                      ANALYZED
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};