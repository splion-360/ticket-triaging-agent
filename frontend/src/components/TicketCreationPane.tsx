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
  const [activeTab, setActiveTab] = useState<'create' | 'upload'>('create');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({ title: '', description: '', file: '' });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'create') {
      const newErrors = { title: '', description: '', file: '' };

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
      setErrors({ title: '', description: '', file: '' });
    } else if (activeTab === 'upload') {
      const newErrors = { title: '', description: '', file: '' };

      if (!uploadedFile) {
        newErrors.file = 'Please select a JSON file';
        setErrors(newErrors);
        return;
      }

      try {
        const fileContent = await uploadedFile.text();
        const jsonData = JSON.parse(fileContent);

        let tickets: TicketCreate[] = [];

        if (Array.isArray(jsonData)) {
          tickets = jsonData.map((item: any) => ({
            title: item.title || '',
            description: item.description || ''
          })).filter((ticket: TicketCreate) => ticket.title && ticket.description);
        } else if (jsonData.title && jsonData.description) {
          tickets = [{ title: jsonData.title, description: jsonData.description }];
        }

        if (tickets.length === 0) {
          newErrors.file = 'No valid tickets found in JSON file';
          setErrors(newErrors);
          return;
        }

        await onSubmit(tickets);
        setUploadedFile(null);
        setErrors({ title: '', description: '', file: '' });
      } catch (error) {
        newErrors.file = 'Invalid JSON file format';
        setErrors(newErrors);
      }
    }
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/json') {
      setUploadedFile(file);
      if (errors.file) {
        setErrors(prev => ({ ...prev, file: '' }));
      }
    } else if (file) {
      setUploadedFile(null);
      setErrors(prev => ({ ...prev, file: 'Please select a valid JSON file' }));
    }
  };

  const handleTabChange = (tab: 'create' | 'upload') => {
    setActiveTab(tab);
    setErrors({ title: '', description: '', file: '' });
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

      <div style={{
        display: 'flex',
        marginBottom: '0.75rem',
        borderBottom: '1px solid #e9ecef'
      }}>
        <button
          type="button"
          onClick={() => handleTabChange('create')}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: 'none',
            backgroundColor: activeTab === 'create' ? '#007bff' : 'transparent',
            color: activeTab === 'create' ? 'white' : '#6c757d',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
            borderRadius: '4px 4px 0 0'
          }}
        >
          Create
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('upload')}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: 'none',
            backgroundColor: activeTab === 'upload' ? '#007bff' : 'transparent',
            color: activeTab === 'upload' ? 'white' : '#6c757d',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
            borderRadius: '4px 4px 0 0'
          }}
        >
          Upload
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'create' && (
          <>
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
          </>
        )}

        {activeTab === 'upload' && (
          <div style={{ marginBottom: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.25rem',
              color: '#2c3e50',
              fontSize: '0.75rem',
              fontWeight: 500
            }}>
              Upload JSON File
            </label>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              style={{
                width: 'calc(100% - 16px)',
                padding: '6px 8px',
                border: `1px solid ${errors.file ? '#dc3545' : '#e9ecef'}`,
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            />
            {errors.file && (
              <span style={{
                fontSize: '0.7rem',
                color: '#dc3545',
                marginTop: '2px',
                display: 'block'
              }}>
                {errors.file}
              </span>
            )}
            {uploadedFile && (
              <div style={{
                marginTop: '8px',
                padding: '8px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                fontSize: '0.75rem',
                color: '#495057'
              }}>
                Selected: {uploadedFile.name}
              </div>
            )}
            <div style={{
              marginTop: '12px',
              padding: '8px',
              backgroundColor: '#e9ecef',
              borderRadius: '4px',
              fontSize: '0.7rem',
              color: '#6c757d',
              lineHeight: 1.4
            }}>
              <strong>Expected JSON format:</strong><br />
              Array: [{"{"}"title": "Issue title", "description": "Issue description"{"}"}, ...]<br />
              Single: {"{"}"title": "Issue title", "description": "Issue description"{"}"}
            </div>
          </div>
        )}

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
          {loading ? 'Processing...' : activeTab === 'create' ? 'Add' : 'Upload'}
        </button>
      </form>
    </div>
  );
};