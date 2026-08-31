import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { EmergencyBanner } from './EmergencyBanner';
import { CookieConsentBanner } from './CookieConsentBanner';
import { reminderScheduler } from '../services/reminderScheduler';
import { FullScreenReminderModal } from './cognitive/FullScreenReminderModal';
import { FloatingVoiceAgentButton } from './voice/FloatingVoiceAgentButton';
import { VoiceCommandBar } from './voice/VoiceCommandBar';

export const AppLayout = ({ children }) => {
  const [activeAlertReminder, setActiveAlertReminder] = useState(null);

  useEffect(() => {
    reminderScheduler.start();
    const unsub = reminderScheduler.subscribe((reminder) => {
      setActiveAlertReminder(reminder);
    });
    return () => unsub();
  }, []);

  return (
    <div className="app-shell">
      {activeAlertReminder && (
        <FullScreenReminderModal
          reminder={activeAlertReminder}
          onClose={() => setActiveAlertReminder(null)}
        />
      )}
      <Sidebar />
      <main className="page-content" style={{ display: 'flex', flexDirection: 'column' }}>
        <EmergencyBanner />
        <div style={{ flex: 1 }}>
          {children}
        </div>
        <CookieConsentBanner />
      </main>
      <VoiceCommandBar />
      <FloatingVoiceAgentButton />
    </div>
  );
};
