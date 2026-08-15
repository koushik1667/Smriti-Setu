import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import {
  Pill, Search, Package, Plus, ChevronRight, Trash2,
  Activity, ShieldAlert, Sparkles, Filter, CheckCircle, RefreshCw, Volume2, FileDown,
  Sun, Moon, Sunrise, Clock, Bell, BellRing, Calendar
} from 'lucide-react';
import {
  DISEASE_CATEGORIES,
  classifyMedication,
  groupMedicationsByDisease
} from '../utils/diseaseClassifier';
import { speakText } from '../utils/speechUtils';
import { generateCabinetSummaryPDF } from '../utils/clinicalPdfExporter';

export const Cabinet = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('shelves'); // 'shelves' or 'schedule'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [speakingId, setSpeakingId] = useState(null);
  const [notificationStatus, setNotificationStatus] = useState('');

  const fetchCabinet = (forceRefresh = false) => {
    setLoading(true);
    api.getHistory(forceRefresh)
      .then(res => {
        const items = Array.isArray(res) ? res : (res?.history || res?.data || []);
        setHistory(items);
      })
      .catch(err => {
        console.warn('[Cabinet] Failed to fetch history:', err);
        setHistory([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCabinet(true);
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await api.deleteHistoryItem(id);
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch {}
  };

  const handleSpeak = (med, e) => {
    e.stopPropagation();
    setSpeakingId(med.id);
    const textToRead = `${med.medicationName}. ${med.primaryUse || ''}. ${med.dosageInstructions || ''}`;
    speakText(textToRead, lang, () => setSpeakingId(null));
  };

  // Group all medications automatically by disease category with active language
  const { allGroups, populatedGroups, totalMedications } = groupMedicationsByDisease(history, lang);

  // Filter based on selected category pill and search query
  const filteredHistory = history.filter(item => {
    const matchesSearch =
      item.medicationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.primaryUse?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.activeIngredients || []).some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedCategory === 'all') return true;
    const cat = classifyMedication(item);
    return cat.id === selectedCategory;
  });

  // Regroup filtered items by disease for shelf view
  const { populatedGroups: displayShelves } = groupMedicationsByDisease(filteredHistory, lang);

  // Daily Schedule Extraction
  const morningMeds = history.filter(item => {
    const text = `${item.dosageInstructions || ''} ${item.rawAnalysis || ''}`.toLowerCase();
    return text.includes('morning') || text.includes('1-0-1') || text.includes('1-0-0') || text.includes('1-1-1') || text.includes('breakfast') || text.includes(' od') || text.includes('daily');
  });

  const afternoonMeds = history.filter(item => {
    const text = `${item.dosageInstructions || ''} ${item.rawAnalysis || ''}`.toLowerCase();
    return text.includes('afternoon') || text.includes('lunch') || text.includes('1-1-1') || text.includes('0-1-0') || text.includes('tds') || text.includes('qid');
  });

  const nightMeds = history.filter(item => {
    const text = `${item.dosageInstructions || ''} ${item.rawAnalysis || ''}`.toLowerCase();
    return text.includes('night') || text.includes('bedtime') || text.includes('dinner') || text.includes('1-0-1') || text.includes('0-0-1') || text.includes('1-1-1') || text.includes(' bd') || text.includes('hs');
  });

  const handleEnableReminders = async () => {
    if (!('Notification' in window)) {
      setNotificationStatus('Browser notifications are not supported on this device.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('PharmaVision AI Pill Reminder Active', {
          body: `You have ${history.length} active medications scheduled in your daily tracker.`,
          icon: '/favicon.ico'
        });
        setNotificationStatus('🎉 Daily dosage reminders enabled! You will receive timely alerts.');
      } else {
        setNotificationStatus('Notification permission was declined in browser settings.');
      }
    } catch (err) {
      setNotificationStatus('Unable to request notification permission.');
    }
  };

  return (
    <div className="page-inner fade-in">
      {/* Header Banner */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">{t('cabinetHeader')}</h1>
          <p className="page-subtitle">{t('cabinetSubtitle')}</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn-secondary"
            onClick={() => generateCabinetSummaryPDF(history)}
            style={{ gap: '6px' }}
            title="Download or Print printable medication list"
          >
            <FileDown size={16} /> Export PDF
          </button>
          <button className="btn-secondary" onClick={() => fetchCabinet(true)} style={{ gap: '6px' }}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="btn-primary" onClick={() => navigate('/scanner')} style={{ gap: '6px' }}>
            <Plus size={16} /> {t('scanNewMedicine')}
          </button>
        </div>
      </div>

      {/* Main View Mode Selector Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        <button
          onClick={() => setViewMode('shelves')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: 'var(--r-full)',
            border: viewMode === 'shelves' ? '1px solid var(--md-sys-color-primary)' : '1px solid var(--border)',
            background: viewMode === 'shelves' ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-surface)',
            color: viewMode === 'shelves' ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface)',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Package size={16} /> 🗄️ Cabinet Shelves ({totalMedications})
        </button>

        <button
          onClick={() => setViewMode('schedule')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: 'var(--r-full)',
            border: viewMode === 'schedule' ? '1px solid var(--md-sys-color-primary)' : '1px solid var(--border)',
            background: viewMode === 'schedule' ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-surface)',
            color: viewMode === 'schedule' ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface)',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Clock size={16} /> ⏰ Daily Pill Schedule
        </button>
      </div>

      {viewMode === 'schedule' ? (
        /* DAILY PILL SCHEDULE & DOSE REMINDERS VIEW */
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Notification Banner */}
          <div className="card" style={{ padding: '20px 24px', background: 'var(--md-sys-color-primary-container)', border: '1px solid var(--md-sys-color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ padding: '10px', borderRadius: '50%', background: 'var(--md-sys-color-surface)', color: 'var(--md-sys-color-primary)' }}>
                <BellRing size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--md-sys-color-on-primary-container)', margin: 0 }}>
                  Daily Pill Schedule & Dose Reminders
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--md-sys-color-on-primary-container)', margin: '4px 0 0 0', opacity: 0.9 }}>
                  Automatic time-based routine mapping based on your doctor's prescriptions and label timings.
                </p>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={handleEnableReminders}
              style={{ background: 'var(--md-sys-color-primary)', color: 'var(--md-sys-color-on-primary)', gap: '8px' }}
            >
              <Bell size={16} /> Enable Dose Alarms
            </button>
          </div>

          {notificationStatus && (
            <div style={{ padding: '12px 18px', borderRadius: 'var(--r-md)', background: 'var(--md-sys-color-surface-container-low)', border: '1px solid var(--border)', fontSize: '0.9rem', color: 'var(--md-sys-color-on-surface)' }}>
              {notificationStatus}
            </div>
          )}

          {/* Schedule 3-Column Routine Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {/* Morning Dose */}
            <div className="card" style={{ padding: '20px', borderTop: '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sunrise size={22} color="#f59e0b" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
                    Morning Routine
                  </h3>
                </div>
                <span className="badge badge-amber">8:00 AM (Breakfast)</span>
              </div>

              {morningMeds.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No morning medications scheduled.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {morningMeds.map(med => (
                    <div key={med.id} onClick={() => navigate(`/scan/${med.id}`)} style={{ padding: '12px', background: 'var(--md-sys-color-surface-container-low)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--md-sys-color-on-surface)' }}>{med.medicationName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{med.dosageInstructions || 'Take 1 dose after breakfast'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Afternoon Dose */}
            <div className="card" style={{ padding: '20px', borderTop: '4px solid #3b82f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sun size={22} color="#3b82f6" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
                    Afternoon Routine
                  </h3>
                </div>
                <span className="badge badge-cyan">1:00 PM (Lunch)</span>
              </div>

              {afternoonMeds.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No afternoon medications scheduled.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {afternoonMeds.map(med => (
                    <div key={med.id} onClick={() => navigate(`/scan/${med.id}`)} style={{ padding: '12px', background: 'var(--md-sys-color-surface-container-low)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--md-sys-color-on-surface)' }}>{med.medicationName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{med.dosageInstructions || 'Take 1 dose after lunch'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Night Dose */}
            <div className="card" style={{ padding: '20px', borderTop: '4px solid #8b5cf6' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Moon size={22} color="#8b5cf6" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
                    Night Routine
                  </h3>
                </div>
                <span className="badge badge-purple">9:00 PM (Dinner / Bedtime)</span>
              </div>

              {nightMeds.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No night medications scheduled.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {nightMeds.map(med => (
                    <div key={med.id} onClick={() => navigate(`/scan/${med.id}`)} style={{ padding: '12px', background: 'var(--md-sys-color-surface-container-low)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--md-sys-color-on-surface)' }}>{med.medicationName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{med.dosageInstructions || 'Take 1 dose after dinner'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* SHELVES CATEGORY VIEW */
        <>
          {/* Summary Stats Row */}
          <div className="stat-grid" style={{ marginBottom: '24px' }}>
            <div className="stat-card">
              <div className="stat-label">{t('totalCabinetMeds')}</div>
              <div className="stat-value">{loading ? '…' : totalMedications}</div>
              <div className="stat-sub">{t('myCabinetDesc')}</div>
            </div>

            <div className="stat-card" style={{ background: 'var(--md-sys-color-secondary-container)' }}>
              <div className="stat-label" style={{ color: 'var(--md-sys-color-on-secondary-container)' }}>{t('activeDiseaseCats')}</div>
              <div className="stat-value" style={{ color: 'var(--md-sys-color-on-secondary-container)' }}>
                {loading ? '…' : populatedGroups.length}
              </div>
              <div className="stat-sub" style={{ color: 'var(--md-sys-color-on-secondary-container)' }}>
                {t('allDiseases')}
              </div>
            </div>

            <div className="stat-card" style={{ background: 'var(--md-sys-color-tertiary-container)' }}>
              <div className="stat-label" style={{ color: 'var(--md-sys-color-on-tertiary-container)' }}>{t('orgStatus')}</div>
              <div className="stat-value" style={{ fontSize: '1.3rem', color: 'var(--md-sys-color-on-tertiary-container)', marginTop: '4px' }}>
                {t('allSorted')}
              </div>
              <div className="stat-sub" style={{ color: 'var(--md-sys-color-on-tertiary-container)' }}>
                {t('aiTaxonomy')}
              </div>
            </div>
          </div>

          {/* Search and Disease Filter Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={18} color="var(--md-sys-color-on-surface-variant)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                className="search-input"
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Disease Filter Pills with Localized Names */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
              <button
                onClick={() => setSelectedCategory('all')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: 'var(--r-full)',
                  border: selectedCategory === 'all' ? '1px solid var(--md-sys-color-primary)' : '1px solid var(--border)',
                  background: selectedCategory === 'all' ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-surface)',
                  color: selectedCategory === 'all' ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
              >
                🏠 {t('allDiseases')} ({totalMedications})
              </button>

              {Object.values(allGroups).map(({ category, items }) => {
                const count = items.length;
                if (count === 0 && selectedCategory !== category.id) return null;

                const isSelected = selectedCategory === category.id;

                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: 'var(--r-full)',
                      border: isSelected ? `2px solid ${category.color}` : '1px solid var(--border)',
                      background: isSelected ? category.bgColor : 'var(--md-sys-color-surface)',
                      color: isSelected ? category.color : 'var(--md-sys-color-on-surface)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>{category.icon}</span>
                    <span>{category.shortName}</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.8, background: 'rgba(0,0,0,0.06)', padding: '2px 6px', borderRadius: 'var(--r-full)' }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

      {/* Disease Shelves View */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--md-sys-color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '14px' }} />
          <p>Organizing your medicines by disease shelves…</p>
        </div>
      ) : displayShelves.length === 0 ? (
        <div className="card" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <Package size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', display: 'block', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', marginBottom: '6px' }}>
            {searchQuery ? `No medications found matching "${searchQuery}"` : t('emptyCabinet')}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 20px' }}>
            {t('emptyCabinetDesc')}
          </p>
          <button className="btn-primary" onClick={() => navigate('/scanner')}>
            <Plus size={16} /> {t('scanFirstMed')}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {displayShelves.map(({ category, items }) => (
            <div key={category.id} className="fade-in">
              {/* Shelf Category Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', paddingBottom: '8px', borderBottom: `2px solid ${category.borderColor || 'var(--border)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.6rem' }}>{category.icon}</span>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
                      {category.name}
                    </h2>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {category.description}
                    </span>
                  </div>
                </div>

                <span style={{ padding: '4px 12px', borderRadius: 'var(--r-full)', background: category.bgColor, color: category.color, fontSize: '0.8rem', fontWeight: 700 }}>
                  {t('medicinesCount', { count: items.length })}
                </span>
              </div>

              {/* Shelf Medicines Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {items.map(med => (
                  <div
                    key={med.id}
                    onClick={() => navigate(`/scan/${med.id}`)}
                    className="card"
                    style={{
                      padding: '20px',
                      borderRadius: 'var(--r-lg)',
                      border: '1px solid var(--border)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                      boxShadow: 'var(--shadow-elevation-1)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-elevation-2)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'var(--shadow-elevation-1)';
                    }}
                  >
                    <div>
                      {/* Top Row: Icon + Name + Audio + Delete */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: 'var(--r-full)', background: category.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Pill size={20} color={category.color} />
                          </div>
                          <div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: 0, lineHeight: 1.3 }}>
                              {med.medicationName}
                            </h3>
                            <span style={{ fontSize: '0.72rem', color: category.color, fontWeight: 700, textTransform: 'uppercase' }}>
                              {category.shortName}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                          {/* Audio Voice Button */}
                          <button
                            className="btn-ghost"
                            title={t('listenAudio')}
                            onClick={(e) => handleSpeak(med, e)}
                            style={{
                              width: '36px',
                              height: '36px',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 'var(--r-full)',
                              background: speakingId === med.id ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-surface-container)',
                              color: speakingId === med.id ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface-variant)',
                              border: '1px solid var(--border)'
                            }}
                          >
                            <Volume2 size={16} />
                          </button>
                          {/* Delete Button */}
                          <button
                            className="btn-danger"
                            title="Remove"
                            onClick={(e) => handleDelete(med.id, e)}
                            style={{
                              width: '36px',
                              height: '36px',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 'var(--r-full)'
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Primary Use */}
                      {med.primaryUse && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.5, margin: '0 0 10px 0' }}>
                          {med.primaryUse.substring(0, 110)}{med.primaryUse.length > 110 ? '…' : ''}
                        </p>
                      )}

                      {/* Dosage Routine */}
                      {med.dosageInstructions && (
                        <div style={{ fontSize: '0.8rem', padding: '6px 10px', background: 'var(--md-sys-color-surface-container-low)', borderRadius: 'var(--r-sm)', color: 'var(--md-sys-color-on-surface)', marginBottom: '10px' }}>
                          <strong>{t('dosageInstructions')}:</strong> {med.dosageInstructions}
                        </div>
                      )}

                      {/* Active Ingredients Tags */}
                      {med.activeIngredients && med.activeIngredients.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                          {med.activeIngredients.slice(0, 2).map((ing, iIdx) => (
                            <span key={iIdx} className="badge badge-cyan" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                              ⚗ {ing}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Link Row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <span>
                        {t('addedOn', {
                          date: new Date(med.createdAt).toLocaleDateString(lang === 'hi' ? 'hi-IN' : lang === 'te' ? 'te-IN' : 'en-US', { month: 'short', day: 'numeric' })
                        })}
                      </span>
                      <span style={{ color: 'var(--md-sys-color-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                        {t('viewDetails')} <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
        </>
      )}
    </div>
  );
};
