import { NavLink } from 'react-router-dom';

const links = [
  { to: '/',          label: 'Dashboard',  icon: '⬡' },
  { to: '/operators', label: 'Operators',  icon: '🏪' },
  { to: '/strains',   label: 'Strains',    icon: '🌿' },
  { to: '/queue',     label: 'Queue',      icon: '📥' },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 bg-surface border-r border-border h-full">
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-teal font-bold text-lg">StashPass</span>
          <span className="badge bg-teal/20 text-teal text-[10px]">Admin</span>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-teal/10 text-teal font-medium'
                  : 'text-muted hover:text-text hover:bg-border/40'
              }`
            }
          >
            <span className="text-base leading-none">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={() => {
            localStorage.removeItem('sp_admin_secret');
            window.location.reload();
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted hover:text-red-400 transition-colors w-full"
        >
          <span>🔒</span> Lock
        </button>
      </div>
    </aside>
  );
}
