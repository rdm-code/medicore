import { Link } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, Plus } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { useAuth } from '../../context/AuthContext';
import { useMyAppointments } from '../../hooks/useAppointments';
import { errorMessage } from '../../lib/fetcher';
import { formatDateTime } from '../../lib/datetime';

export default function PatientDashboard() {
  const { user } = useAuth();
  const { appointments, isLoading, error, invalidate } = useMyAppointments();

  const stats = [
    { label: 'Total Visits', value: appointments.length, icon: Calendar, color: 'blue' as const },
    { label: 'Upcoming', value: appointments.filter((a) => a.status === 'SCHEDULED').length, icon: Clock, color: 'amber' as const },
    { label: 'Completed', value: appointments.filter((a) => a.status === 'COMPLETED').length, icon: CheckCircle, color: 'teal' as const },
  ];

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.email ?? ''}`}
        subtitle="Your health journey at a glance"
        action={
          <Link to="/patient/book"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors">
            <Plus className="w-4 h-4" /> Book Appointment
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">My Appointments</h2>
          <Link to="/patient/appointments" className="text-sm text-teal-600 font-semibold hover:underline">View all</Link>
        </div>

        {isLoading && <LoadingState label="Loading appointments..." />}
        {error && <ErrorState message={errorMessage(error)} onRetry={invalidate} />}

        {!isLoading && !error && (
          <div className="divide-y divide-slate-100">
            {appointments.slice(0, 5).map((apt) => (
              <div key={apt.id} className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">
                  {apt.doctorName?.[0] ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900">{apt.doctorName}</div>
                  <div className="text-xs text-slate-500">{formatDateTime(apt.appointmentTime)}</div>
                </div>
                <StatusBadge status={apt.status} />
              </div>
            ))}
            {appointments.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-400">
                No appointments yet. <Link to="/patient/book" className="text-teal-600 font-semibold">Book one now</Link>.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}