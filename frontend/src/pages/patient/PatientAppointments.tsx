import { XCircle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { useMyAppointments } from '../../hooks/useAppointments';
import { errorMessage } from '../../lib/fetcher';
import { formatDateTime } from '../../lib/datetime';

export default function PatientAppointments() {
  const { appointments, isLoading, error, cancel, invalidate } = useMyAppointments();

  const handleCancel = async (id: string, label: string) => {
    if (!window.confirm(`Cancel appointment ${label}?`)) return;
    try {
      await cancel(id);
    } catch (e) {
      alert(errorMessage(e));
      await invalidate();
    }
  };

  return (
    <div>
      <PageHeader title="My Appointments" subtitle="View and manage your appointments" />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {isLoading && <LoadingState label="Loading appointments..." />}
        {error && <ErrorState message={errorMessage(error)} onRetry={invalidate} />}

        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Doctor</th>
                  <th className="text-left px-4 py-3 font-semibold">Specialization</th>
                  <th className="text-left px-4 py-3 font-semibold">When</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Notes</th>
                  <th className="text-right px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{apt.doctorName}</td>
                    <td className="px-4 py-3 text-slate-600">{apt.specialization}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDateTime(apt.appointmentTime)}</td>
                    <td className="px-4 py-3"><StatusBadge status={apt.status} /></td>
                    <td className="px-4 py-3 text-slate-500 max-w-50 truncate">{apt.notes || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      {apt.status === 'SCHEDULED' && (
                        <button onClick={() => handleCancel(apt.id, `${apt.doctorName} on ${formatDateTime(apt.appointmentTime)}`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                          <XCircle className="w-3 h-3" /> Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {appointments.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400 text-sm">No appointments yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}