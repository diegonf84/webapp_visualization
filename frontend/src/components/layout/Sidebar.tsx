import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Building2,
  GitCompare,
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const navItems: NavItem[] = [
  {
    to: '/',
    label: 'Mercado',
    icon: <BarChart3 className="h-5 w-5" />,
    description: 'Vision General',
  },
  {
    to: '/compania',
    label: 'Companias',
    icon: <Building2 className="h-5 w-5" />,
    description: 'Perfil de Compania',
  },
  {
    to: '/comparar',
    label: 'Comparaciones',
    icon: <GitCompare className="h-5 w-5" />,
    description: 'Comparar Companias',
  },
];

export function Sidebar() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'bg-slate-900 text-white flex flex-col transition-all duration-300 ease-in-out',
        isHovered ? 'w-56' : 'w-16'
      )}
    >
      {/* Logo/Brand */}
      <div className="h-16 flex items-center px-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex-shrink-0">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <span
            className={cn(
              'font-semibold text-sm whitespace-nowrap transition-opacity duration-300',
              isHovered ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
            )}
          >
            SSN Dashboard
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                    'hover:bg-slate-800',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  )
                }
                title={!isHovered ? item.label : undefined}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <div
                  className={cn(
                    'flex flex-col transition-opacity duration-300',
                    isHovered ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
                  )}
                >
                  <span className="text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {item.description}
                  </span>
                </div>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div
        className={cn(
          'p-4 border-t border-slate-700 transition-opacity duration-300',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}
      >
        <p className="text-xs text-slate-500 text-center whitespace-nowrap">
          SSN Argentina
        </p>
      </div>
    </aside>
  );
}
