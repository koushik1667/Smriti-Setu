import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Search, Pill, Calendar, ChevronRight, Trash2, History as HistoryIcon,
  FileText, MessageSquare, Activity, User, ShieldCheck, Sparkles, RefreshCw
} from 'lucide-react';

export const History = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('medicines'); // 'medicines', 'documents', 'chats'
  const [history, setHistory] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [chatSessions, setChatSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [histRes, docRes, chatRes] = await Promise.all([
        api.getHistory(true).catch(() => ({ history: [] })),
        api.getDocuments().catch(() => ({ documents: [] })),
        api.getChatSessions().catch(() => ({ sessions: [] }))
      ]);

      setHistory(histRes.history || []);
      setDocuments(docRes.documents || []);
      setChatSessions(chatRes.sessions || []);
    } catch (err) {
      console.warn('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleDeleteMed = async (id, e) => {
    e.stopPropagation();
    try {
      await api.deleteHistoryItem(id);
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch {}
  };

  const handleDeleteDoc = async (id, e) => {
    e.stopPropagation();
    try {
      await api.deleteDocument(id);
      setDocuments(prev => prev.filter(item => item.id !== id));
      if (selectedDoc?.id === id) setSelectedDoc(null);
    } catch {}
  };

  const handleClearChat = async (sessionId, e) => {
    e.stopPropagation();
    try {
      await api.clearChatHistory(sessionId);
      setChatSessions(prev => prev.filter(item => item.session_id !== sessionId));
    } catch {}
  };

  // Filters
  const filteredMeds = history.filter(item =>
    item.medicationName?.toLowerCase().includes(query.toLowerCase()) ||
    item.primaryUse?.toLowerCase().includes(query.toLowerCase())
  );

  const filteredDocs = documents.filter(doc =>
    doc.title?.toLowerCase().includes(query.toLowerCase()) ||
    doc.summary?.toLowerCase().includes(query.toLowerCase()) ||
    doc.document_type?.toLowerCase().includes(query.toLowerCase())
  );

  const filteredChats = chatSessions.filter(chat =>
    chat.last_message?.toLowerCase().includes(query.toLowerCase()) ||
    chat.chat_type?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="page-inner fade-in">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Saved Data & Health Records</h1>
          <p className="page-subtitle">
            Durable database storage for your scanned medicines, prescriptions, lab reports, and AI consultations
          </p>
        </div>
        <button className="btn-secondary" onClick={fetchAll} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={15} /> Refresh DB
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
        <button
          onClick={() => { setActiveTab('medicines'); setSelectedDoc(null); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: 'var(--r-full)',
            border: 'none',
            background: activeTab === 'medicines' ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-surface-container-high)',
            color: activeTab === 'medicines' ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface)',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <Pill size={16} /> Scanned Medicines ({history.length})
        </button>

        <button
          onClick={() => { setActiveTab('documents'); setSelectedDoc(null); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: 'var(--r-full)',
            border: 'none',
            background: activeTab === 'documents' ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-surface-container-high)',
            color: activeTab === 'documents' ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface)',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <FileText size={16} /> Prescriptions & Reports ({documents.length})
        </button>

        <button
          onClick={() => { setActiveTab('chats'); setSelectedDoc(null); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: 'var(--r-full)',
            border: 'none',
            background: activeTab === 'chats' ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-surface-container-high)',
            color: activeTab === 'chats' ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface)',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <MessageSquare size={16} /> AI Conversations ({chatSessions.length})
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <Search size={18} color="var(--md-sys-color-on-surface-variant)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input
          className="search-input"
          type="text"
          placeholder={`Search ${activeTab === 'medicines' ? 'medications…' : activeTab === 'documents' ? 'prescriptions & lab reports…' : 'AI chats…'}`}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {/* TAB 1: SCANNED MEDICINES */}
      {activeTab === 'medicines' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '16px', padding: '14px 24px', borderBottom: '1px solid var(--border)', background: 'var(--md-sys-color-surface-container-high)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--md-sys-color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Medication</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--md-sys-color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Date</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--md-sys-color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Action</span>
          </div>

          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.9rem' }}>Loading from database…</div>
          ) : filteredMeds.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <HistoryIcon size={36} color="var(--md-sys-color-on-surface-variant)" style={{ margin: '0 auto 14px', display: 'block' }} />
              <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.92rem', fontWeight: 500 }}>
                {query ? `No medication results for "${query}"` : 'No medicines saved in database yet. Head to Scanner to begin.'}
              </p>
            </div>
          ) : (
            filteredMeds.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => navigate(`/scan/${item.id}`)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto',
                  gap: '16px',
                  alignItems: 'center',
                  padding: '16px 24px',
                  borderBottom: idx < filteredMeds.length - 1 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer',
                  transition: 'all var(--md-motion-duration) var(--md-motion-easing)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--md-sys-color-surface-container-high)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', overflow: 'hidden' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: 'var(--r-full)', background: 'var(--md-sys-color-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Pill size={18} color="var(--md-sys-color-on-primary-container)" />
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.medicationName}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--md-sys-color-on-surface-variant)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.primaryUse ? item.primaryUse.substring(0, 60) + '…' : 'Saved medication'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.82rem', whiteSpace: 'nowrap', fontWeight: 500 }}>
                  <Calendar size={14} />
                  {new Date(item.createdAt || item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>

                <button
                  className="btn-danger"
                  title="Delete from Database"
                  onClick={(e) => handleDeleteMed(item.id, e)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: PRESCRIPTIONS & LAB REPORTS */}
      {activeTab === 'documents' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '16px', padding: '14px 24px', borderBottom: '1px solid var(--border)', background: 'var(--md-sys-color-surface-container-high)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--md-sys-color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Document Title & Type</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--md-sys-color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Type</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--md-sys-color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Date</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--md-sys-color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Action</span>
          </div>

          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.9rem' }}>Loading documents from database…</div>
          ) : filteredDocs.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <FileText size={36} color="var(--md-sys-color-on-surface-variant)" style={{ margin: '0 auto 14px', display: 'block' }} />
              <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.92rem', fontWeight: 500 }}>
                {query ? `No documents match "${query}"` : 'No prescriptions or lab reports scanned yet. Open Reports & Rx to upload and analyze.'}
              </p>
            </div>
          ) : (
            filteredDocs.map((doc, idx) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(selectedDoc?.id === doc.id ? null : doc)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto auto',
                  gap: '16px',
                  alignItems: 'center',
                  padding: '16px 24px',
                  borderBottom: idx < filteredDocs.length - 1 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer',
                  background: selectedDoc?.id === doc.id ? 'var(--md-sys-color-surface-container-highest)' : 'transparent',
                  transition: 'all var(--md-motion-duration) var(--md-motion-easing)',
                }}
                onMouseEnter={e => { if (selectedDoc?.id !== doc.id) e.currentTarget.style.background = 'var(--md-sys-color-surface-container-high)'; }}
                onMouseLeave={e => { if (selectedDoc?.id !== doc.id) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', overflow: 'hidden' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: doc.document_type === 'prescription' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <FileText size={18} color={doc.document_type === 'prescription' ? '#06b6d4' : '#6366f1'} />
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {doc.title || 'Scanned Document'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--md-sys-color-on-surface-variant)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {doc.summary ? doc.summary.substring(0, 70) + '…' : (doc.medicines ? `${doc.medicines.length} medications identified` : 'Analyzed medical file')}
                    </div>
                  </div>
                </div>

                {/* Type Badge */}
                <div>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: doc.document_type === 'prescription' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                    color: doc.document_type === 'prescription' ? '#06b6d4' : '#6366f1'
                  }}>
                    {doc.document_type === 'prescription' ? 'Rx Note' : 'Lab Report'}
                  </span>
                </div>

                {/* Date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.82rem', whiteSpace: 'nowrap', fontWeight: 500 }}>
                  <Calendar size={14} />
                  {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>

                {/* Delete */}
                <button
                  className="btn-danger"
                  title="Delete from Database"
                  onClick={(e) => handleDeleteDoc(doc.id, e)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}

          {/* Expanded Document Details Modal/Panel */}
          {selectedDoc && (
            <div style={{ padding: '24px', borderTop: '2px solid var(--border)', background: 'var(--md-sys-color-surface-container-highest)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{selectedDoc.title}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--md-sys-color-on-surface-variant)' }}>ID: {selectedDoc.id}</span>
              </div>

              {selectedDoc.summary && (
                <div style={{ padding: '12px 16px', background: 'var(--md-sys-color-surface-container)', borderRadius: '12px', marginBottom: '16px', fontSize: '0.88rem', lineHeight: 1.5 }}>
                  <strong>Summary:</strong> {selectedDoc.summary}
                </div>
              )}

              {selectedDoc.medicines && selectedDoc.medicines.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Prescribed Medications ({selectedDoc.medicines.length})</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                    {selectedDoc.medicines.map((m, i) => (
                      <div key={i} style={{ padding: '10px 14px', background: 'var(--md-sys-color-surface-container-low)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--md-sys-color-primary)' }}>{m.medicationName || m.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2px' }}>{m.prescribedDosage || m.dosageInstructions}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDoc.biomarkers && selectedDoc.biomarkers.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Lab Biomarkers & Test Results</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                    {selectedDoc.biomarkers.map((b, i) => (
                      <div key={i} style={{ padding: '8px 12px', background: 'var(--md-sys-color-surface-container-low)', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.82rem' }}>
                        <strong>{b.testName}:</strong> {b.observedValue} {b.unit} ({b.status || 'Normal'})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AI CONVERSATION SESSIONS */}
      {activeTab === 'chats' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '16px', padding: '14px 24px', borderBottom: '1px solid var(--border)', background: 'var(--md-sys-color-surface-container-high)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--md-sys-color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Session & Last Exchange</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--md-sys-color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Type</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--md-sys-color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Last Active</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--md-sys-color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Action</span>
          </div>

          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.9rem' }}>Loading conversation history…</div>
          ) : filteredChats.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <MessageSquare size={36} color="var(--md-sys-color-on-surface-variant)" style={{ margin: '0 auto 14px', display: 'block' }} />
              <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.92rem', fontWeight: 500 }}>
                {query ? `No conversations match "${query}"` : 'No chat conversations recorded in database yet. Open Voice Therapist to start.'}
              </p>
            </div>
          ) : (
            filteredChats.map((chat, idx) => (
              <div
                key={chat.session_id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto auto',
                  gap: '16px',
                  alignItems: 'center',
                  padding: '16px 24px',
                  borderBottom: idx < filteredChats.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'all var(--md-motion-duration) var(--md-motion-easing)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', overflow: 'hidden' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(236, 72, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Sparkles size={18} color="#ec4899" />
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {chat.session_id}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--md-sys-color-on-surface-variant)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <strong>{chat.last_role === 'assistant' ? 'Dr. Ananya: ' : 'You: '}</strong>
                      {chat.last_message}
                    </div>
                  </div>
                </div>

                {/* Badge */}
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', padding: '3px 8px', borderRadius: '6px', background: 'rgba(236, 72, 153, 0.2)', color: '#ec4899' }}>
                    {chat.chat_type || 'Voice AI'}
                  </span>
                </div>

                {/* Date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.82rem', whiteSpace: 'nowrap', fontWeight: 500 }}>
                  <Calendar size={14} />
                  {new Date(chat.last_message_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>

                {/* Clear */}
                <button
                  className="btn-danger"
                  title="Delete Chat Log"
                  onClick={(e) => handleClearChat(chat.session_id, e)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
