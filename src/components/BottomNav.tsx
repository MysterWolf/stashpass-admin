import { NavLink } from 'react-router-dom';

const links = [
  { to: '/',          label: 'Dashboard', icon: '⬡' },
  { to: '/operators', label: 'Operators', icon: '🏪' },
  { to: '/strains',   label: 'Strains',   icon: '🌿' },
  { to: '/queue',     label: 'Queue',     icon: '📥' },
];

export default function BottomNav() {
  return (
    <nav className="md:hidden flex border-t border-border bg-surface">
      {links.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-0.5 py-3 text-[10px] transition-colors ${
              isActive ? 'text-teal' : 'text-muted'
            }`
          }
        >
          <span className="text-lg leading-none">{icon}</span>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
