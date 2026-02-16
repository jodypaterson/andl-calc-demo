import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="app-layout">
      <Header onToggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <main className="content">{children}</main>

      <style jsx>{`
        .app-layout {
          display: grid;
          grid-template-columns: 250px 1fr;
          grid-template-rows: 64px 1fr;
          grid-template-areas:
            'header header'
            'sidebar content';
          min-height: 100vh;
        }

        .content {
          grid-area: content;
          padding: 2rem;
          overflow-y: auto;
        }

        @media (max-width: 1023px) {
          .app-layout {
            grid-template-columns: 1fr;
            grid-template-areas:
              'header'
              'content';
          }
        }
      `}</style>
    </div>
  );
};
