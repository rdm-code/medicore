import { useState, useMemo } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Users, Calendar, Activity, LogOut, Menu, X,
  Stethoscope, Shield, User as UserIcon, HeartPulse, Plus,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

const roleBadge: Record<Role, { bg: string; text: string; label: string }> = {
  ADMIN: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Admin' },
  DOCTOR: { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Doctor' },
  PATIENT: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Patient' },
};

export default function Layout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = useMemo(() => {
    if (!user) return [];
    switch (user.role) {
      case 'ADMIN':
        return [
          { path: '/admin/dashboard', label: 'Dashboard', icon: Activity },
          { path: '/admin/users', label: 'Users', icon: Users },
          { path: '/admin/doctors', label: 'Doctors', icon: Stethoscope },
          { path: '/admin/patients', label: 'Patients', icon: HeartPulse },
          { path: '/admin/appointments', label: 'Appointments', icon: Calendar },
        ];
      case 'DOCTOR':
        return [
          { path: '/doctor/dashboard', label: 'Dashboard', icon: Activity },
          { path: '/doctor/profile', label: 'My Profile', icon: UserIcon },
          { path: '/doctor/appointments', label: 'Appointments', icon: Calendar },
        ];
      case 'PATIENT':
        return [
          { path: '/patient/dashboard', label: 'Dashboard', icon: Activity },
          { path: '/patient/profile', label: 'My Profile', icon: UserIcon },
          { path: '/patient/appointments', label: 'Appointments', icon: Calendar },
          { path: '/patient/book', label: 'Book Appointment', icon: Plus },
        ];
      default:
        return [];
    }
  }, [user]);

  const badge = user ? roleBadge[user.role] : roleBadge.PATIENT;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
          <div className="w-9 h-9 rounded-lg bg-teal-500 flex items-center justify-center">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-lg leading-tight">MediCore</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Smart Hospital</div>
          </div>
          <button className="ml-auto lg:hidden text-slate-400" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${active ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold">
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.email}</div>
              <div className={`inline-block text-[10px] px-2 py-0.5 rounded-full ${badge.bg} ${badge.text} font-semibold mt-0.5`}>
                {badge.label}
              </div>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 lg:px-8 sticky top-0 z-10">
          <button className="lg:hidden mr-4 text-slate-600" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Secure Session</span>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}