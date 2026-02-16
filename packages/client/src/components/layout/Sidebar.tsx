import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div className="backdrop" onClick={onClose} aria-hidden="true" />
      )}

      <aside className={`sidebar glass ${isOpen ? 'open' : ''}`}>
        <nav className="nav-links">
          <NavLink
            to="/calc"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
            <span>Calculator</span>
          </NavLink>

          <NavLink
            to="/history"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>History</span>
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
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
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div className="user-profile">
              <div className="user-avatar">{user.name?.charAt(0) || 'U'}</div>
              <div className="user-details">
                <div className="user-name">{user.name}</div>
                <div className="user-email">{user.email}</div>
              </div>
            </div>
          )}

          <Button
            variant="secondary"
            onClick={handleLogout}
            className="logout-btn"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Logout</span>
          </Button>
        </div>

        <style jsx>{`
          .backdrop {
            display: none;
          }

          .sidebar {
            grid-area: sidebar;
            display: flex;
            flex-direction: column;
            padding: 1.5rem;
            border-right: 1px solid rgba(255, 255, 255, 0.1);
            overflow-y: auto;
          }

          .nav-links {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            flex: 1;
          }

          .nav-link {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 1rem;
            border-radius: 0.5rem;
            color: inherit;
            text-decoration: none;
            transition: all 0.2s;
          }

          .nav-link:hover {
            background: rgba(255, 255, 255, 0.1);
          }

          .nav-link.active {
            background: rgba(255, 255, 255, 0.15);
            font-weight: 600;
          }

          .sidebar-footer {
            margin-top: auto;
            padding-top: 1.5rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
          }

          .user-profile {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1rem;
          }

          .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 1.25rem;
          }

          .user-details {
            flex: 1;
            min-width: 0;
          }

          .user-name {
            font-weight: 600;
            font-size: 0.875rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .user-email {
            font-size: 0.75rem;
            opacity: 0.7;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .logout-btn {
            width: 100%;
            justify-content: center;
            gap: 0.5rem;
          }

          @media (max-width: 1023px) {
            .backdrop {
              display: block;
              position: fixed;
              inset: 0;
              background: rgba(0, 0, 0, 0.5);
              z-index: 200;
            }

            .sidebar {
              position: fixed;
              top: 64px;
              left: 0;
              bottom: 0;
              width: 250px;
              transform: translateX(-100%);
              transition: transform 0.3s ease-in-out;
              z-index: 300;
            }

            .sidebar.open {
              transform: translateX(0);
            }
          }
        `}</style>
      </aside>
    </>
  );
};
