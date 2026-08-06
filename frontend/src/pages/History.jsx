import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Search, Pill, Calendar, ChevronRight, Trash2, History as HistoryIcon } from 'lucide-react';

export const History = () => {
  const navigate = useNavigate();
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [query,   setQuery]     = useState('');

  const fetchHistory = () => {
    setLoading(true);
    api.getHistory()
      .then(res => setHistory(res.history || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await api.deleteHistoryItem(id);
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch {}
  };

  const filtered = history.filter(item =>
    item.medicationName?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="page-inner fade-in">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Scan History</h1>
          <p className="page-subtitle">{history.length} medication scan{history.length !== 1 ? 's' : ''} saved</p>
        </div>
        <button className="btn-secondary" onClick={fetchHistory}>Refresh</button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <Search size={18} color="var(--md-sys-color-on-surface-variant)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input
          className="search-input"
          type="text"
          placeholder="Search medication name or primary use…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '16px', padding: '14px 24px', borderBottom: '1px solid var(--border)', background: 'var(--md-sys-color-surface-container-high)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--md-sys-color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Medication</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--md-sys-color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Date</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--md-sys-color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Action</span>
        </div>

        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.9rem' }}>Loading scans…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <HistoryIcon size={36} color="var(--md-sys-color-on-surface-variant)" style={{ margin: '0 auto 14px', display: 'block' }} />
            <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.92rem', fontWeight: 500 }}>
              {query ? `No medication results for "${query}"` : 'No scans saved yet. Head to Scanner to begin.'}
            </p>
          </div>
        ) : (
          filtered.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => navigate(`/scan/${item.id}`)}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                gap: '16px',
                alignItems: 'center',
                padding: '16px 24px',
                borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                cursor: 'pointer',
                transition: 'all var(--md-motion-duration) var(--md-motion-easing)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--md-sys-color-surface-container-high)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Name + icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', overflow: 'hidden' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: 'var(--r-full)', background: 'var(--md-sys-color-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Pill size={18} color="var(--md-sys-color-on-primary-container)" />
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.medicationName}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--md-sys-color-on-surface-variant)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.primaryUse?.substring(0, 60)}…
                  </div>
                </div>
              </div>

              {/* Date */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.82rem', whiteSpace: 'nowrap', fontWeight: 500 }}>
                <Calendar size={14} />
                {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>

              {/* Delete */}
              <button
                className="btn-danger"
                title="Delete"
                onClick={(e) => handleDelete(item.id, e)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
