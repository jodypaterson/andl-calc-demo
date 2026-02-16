import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user } = useAuthStore();

  return (
    <header className="header glass">
      <div className="header-left">
        <h1 className="app-title">ANDL Calculator</h1>
      </div>

      <button
        className="hamburger lg:hidden"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div className="header-right">
        {user && (
          <div className="user-info">
            <span className="user-avatar">{user.name?.charAt(0) || 'U'}</span>
            <span className="user-name">{user.name}</span>
          </div>
        )}
        <button className="settings-btn" aria-label="Settings">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6m0 6v6m-9-9h6m6 0h6" />
          </svg>
        </button>
      </div>

      <style jsx>{`
        .header {
          grid-area: header;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-left {
          display: flex;
          align-items: center;
        }

        .app-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
        }

        .hamburger {
          display: none;
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          padding: 0.5rem;
        }

        @media (max-width: 1023px) {
          .hamburger {
            display: block;
            position: absolute;
            left: 1rem;
          }

          .app-title {
            margin-left: 3rem;
          }
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        .user-name {
          display: none;
        }

        @media (min-width: 640px) {
          .user-name {
            display: inline;
          }
        }

        .settings-btn {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          padding: 0.5rem;
          display: flex;
          align-items: center;
        }
      `}</style>
    </header>
  );
};
