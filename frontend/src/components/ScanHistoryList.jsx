import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { History, Trash2, Calendar, Pill, ChevronRight } from 'lucide-react';

export const ScanHistoryList = ({ onSelectScan }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getHistory();
      setHistory(res.history || []);
    } catch (err) {
      console.warn('Failed to load scan history:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await api.deleteHistoryItem(id);
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Delete error:', err.message);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={18} color="#06b6d4" />
          Scan History ({history.length})
        </h3>
        <button onClick={fetchHistory} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
          Loading saved scans...
        </div>
      ) : history.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.875rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px' }}>
          No previous medication scans found. Capture a packaging image to get started.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
          {history.map(item => (
            <div
              key={item.id}
              onClick={() => onSelectScan && onSelectScan(item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                padding: '12px 14px',
                background: 'rgba(15, 23, 42, 0.7)',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Pill size={18} color="#06b6d4" />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', color: '#f8fafc', fontWeight: 600 }}>{item.medicationName}</h4>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={(e) => handleDelete(item.id, e)}
                  style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
                  title="Delete scan record"
                >
                  <Trash2 size={16} />
                </button>
                <ChevronRight size={16} color="#64748b" />
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
