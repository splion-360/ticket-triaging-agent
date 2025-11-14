import React, { useState } from 'react';
import { TicketCreate } from '../types';

interface TicketCreationPaneProps {
  onSubmit: (tickets: TicketCreate[]) => Promise<void>;
  loading: boolean;
}

export const TicketCreationPane: React.FC<TicketCreationPaneProps> = ({
  onSubmit,
  loading
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    await onSubmit([{ title: title.trim(), description: description.trim() }]);
    setTitle('');
    setDescription('');
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1.5rem',
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
        Create Ticket
      </h2>

      <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: '#2c3e50',
            fontSize: '0.875rem',
            fontWeight: 500
          }}>
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter ticket title..."
            style={{
              width: '100%',
              padding: '10px',
              border: '2px solid #e9ecef',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#007bff'}
            onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
            required
          />
        </div>
        <div style={{ marginBottom: '1rem', flex: 1 }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: '#2c3e50',
            fontSize: '0.875rem',
            fontWeight: 500
          }}>
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter ticket description..."
            style={{
              width: '100%',
              height: '100%',
              minHeight: '80px',
              padding: '10px',
              border: '2px solid #e9ecef',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              outline: 'none',
              resize: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#007bff'}
            onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !title.trim() || !description.trim()}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            transition: 'background-color 0.2s',
            alignSelf: 'flex-start'
          }}
          onMouseOver={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#0056b3';
          }}
          onMouseOut={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#007bff';
          }}
        >
          {loading ? 'Creating...' : 'Create Ticket'}
        </button>
      </form>
    </div>
  );
};