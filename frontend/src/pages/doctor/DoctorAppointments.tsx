import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import FormField from '../../components/FormField';
import { useMyAppointments } from '../../hooks/useAppointments';
import { appointmentNotesSchema, type AppointmentNotesFormValues, type AppointmentResponse } from '../../schemas';
import { useZodForm } from '../../hooks/useZodForm';
import { errorMessage } from '../../lib/fetcher';
import { formatDateTime } from '../../lib/datetime';

export default function DoctorAppointments() {
  const { appointments, isLoading, error, complete, addNotes, invalidate } = useMyAppointments();
  const [selected, setSelected] = useState<AppointmentResponse | null>(null);
  const [actionError, setActionError] = useState('');

  const notesForm = useZodForm<AppointmentNotesFormValues>({
    initialValues: { notes: '' },
    schema: appointmentNotesSchema,
    onSubmit: async (values) => {
      if (!selected) return;
      await addNotes(selected.id,  values.notes);
      setSelected(null);
    },
  });

  const openNotes = (apt: AppointmentResponse) => {
    setSelected(apt);
    notesForm.reset({ notes: apt.notes ?? '' });
    setActionError('');
  };

  const handleComplete = async (apt: AppointmentResponse) => {
    setActionError('');
    try {
      await complete(apt.id);
    } catch (e) {
      setActionError(errorMessage(e));
      await invalidate();
    }
  };

  return (
    <div>
      <PageHeader title="My Appointments" subtitle="Manage your patient appointments" />

      {actionError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {isLoading && <LoadingState label="Loading appointments..." />}
        {error && <ErrorState message={errorMessage(error)} onRetry={invalidate} />}

        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Patient</th>
                  <th className="text-left px-4 py-3 font-semibold">When</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Reason</th>
                  <th className="text-left px-4 py-3 font-semibold">Notes</th>
                  <th className="text-right px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{apt.patientName}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDateTime(apt.appointmentTime)}</td>
                    <td className="px-4 py-3"><StatusBadge status={apt.status} /></td>
                    <td className="px-4 py-3 text-slate-500 max-w-40 truncate">{apt.reason || '—'}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-40 truncate">{apt.notes || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button onClick={() => openNotes(apt)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-teal-600 bg-teal-50 hover:bg-teal-100 transition-colors">
                          Notes
                        </button>
                        {apt.status === 'SCHEDULED' && (
                          <button onClick={() => handleComplete(apt)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-green-600 bg-green-50 hover:bg-green-100 transition-colors">
                            <CheckCircle className="w-3 h-3" /> Complete
                          </button>
                        )}
                      </div>
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

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Doctor's Notes">
        <form onSubmit={notesForm.handleSubmit} className="space-y-3" noValidate>
          {notesForm.serverError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {notesForm.serverError}
            </div>
          )}
          <FormField label="Clinical Notes" error={notesForm.errors.notes} touched={notesForm.touched.notes}>
            <textarea name="notes" rows={5} value={notesForm.values.notes}
              onChange={notesForm.handleChange} onBlur={() => notesForm.setTouched('notes')}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm"
              placeholder="Enter clinical notes..." />
          </FormField>
          <div className="flex gap-3">
            <button type="button" onClick={() => setSelected(null)}
              className="flex-1 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={notesForm.submitting}
              className="flex-1 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors disabled:opacity-50">
              {notesForm.submitting ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}