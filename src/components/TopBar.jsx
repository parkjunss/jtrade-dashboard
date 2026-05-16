import { Bell, ChevronDown, CreditCard, LogOut, Settings, ShieldCheck, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const tabs = [
  { id: 'performance', label: 'Performance' },
  { id: 'holdings', label: 'Holdings' },
  { id: 'allocation', label: 'Allocation' },
  { id: 'research', label: 'Research' },
  { id: 'backtest', label: 'Backtest' },
  { id: 'insights', label: 'Insights' },
  { id: 'reports', label: 'Reports' },
  { id: 'settings', label: 'Settings' },
];

const notifications = [
  { id: 'price-alert', title: 'NVDA crossed $1,020', meta: 'Price alert · 2m ago', tone: 'green' },
  { id: 'report-ready', title: 'Monthly statement ready', meta: 'Reports · 18m ago', tone: 'blue' },
  { id: 'risk-shift', title: 'Portfolio beta moved to 0.87', meta: 'Risk monitor · 1h ago', tone: 'yellow' },
];

export default function TopBar({ activePage = 'performance', onNavigate }) {
  const { isAuthenticated, signIn, signOut, user } = useAuth();
  const [openMenu, setOpenMenu] = useState(null);
  const profileAreaRef = useRef(null);

  useEffect(() => {
    if (!openMenu) return undefined;

    const handlePointerDown = (event) => {
      if (profileAreaRef.current && !profileAreaRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpenMenu(null);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openMenu]);

  const toggleMenu = (menu) => {
    setOpenMenu((current) => (current === menu ? null : menu));
  };

  const handleSignOut = () => {
    setOpenMenu(null);
    signOut();
  };

  return (
    <header className="topbar">
      <div className="brand"><div className="brand-mark">J</div><span>JTrade</span></div>
      <nav className="tabs">
        {tabs.map((tab) => (
          <button
            className={activePage === tab.id ? 'active' : ''}
            key={tab.id}
            onClick={() => onNavigate?.(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="profile-area" ref={profileAreaRef}>
        {isAuthenticated ? (
          <>
            <div className={`topbar-menu-wrap ${openMenu === 'notifications' ? 'open' : ''}`}>
              <button
                aria-expanded={openMenu === 'notifications'}
                aria-haspopup="menu"
                className="bell"
                onClick={() => toggleMenu('notifications')}
                title="Notifications"
                type="button"
              >
                <Bell size={18} />
                <i />
              </button>
              {openMenu === 'notifications' ? (
                <div className="topbar-dropdown notifications-dropdown" role="menu">
                  <div className="dropdown-head">
                    <strong>Notifications</strong>
                    <span>{notifications.length} new</span>
                  </div>
                  {notifications.map((item) => (
                    <button className="notification-item" key={item.id} role="menuitem" type="button">
                      <span className={`notification-dot ${item.tone}`} />
                      <b>{item.title}</b>
                      <small>{item.meta}</small>
                    </button>
                  ))}
                  <button className="dropdown-footer" role="menuitem" type="button">View all notifications</button>
                </div>
              ) : null}
            </div>
            <div className={`topbar-menu-wrap ${openMenu === 'profile' ? 'open' : ''}`}>
              <button
                aria-expanded={openMenu === 'profile'}
                aria-haspopup="menu"
                className="profile"
                onClick={() => toggleMenu('profile')}
                type="button"
              >
                <div className="avatar" />
                <div><b>{user?.name}</b><small>{user?.username}</small></div>
                <ChevronDown size={17} />
              </button>
              {openMenu === 'profile' ? (
                <div className="topbar-dropdown profile-dropdown" role="menu">
                  <div className="profile-summary">
                    <div className="avatar large" />
                    <div><strong>{user?.name}</strong><span>{user?.email}</span></div>
                  </div>
                  <button role="menuitem" type="button"><UserRound size={16} />Account</button>
                  <button role="menuitem" type="button"><ShieldCheck size={16} />Security</button>
                  <button role="menuitem" type="button"><CreditCard size={16} />Billing</button>
                  <button role="menuitem" type="button"><Settings size={16} />Preferences</button>
                  <button className="danger" onClick={handleSignOut} role="menuitem" type="button"><LogOut size={16} />Sign out</button>
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <button className="topbar-signin" onClick={() => signIn({})} type="button">Sign in</button>
        )}
      </div>
    </header>
  );
}
