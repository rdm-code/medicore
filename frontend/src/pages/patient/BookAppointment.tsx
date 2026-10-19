import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import LoadingState from '../../components/LoadingState';
import { useMyAppointments } from '../../hooks/useAppointments';
import { useDoctors } from '../../hooks/useDoctors';
import { useAvailableSlots } from '../../hooks/useSlots';
import { useZodForm } from '../../hooks/useZodForm';
import { toLocalDateTimeString } from '../../lib/datetime';
import { errorMessage } from '../../lib/fetcher';
import { appointmentCreateSchema, type AppointmentCreateFormValues } from '../../schemas';

export default function BookAppointment() {
  const navigate = useNavigate();
  const { create } = useMyAppointments();
  const { doctors, isLoading: loadingDoctors } = useDoctors();
  const [success, setSuccess] = useState(false);
  const [actionError, setActionError] = useState('');

  const form = useZodForm<AppointmentCreateFormValues>({
    initialValues: { doctorId: '', date: '', time: '', reason: '' },
    schema: appointmentCreateSchema,
    onSubmit: async (values) => {
      setActionError('');
      try {
        await create({
          doctorId: values.doctorId,
          appointmentTime: toLocalDateTimeString(values.date, values.time),
          reason: values.reason || undefined,
        });
        setSuccess(true);
        setTimeout(() => navigate('/patient/appointments'), 1200);
      } catch (e) {
        setActionError(errorMessage(e));
      }
    },
  });

  const { slots, isLoading: loadingSlots } = useAvailableSlots(
    form.values.doctorId || null,
    form.values.date || null
  );

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Appointment Booked!</h2>
        <p className="text-sm text-slate-500 mt-1">Redirecting to your appointments...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Book Appointment" subtitle="Schedule a visit with a doctor" />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-xl">
        {(actionError || form.serverError) && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {actionError || form.serverError}
          </div>
        )}

        {loadingDoctors ? (
          <LoadingState label="Loading doctors..." />
        ) : (
          <form onSubmit={form.handleSubmit} className="space-y-4" noValidate>
            <FormField label="Doctor" error={form.errors.doctorId} touched={form.touched.doctorId}>
              <select name="doctorId" value={form.values.doctorId}
                onChange={form.handleChange} onBlur={() => form.setTouched('doctorId')}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm bg-white">
                <option value="">Select a doctor...</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName} — {d.specialization}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Date" error={form.errors.date} touched={form.touched.date}>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="date" name="date" value={form.values.date}
                  onChange={form.handleChange} onBlur={() => form.setTouched('date')}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm" />
              </div>
            </FormField>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Available Slots</label>
              {!form.values.doctorId || !form.values.date ? (
                <p className="text-xs text-slate-400">Select a doctor and date to see available slots</p>
              ) : loadingSlots ? (
                <p className="text-xs text-slate-400">Loading slots...</p>
              ) : slots.length === 0 ? (
                <p className="text-xs text-amber-600">No slots available for this date</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map((slot) => {
                    const isSelected = form.values.time === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => {
                          form.setValue('time', slot);
                          form.setTouched('time');
                        }}
                        className={`
                          flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-colors
                          ${isSelected
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-50 text-slate-700 hover:bg-teal-50 hover:text-teal-700'}
                        `}
                      >
                        <Clock className="w-3 h-3" />
                        {slot}
                      </button>
                    );
                  })}
                </div>
              )}
              {form.touched.time && form.errors.time && (
                <p className="text-xs text-red-600 mt-1">{form.errors.time}</p>
              )}
            </div>

            <FormField label="Reason (optional)" error={form.errors.reason} touched={form.touched.reason}>
              <input name="reason" value={form.values.reason ?? ''}
                onChange={form.handleChange} onBlur={() => form.setTouched('reason')}
                placeholder="Briefly describe the reason for your visit"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm" />
            </FormField>

            <button type="submit" disabled={form.submitting}
              className="w-full py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-colors disabled:opacity-50">
              {form.submitting ? 'Booking...' : 'Confirm Appointment'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}