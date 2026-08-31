import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Droplet,
  Pill,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Wifi,
  WifiOff,
  ShieldCheck,
  Calendar,
  Sparkles
} from 'lucide-react';
import { syncManager } from '../services/syncManager';
import { useLanguage } from '../context/LanguageContext';

export const CaregiverDashboard = () => {
  const { t, lang } = useLanguage();
  const [timeframe, setTimeframe] = useState(7); // 7 or 30 days
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(syncManager.isOnline);
  const [analyticsData, setAnalyticsData] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await syncManager.getCaregiverAnalytics(timeframe);
      setAnalyticsData(data);
    } catch (err) {
      console.error('Error loading caregiver analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const unsub = syncManager.subscribe(status => {
      setIsOnline(status.isOnline);
      setSyncing(status.isSyncing);
    });

    return () => unsub();
  }, [timeframe]);

  const handleManualSync = async () => {
    setSyncing(true);
    await syncManager.triggerBatchSync();
    await loadData();
    setSyncing(false);
  };

  const trajectory = analyticsData?.trajectory || [];
  const anomaly = analyticsData?.anomaly;
  const summary = analyticsData?.summary;

  // Calculate high-level summary metrics
  const validDays = trajectory.filter(t => t.avgAccuracyPercent !== null);
  const avgAccuracy = validDays.length > 0
    ? Math.round(validDays.reduce((acc, cur) => acc + cur.avgAccuracyPercent, 0) / validDays.length)
    : '--';

  const avgHesitation = validDays.length > 0
    ? Math.round(validDays.reduce((acc, cur) => acc + cur.avgHesitationMs, 0) / validDays.length)
    : '--';

  const totalHydrations = trajectory.reduce((acc, cur) => acc + (cur.hydrationCount || 0), 0);
  const totalMeds = trajectory.reduce((acc, cur) => acc + (cur.medicationCount || 0), 0);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Top Header & Sync Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          backgroundColor: '#FFFFFF',
          padding: '20px 24px',
          borderRadius: '24px',
          border: '2px solid #E7E0EC',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          marginBottom: '24px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={26} color="#6750A4" />
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#1C1B1F' }}>
              {t('caregiverHeader')}
            </h1>
          </div>
          <p style={{ margin: '4px 0 0', color: '#49454F', fontSize: '0.95rem' }}>
            {t('caregiverSubtitle')}
          </p>
        </div>

        {/* Controls: Timeframe, Online status, Sync button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', backgroundColor: '#F3EDF7', borderRadius: '16px', padding: '4px' }}>
            <button
              onClick={() => setTimeframe(7)}
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: timeframe === 7 ? '#6750A4' : 'transparent',
                color: timeframe === 7 ? '#FFFFFF' : '#49454F',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              {t('trailing7Days')}
            </button>
            <button
              onClick={() => setTimeframe(30)}
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: timeframe === 30 ? '#6750A4' : 'transparent',
                color: timeframe === 30 ? '#FFFFFF' : '#49454F',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              {t('trailing30Days')}
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '16px',
              backgroundColor: isOnline ? '#D1E7DD' : '#F8D7DA',
              color: isOnline ? '#0F5132' : '#842029',
              fontSize: '0.85rem',
              fontWeight: 700
            }}
          >
            {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span>{isOnline ? t('onlineMode') : t('offlineStore')}</span>
          </div>

          <button
            onClick={handleManualSync}
            disabled={syncing || !isOnline}
            style={{
              padding: '10px 18px',
              borderRadius: '16px',
              border: '2px solid #6750A4',
              backgroundColor: '#FFFFFF',
              color: '#6750A4',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: isOnline ? 'pointer' : 'not-allowed',
              opacity: isOnline ? 1 : 0.6
            }}
          >
            <RefreshCw size={18} className={syncing ? 'spin' : ''} />
            <span>{syncing ? t('syncingStatus') : t('manualSync')}</span>
          </button>
        </div>
      </div>

      {/* Anomaly Detection Banner (Medical Alert if drop >30% over 3-day window) */}
      {anomaly?.detected && (
        <div
          role="alert"
          style={{
            backgroundColor: '#FEF2F2',
            border: '3px solid #DC2626',
            borderRadius: '24px',
            padding: '20px 24px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            boxShadow: '0 8px 24px rgba(220, 38, 38, 0.15)'
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '24px',
              backgroundColor: '#FEE2E2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <AlertTriangle size={28} color="#DC2626" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#991B1B', margin: 0 }}>
                Clinical Anomaly Detected: {anomaly.details.dropPercent}% Acute Performance Drop
              </h3>
              <span
                style={{
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  padding: '2px 10px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 800
                }}
              >
                {anomaly.details.severity} ALERT
              </span>
            </div>
            <p style={{ margin: '6px 0 10px', fontSize: '0.95rem', color: '#7F1D1D', lineHeight: 1.5 }}>
              The patient's 3-day trailing average accuracy has dropped to {anomaly.details.recent3DayAccuracy}%, 
              compared to their baseline accuracy of {anomaly.details.baselineAccuracy}%.
            </p>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                padding: '10px 16px',
                borderRadius: '12px',
                border: '1px solid #FECACA',
                fontSize: '0.9rem',
                color: '#991B1B',
                fontWeight: 600
              }}
            >
              <strong>Clinical Advisory:</strong> {anomaly.details.clinicalNote}
            </div>
          </div>
        </div>
      )}

      {/* Key Metric Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}
      >
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '20px',
            borderRadius: '20px',
            border: '2px solid #E7E0EC',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#49454F' }}>
              {t('avgAccuracy')}
            </span>
            <div style={{ padding: '8px', borderRadius: '12px', backgroundColor: '#D1E7DD' }}>
              <TrendingUp size={20} color="#1E7E34" />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1C1B1F', marginTop: '8px' }}>
            {avgAccuracy}%
          </div>
          <div style={{ fontSize: '0.85rem', color: '#49454F', marginTop: '4px' }}>
            {validDays.length} active days
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '20px',
            borderRadius: '20px',
            border: '2px solid #E7E0EC',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#49454F' }}>
              {t('hesitationLatency')}
            </span>
            <div style={{ padding: '8px', borderRadius: '12px', backgroundColor: '#EADDFF' }}>
              <Clock size={20} color="#6750A4" />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1C1B1F', marginTop: '8px' }}>
            {avgHesitation} <span style={{ fontSize: '1rem', fontWeight: 600 }}>ms</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#49454F', marginTop: '4px' }}>
            Decision response time
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '20px',
            borderRadius: '20px',
            border: '2px solid #E7E0EC',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#49454F' }}>
              {t('hydrationCompliance')}
            </span>
            <div style={{ padding: '8px', borderRadius: '12px', backgroundColor: '#E0F2FE' }}>
              <Droplet size={20} color="#0284C7" />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1C1B1F', marginTop: '8px' }}>
            {totalHydrations}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#49454F', marginTop: '4px' }}>
            Confirmed hydration checks
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '20px',
            borderRadius: '20px',
            border: '2px solid #E7E0EC',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#49454F' }}>
              {t('medicationCompliance')}
            </span>
            <div style={{ padding: '8px', borderRadius: '12px', backgroundColor: '#FEF3C7' }}>
              <Pill size={20} color="#B45309" />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1C1B1F', marginTop: '8px' }}>
            {totalMeds}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#49454F', marginTop: '4px' }}>
            Confirmed on-time administrations
          </div>
        </div>
      </div>

      {/* Trajectory Timeline: Hesitation vs Accuracy Chart Table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '2px solid #E7E0EC',
          padding: '24px',
          marginBottom: '28px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1C1B1F', margin: 0 }}>
              Cognitive Trajectory Trendline ({timeframe} Days)
            </h2>
            <p style={{ margin: '4px 0 0', color: '#49454F', fontSize: '0.9rem' }}>
              Comparison of task accuracy vs. cognitive hesitation latency over time.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', fontWeight: 700 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#1E7E34' }}></span>
              Accuracy (%)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#6750A4' }}></span>
              Hesitation (ms)
            </span>
          </div>
        </div>

        {/* Visual Bar / Trajectory Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {trajectory.map((day) => {
            const hasData = day.sessionCount > 0;
            return (
              <div
                key={day.date}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  backgroundColor: hasData ? '#F3EDF7' : '#FAFAFA',
                  gap: '16px'
                }}
              >
                <div style={{ width: '100px', fontWeight: 700, fontSize: '0.9rem', color: '#1C1B1F' }}>
                  {day.date.split('-').slice(1).join('/')}
                </div>

                {hasData ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {/* Accuracy bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ width: '80px', fontSize: '0.8rem', color: '#1E7E34', fontWeight: 700 }}>
                        Acc: {day.avgAccuracyPercent}%
                      </span>
                      <div style={{ flex: 1, height: '10px', backgroundColor: '#E7E0EC', borderRadius: '5px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${day.avgAccuracyPercent}%`,
                            backgroundColor: '#1E7E34',
                            borderRadius: '5px'
                          }}
                        />
                      </div>
                    </div>

                    {/* Hesitation bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ width: '80px', fontSize: '0.8rem', color: '#6750A4', fontWeight: 700 }}>
                        Hes: {day.avgHesitationMs}ms
                      </span>
                      <div style={{ flex: 1, height: '10px', backgroundColor: '#E7E0EC', borderRadius: '5px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min(100, (day.avgHesitationMs / 5000) * 100)}%`,
                            backgroundColor: '#6750A4',
                            borderRadius: '5px'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ flex: 1, color: '#79747E', fontSize: '0.85rem', fontStyle: 'italic' }}>
                    No sessions logged on this date
                  </div>
                )}

                {/* Daily check-offs */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.85rem',
                      color: day.hydrationCount > 0 ? '#0284C7' : '#79747E',
                      fontWeight: 700
                    }}
                  >
                    <Droplet size={14} /> {day.hydrationCount}
                  </span>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.85rem',
                      color: day.medicationCount > 0 ? '#B45309' : '#79747E',
                      fontWeight: 700
                    }}
                  >
                    <Pill size={14} /> {day.medicationCount}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
