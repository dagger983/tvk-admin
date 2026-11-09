// d:\Project\TVK Admin\src\components\Sidebar.tsx
import React from 'react';
import {
  LayoutDashboard,
  FileText,
  UserCheck,
  MapPin,
  Users,
  Layers,
  BarChart3,
  ShieldAlert,
  Settings,
  Bell,
  LogOut,
  Building2,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'complaints'
  | 'queue'
  | 'wards'
  | 'representatives'
  | 'categories'
  | 'analytics';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  unassignedCount: number;
  urgentCount: number;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  unassignedCount,
  onLogout,
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'complaints' as NavTab, label: 'All Complaints', icon: FileText },
    {
      id: 'queue' as NavTab,
      label: 'Assignment Queue',
      icon: UserCheck,
      badge: unassignedCount > 0 ? unassignedCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    { id: 'wards' as NavTab, label: 'Ward Management', icon: MapPin },
    { id: 'representatives' as NavTab, label: 'Ward Representatives', icon: Users },
    { id: 'categories' as NavTab, label: 'Categories', icon: Layers },
    { id: 'analytics' as NavTab, label: 'Analytics & Reports', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col flex-shrink-0 h-screen sticky top-0 border-r border-slate-800 shadow-xl select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center space-x-3 bg-slate-950/40">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-red-600 to-yellow-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/30">
          TVK
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
            MANAVAI TVK
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
              HQ
            </span>
          </h1>
          <p className="text-xs text-slate-400">Grievance & Ward Command</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Operations
        </div>
        {navItems.slice(0, 3).map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${item.badgeColor || 'bg-slate-700 text-slate-200'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="px-3 pt-5 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Administration
        </div>
        {navItems.slice(3).map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Admin User Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center text-xs shadow-inner">
              SA
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Central Admin Desk</p>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Online · Trichy Central
              </p>
            </div>
          </div>
          <button
            title="Admin Sign Out"
            onClick={onLogout || (() => alert('Logged out of Admin Session.'))}
            className="text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

