import { useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { useMyDoctorProfile } from '../../hooks/useDoctors';
import { useZodForm } from '../../hooks/useZodForm';
import { errorMessage } from '../../lib/fetcher';
import { doctorUpdateMeSchema, type DoctorUpdateMeFormValues } from '../../schemas';

const specializationOptions = [
  'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics',
  'Dermatology', 'General Medicine',
];

export default function DoctorProfile() {
  const { doctor, isLoading, error, update } = useMyDoctorProfile();

  const form = useZodForm<DoctorUpdateMeFormValues>({
    initialValues: { fullName: '',specialization: '', phone: '' },
    schema: doctorUpdateMeSchema,
    onSubmit: async (values) => {
      await update(values);
    },
  });

  useEffect(() => {
    if (doctor) {
      form.reset({
        specialization: doctor.specialization, phone: doctor.phone,
        fullName: doctor.fullName
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctor]);

  if (isLoading) return <LoadingState label="Loading profile..." />;
  if (error) return <ErrorState message={errorMessage(error)} />;
  if (!doctor) return <div className="text-slate-500">Doctor profile not found.</div>;

  return (
    <div>
      <PageHeader title="My Profile" subtitle="View and update your doctor details" />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-2xl font-bold">
            {doctor.fullName[0]}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{doctor.fullName}</h2>
            <p className="text-sm text-slate-500">{doctor.email}</p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit} className="space-y-4" noValidate>
          {form.serverError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {form.serverError}
            </div>
          )}
          <FormField label="Specialization" error={form.errors.specialization} touched={form.touched.specialization}>
            <select name="specialization" value={form.values.specialization}
              onChange={form.handleChange} onBlur={() => form.setTouched('specialization')}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm bg-white">
              <option value="">Select...</option>
              {specializationOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </FormField>
          <FormField label="Phone" error={form.errors.phone} touched={form.touched.phone}>
            <input name="phone" value={form.values.phone}
              onChange={form.handleChange} onBlur={() => form.setTouched('phone')}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm" />
          </FormField>
          <button type="submit" disabled={form.submitting}
            className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors disabled:opacity-50">
            {form.submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}