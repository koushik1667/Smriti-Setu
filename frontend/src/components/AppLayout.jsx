import React from 'react';
import { Sidebar } from './Sidebar';

export const AppLayout = ({ children }) => (
  <div className="app-shell">
    <Sidebar />
    <main className="page-content">
      {children}
    </main>
  </div>
);
