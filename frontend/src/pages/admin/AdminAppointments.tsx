import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { useAdminAppointments } from '../../hooks/useAppointments';
import { errorMessage } from '../../lib/fetcher';
import { formatDateTime } from '../../lib/datetime';
import type { AppointmentStatus } from '../../types';

export default function AdminAppointments() {
  const [statusFilter, setStatusFilter] = useState<'' | AppointmentStatus>('');
  const { appointments, isLoading, error, remove, invalidate } = useAdminAppointments(
    statusFilter ? { status: statusFilter } : {}
  );

  const handleDelete = async (id: string, label: string) => {
    if (!window.confirm(`Delete appointment ${label}?`)) return;
    try {
      await remove(id);
    } catch (e) {
      alert(errorMessage(e));
      await invalidate();
    }
  };

  return (
    <div>
      <PageHeader title="Appointments" subtitle="Monitor and manage all hospital appointments" />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200">
          <select value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as '' | AppointmentStatus)}
            className="px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm bg-white">
            <option value="">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {isLoading && <LoadingState label="Loading appointments..." />}
        {error && <ErrorState message={errorMessage(error)} onRetry={invalidate} />}

        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Patient</th>
                  <th className="text-left px-4 py-3 font-semibold">Doctor</th>
                  <th className="text-left px-4 py-3 font-semibold">When</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Reason</th>
                  <th className="text-right px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{apt.patientName}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {apt.doctorName}
                      <div className="text-xs text-slate-400">{apt.specialization}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDateTime(apt.appointmentTime)}</td>
                    <td className="px-4 py-3"><StatusBadge status={apt.status} /></td>
                    <td className="px-4 py-3 text-slate-500 max-w-50 truncate">{apt.reason || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(apt.id, `${apt.patientName} → ${apt.doctorName}`)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {appointments.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400 text-sm">No appointments found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}