import React from 'react';
import { Ticket } from '../types';

interface TicketListProps {
  tickets: Ticket[];
  loading?: boolean;
}

export const TicketList: React.FC<TicketListProps> = ({ tickets, loading = false }) => {
  if (loading) {
    return <div style={{ padding: '1rem' }}>Loading tickets...</div>;
  }

  if (tickets.length === 0) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center', color: '#6c757d' }}>
        No tickets found. Create some tickets to get started.
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2>Current Tickets ({tickets.length})</h2>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            style={{
              padding: '1rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: '#f8f9fa'
            }}
          >
            <div style={{ marginBottom: '0.5rem' }}>
              <strong style={{ fontSize: '1.1em' }}>#{ticket.id}: {ticket.title}</strong>
            </div>
            <div style={{ marginBottom: '0.5rem', color: '#495057' }}>
              {ticket.description}
            </div>
            <div style={{ fontSize: '0.875em', color: '#6c757d' }}>
              Created: {new Date(ticket.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};