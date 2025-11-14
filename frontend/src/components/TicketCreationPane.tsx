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
  const [bulkText, setBulkText] = useState('');
  const [mode, setMode] = useState<'single' | 'bulk'>('single');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'single') {
      if (!title.trim() || !description.trim()) return;
      await onSubmit([{ title: title.trim(), description: description.trim() }]);
      setTitle('');
      setDescription('');
    } else {
      if (!bulkText.trim()) return;
      const tickets = parseBulkText(bulkText);
      if (tickets.length === 0) return;
      await onSubmit(tickets);
      setBulkText('');
    }
  };

  const parseBulkText = (text: string): TicketCreate[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const tickets: TicketCreate[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('Title:') || line.startsWith('title:')) {
        const title = line.substring(6).trim();
        const descLine = lines[i + 1];
        if (descLine && (descLine.trim().startsWith('Description:') || descLine.trim().startsWith('description:'))) {
          const description = descLine.substring(12).trim();
          if (title && description) {
            tickets.push({ title, description });
          }
          i++;
        }
      } else if (line.includes('|')) {
        const [title, description] = line.split('|').map(s => s.trim());
        if (title && description) {
          tickets.push({ title, description });
        }
      }
    }
    
    return tickets;
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e9ecef',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{
          margin: 0,
          color: '#2c3e50',
          fontSize: '1.25rem',
          fontWeight: 600
        }}>
          Create Tickets
        </h2>
        <div style={{
          display: 'flex',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          padding: '4px'
        }}>
          <button
            type="button"
            onClick={() => setMode('single')}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: mode === 'single' ? 'white' : 'transparent',
              color: mode === 'single' ? '#2c3e50' : '#6c757d',
              fontSize: '0.875rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: mode === 'single' ? 600 : 400,
              transition: 'all 0.2s'
            }}
          >
            Single
          </button>
          <button
            type="button"
            onClick={() => setMode('bulk')}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: mode === 'bulk' ? 'white' : 'transparent',
              color: mode === 'bulk' ? '#2c3e50' : '#6c757d',
              fontSize: '0.875rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: mode === 'bulk' ? 600 : 400,
              transition: 'all 0.2s'
            }}
          >
            Bulk
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {mode === 'single' ? (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#2c3e50',
                fontSize: '0.875rem',
                fontWeight: 500
              }}>
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter ticket title..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
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
            <div style={{ marginBottom: '1.5rem', flex: 1 }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#2c3e50',
                fontSize: '0.875rem',
                fontWeight: 500
              }}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter ticket description..."
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: '120px',
                  padding: '12px',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'vertical',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                required
              />
            </div>
          </>
        ) : (
          <div style={{ marginBottom: '1.5rem', flex: 1 }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#2c3e50',
              fontSize: '0.875rem',
              fontWeight: 500
            }}>
              Bulk Import
            </label>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="Format: Title: Your title | Description: Your description&#10;Or:&#10;Title: First ticket&#10;Description: First description&#10;Title: Second ticket&#10;Description: Second description"
              style={{
                width: '100%',
                height: '100%',
                minHeight: '200px',
                padding: '12px',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'vertical',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
              required
            />
            <p style={{
              margin: '8px 0 0 0',
              fontSize: '0.75rem',
              color: '#6c757d'
            }}>
              Support formats: "Title | Description" or separate lines with "Title:" and "Description:"
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (mode === 'single' ? !title.trim() || !description.trim() : !bulkText.trim())}
          style={{
            padding: '12px 24px',
            backgroundColor: loading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
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
          {loading ? 'Creating...' : `Create ${mode === 'single' ? 'Ticket' : 'Tickets'}`}
        </button>
      </form>
    </div>
  );
};