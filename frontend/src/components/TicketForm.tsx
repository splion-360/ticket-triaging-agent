import React, { useState } from 'react';
import { TicketCreate } from '../types';

interface TicketFormProps {
  onSubmit: (tickets: TicketCreate[]) => void;
  loading?: boolean;
}

export const TicketForm: React.FC<TicketFormProps> = ({ onSubmit, loading = false }) => {
  const [tickets, setTickets] = useState<TicketCreate[]>([
    { title: '', description: '' }
  ]);

  const addTicket = () => {
    setTickets([...tickets, { title: '', description: '' }]);
  };

  const removeTicket = (index: number) => {
    setTickets(tickets.filter((_, i) => i !== index));
  };

  const updateTicket = (index: number, field: keyof TicketCreate, value: string) => {
    const updatedTickets = [...tickets];
    updatedTickets[index] = { ...updatedTickets[index], [field]: value };
    setTickets(updatedTickets);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validTickets = tickets.filter(ticket => ticket.title.trim() && ticket.description.trim());
    if (validTickets.length > 0) {
      onSubmit(validTickets);
      setTickets([{ title: '', description: '' }]);
    }
  };

  return (
    <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Add Support Tickets</h2>
      <form onSubmit={handleSubmit}>
        {tickets.map((ticket, index) => (
          <div key={index} style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <input
                type="text"
                placeholder="Ticket Title"
                value={ticket.title}
                onChange={(e) => updateTicket(index, 'title', e.target.value)}
                style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
                disabled={loading}
              />
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <textarea
                placeholder="Ticket Description"
                value={ticket.description}
                onChange={(e) => updateTicket(index, 'description', e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '0.5rem', resize: 'vertical' }}
                disabled={loading}
              />
            </div>
            {tickets.length > 1 && (
              <button
                type="button"
                onClick={() => removeTicket(index)}
                style={{ padding: '0.25rem 0.5rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
                disabled={loading}
              >
                Remove
              </button>
            )}
          </div>
        ))}
        
        <div style={{ marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={addTicket}
            style={{ padding: '0.5rem 1rem', marginRight: '0.5rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}
            disabled={loading}
          >
            Add Another Ticket
          </button>
          <button
            type="submit"
            style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Tickets'}
          </button>
        </div>
      </form>
    </div>
  );
};