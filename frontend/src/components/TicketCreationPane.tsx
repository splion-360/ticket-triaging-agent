import React, { useState } from 'react';
import { TicketCreate } from '../types';
import { useToast } from '../contexts/ToastContext';

interface TicketCreationPaneProps {
  onSubmit: (tickets: TicketCreate[]) => Promise<void>;
  loading: boolean;
}

export const TicketCreationPane: React.FC<TicketCreationPaneProps> = ({
  onSubmit,
  loading
}) => {
  const { addToast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({ title: '', description: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = { title: '', description: '' };
    
    if (!title.trim()) {
      newErrors.title = 'Please enter a ticket title';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Please enter a ticket description';
    }
    
    setErrors(newErrors);
    
    if (newErrors.title || newErrors.description) {
      return;
    }
    
    await onSubmit([{ title: title.trim(), description: description.trim() }]);
    setTitle('');
    setDescription('');
    setErrors({ title: '', description: '' });
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (errors.title && value.trim()) {
      setErrors(prev => ({ ...prev, title: '' }));
    }
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    if (errors.description && value.trim()) {
      setErrors(prev => ({ ...prev, description: '' }));
    }
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
      <h3 style={{
        margin: '0 0 0.75rem 0',
        color: '#2c3e50',
        fontSize: '1.15rem',
        fontWeight: 600
      }}>
        Create Tickets
      </h3>

      <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.25rem',
            color: '#2c3e50',
            fontSize: '0.75rem',
            fontWeight: 500
          }}>
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="What is the ticket all about..."
            style={{
              width: 'calc(100% - 16px)',
              padding: '6px 8px',
              border: `1px solid ${errors.title ? '#dc3545' : '#e9ecef'}`,
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              if (!errors.title) e.target.style.borderColor = '#007bff';
            }}
            onBlur={(e) => {
              if (!errors.title) e.target.style.borderColor = '#e9ecef';
            }}
            required
          />
          {errors.title && (
            <span style={{
              fontSize: '0.7rem',
              color: '#dc3545',
              marginTop: '2px',
              display: 'block'
            }}>
              {errors.title}
            </span>
          )}
        </div>
        <div style={{ marginBottom: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.25rem',
            color: '#2c3e50',
            fontSize: '0.75rem',
            fontWeight: 500
          }}>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="Describe your ticket..."
            style={{
              width: 'calc(100% - 16px)',
              flex: 1,
              minHeight: '60px',
              padding: '6px 8px',
              border: `1px solid ${errors.description ? '#dc3545' : '#e9ecef'}`,
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontFamily: 'inherit',
              outline: 'none',
              resize: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              if (!errors.description) e.target.style.borderColor = '#007bff';
            }}
            onBlur={(e) => {
              if (!errors.description) e.target.style.borderColor = '#e9ecef';
            }}
            required
          />
          {errors.description && (
            <span style={{
              fontSize: '0.7rem',
              color: '#dc3545',
              marginTop: '2px',
              display: 'block'
            }}>
              {errors.description}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '6px 12px',
            backgroundColor: loading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            transition: 'background-color 0.2s',
            width: '100%'
          }}
          onMouseOver={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#0056b3';
          }}
          onMouseOut={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#007bff';
          }}
        >
          {loading ? 'Creating...' : 'Create'}
        </button>
      </form>
    </div>
  );
};