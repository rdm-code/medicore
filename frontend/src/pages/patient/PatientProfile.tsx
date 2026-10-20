import { useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { useMyPatientProfile } from '../../hooks/usePatients';
import { useZodForm } from '../../hooks/useZodForm';
import { errorMessage } from '../../lib/fetcher';
import { patientUpdateSchema, type PatientUpdateFormValues } from '../../schemas';
import type { Gender } from '../../types';

export default function PatientProfile() {
  const { patient, isLoading, error, update } = useMyPatientProfile();

  const form = useZodForm<PatientUpdateFormValues>({
    initialValues: { fullName: '', phone: '', age: undefined, gender:  '' },
    schema: patientUpdateSchema,
    onSubmit: async (values) => {
      await update({
        fullName: values.fullName,
        phone: values.phone ?? '',
        age: typeof values.age === 'number' ? values.age : undefined,
        gender: values.gender as Gender,
      });
    },
  });

  useEffect(() => {
    if (patient) {
      form.reset({
        fullName: patient.fullName,
        phone: patient.phone ?? '',
        age: patient.age ?? undefined,
        gender: patient.gender ?? '',
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient]);

  if (isLoading) return <LoadingState label="Loading profile..." />;
  if (error) return <ErrorState message={errorMessage(error)} />;
  if (!patient) return <div className="text-slate-500">Patient profile not found.</div>;

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Manage your personal information" />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold">
            {patient.fullName[0] ?? '?'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{patient.fullName}</h2>
            <p className="text-sm text-slate-500">{patient.email}</p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit} className="space-y-4" noValidate>
          {form.serverError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {form.serverError}
            </div>
          )}
          <FormField label="Full Name" error={form.errors.fullName} touched={form.touched.fullName}>
            <input name="fullName" value={form.values.fullName}
              onChange={form.handleChange} onBlur={() => form.setTouched('fullName')}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Age" error={form.errors.age} touched={form.touched.age}>
              <input type="number" name="age"
                value={form.values.age ?? ''}
                onChange={(e) => form.setValue('age', e.target.value === '' ? undefined : Number(e.target.value))}
                onBlur={() => form.setTouched('age')}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm" />
            </FormField>
            <FormField label="Gender" error={form.errors.gender} touched={form.touched.gender}>
              <select name="gender" value={form.values.gender ?? ''}
                onChange={form.handleChange} onBlur={() => form.setTouched('gender')}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm bg-white">
                <option value="">—</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </FormField>
          </div>
          <FormField label="Phone" error={form.errors.phone} touched={form.touched.phone}>
            <input name="phone" value={form.values.phone ?? ''}
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