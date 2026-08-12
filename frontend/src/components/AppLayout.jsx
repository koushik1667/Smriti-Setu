import React from 'react';
import { Sidebar } from './Sidebar';
import { EmergencyBanner } from './EmergencyBanner';
import { CookieConsentBanner } from './CookieConsentBanner';

export const AppLayout = ({ children }) => (
  <div className="app-shell">
    <Sidebar />
    <main className="page-content" style={{ display: 'flex', flexDirection: 'column' }}>
      <EmergencyBanner />
      <div style={{ flex: 1 }}>
        {children}
      </div>
      <CookieConsentBanner />
    </main>
  </div>
);
