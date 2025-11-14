import React from 'react';
import { AnalysisRun } from '../types';

interface LatestAnalysisPaneProps {
  analysis: AnalysisRun | null;
  loading: boolean;
}

export const LatestAnalysisPane: React.FC<LatestAnalysisPaneProps> = ({
  analysis,
  loading
}) => {
  const getCategoryStats = () => {
    if (!analysis?.ticket_analyses) return {};
    const stats: Record<string, number> = {};
    analysis.ticket_analyses.forEach(ta => {
      if (ta.category) {
        stats[ta.category] = (stats[ta.category] || 0) + 1;
      }
    });
    return stats;
  };

  const getPriorityStats = () => {
    if (!analysis?.ticket_analyses) return {};
    const stats: Record<string, number> = {};
    analysis.ticket_analyses.forEach(ta => {
      if (ta.priority) {
        stats[ta.priority] = (stats[ta.priority] || 0) + 1;
      }
    });
    return stats;
  };

  const categoryStats = getCategoryStats();
  const priorityStats = getPriorityStats();

  const getCategoryColor = (category: string) => {
    const colors = [
      '#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14'
    ];
    const hash = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e9ecef',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h2 style={{
        margin: '0 0 1rem 0',
        color: '#2c3e50',
        fontSize: '1.125rem',
        fontWeight: 600
      }}>
        Latest Analysis
      </h2>

      {loading ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100px',
          color: '#6c757d'
        }}>
          Running analysis...
        </div>
      ) : !analysis ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100px',
          color: '#6c757d',
          fontSize: '0.875rem',
          textAlign: 'center'
        }}>
          No analysis available yet.<br />
          Analyze some tickets to see results.
        </div>
      ) : (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{
            padding: '12px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <h4 style={{
                margin: 0,
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#2c3e50'
              }}>
                Run #{analysis.id}
              </h4>
              <span style={{
                fontSize: '0.7rem',
                color: '#6c757d'
              }}>
                {new Date(analysis.created_at).toLocaleDateString()}
              </span>
            </div>
            <p style={{
              margin: '0 0 8px 0',
              fontSize: '0.75rem',
              color: '#495057',
              lineHeight: 1.4
            }}>
              {analysis.summary}
            </p>
            <div style={{
              fontSize: '0.7rem',
              color: '#007bff',
              fontWeight: 600
            }}>
              {analysis.ticket_analyses.length} tickets analyzed
            </div>
          </div>

          {Object.keys(categoryStats).length > 0 && (
            <div>
              <h4 style={{
                margin: '0 0 8px 0',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#2c3e50'
              }}>
                Categories
              </h4>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                {Object.entries(categoryStats)
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, count]) => (
                    <div
                      key={category}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 8px',
                        backgroundColor: 'white',
                        borderRadius: '4px',
                        border: '1px solid #e9ecef'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: getCategoryColor(category)
                        }} />
                        <span style={{
                          fontSize: '0.75rem',
                          color: '#495057'
                        }}>
                          {category}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#2c3e50'
                      }}>
                        {count}
                      </span>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {Object.keys(priorityStats).length > 0 && (
            <div>
              <h4 style={{
                margin: '0 0 8px 0',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#2c3e50'
              }}>
                Priorities
              </h4>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                {Object.entries(priorityStats)
                  .sort(([a], [b]) => {
                    const order = { high: 0, medium: 1, low: 2 };
                    return (order[a.toLowerCase() as keyof typeof order] || 3) - 
                           (order[b.toLowerCase() as keyof typeof order] || 3);
                  })
                  .map(([priority, count]) => (
                    <div
                      key={priority}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 8px',
                        backgroundColor: 'white',
                        borderRadius: '4px',
                        border: '1px solid #e9ecef'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: getPriorityColor(priority)
                        }} />
                        <span style={{
                          fontSize: '0.75rem',
                          color: '#495057'
                        }}>
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#2c3e50'
                      }}>
                        {count}
                      </span>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {Object.keys(categoryStats).length === 0 && Object.keys(priorityStats).length === 0 && (
            <div style={{
              textAlign: 'center',
              color: '#6c757d',
              fontSize: '0.75rem',
              fontStyle: 'italic'
            }}>
              No categorization data available
            </div>
          )}
        </div>
      )}
    </div>
  );
};