import React from 'react';
import { 
  Home, 
  Bot, 
  Camera, 
  Utensils, 
  FileText, 
  Pill, 
  Calendar, 
  MapPin, 
  QrCode, 
  Settings,
  HeartPulse,
  LogOut
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useHealth } from '../context/HealthContext';

interface SidebarItem {
  path: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  highlight?: boolean;
}

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate }) => {
  const { logout } = useHealth();
  const menuItems: SidebarItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/assistant', label: 'AI Voice Assistant', icon: Bot, badge: 'AI' },
    { path: '/food', label: 'Food & Nutrition Scan', icon: Utensils },
    { path: '/scan', label: 'Health & Injury Scan', icon: Camera },
    { path: '/doctors', label: 'Find Doctors', icon: MapPin },
    { path: '/appointments', label: 'Appointments', icon: Calendar },
    { path: '/medicines', label: 'Medications', icon: Pill },
    { path: '/reports', label: 'Health Records', icon: FileText },
    { path: '/history', label: 'Vitals & Tracking', icon: HeartPulse },
    { path: '/qr-passport', label: 'QR Health Passport', icon: QrCode },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border border-slate-200/80 rounded-2xl flex-shrink-0 hidden md:flex flex-col justify-between p-4 shadow-sm min-h-[calc(100vh-80px)]">
      <div>
        {/* Brand Header matching Reference Image */}
        <div 
          onClick={() => onNavigate('/')} 
          className="flex items-center space-x-3 px-2 py-3 mb-6 cursor-pointer hover:opacity-90 transition-opacity"
          title="Return to Home"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-base text-slate-900 tracking-tight leading-tight">
              HealthCopilot
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Your Personal Health Assistant</p>
          </div>
        </div>

        {/* Navigation List */}
        <div className="space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPath === item.path || ((currentPath === '' || currentPath === '/') && item.path === '/dashboard');
            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-blue-600 text-white uppercase">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Card & Log Out */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => {
            logout();
            onNavigate('/');
          }}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl border border-rose-200/80 bg-rose-50/60 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer shadow-xs"
          title="Log out and return to Home"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out to Home</span>
        </button>

        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
          <p className="text-xs font-bold text-slate-800">Smarter Care</p>
          <p className="text-[10px] text-slate-500">for a Healthier You</p>
        </div>
      </div>
    </aside>
  );
};
