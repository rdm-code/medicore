import { useState, useMemo } from 'react';
import { Search, Trash2, Edit } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import FormField from '../../components/FormField';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { usePatients } from '../../hooks/usePatients';
import { useZodForm } from '../../hooks/useZodForm';
import { errorMessage } from '../../lib/fetcher';
import { formatDate } from '../../lib/datetime';
import { patientUpdateSchema, type PatientResponse, type PatientUpdateFormValues } from '../../schemas';

export default function AdminPatients() {
  const [search, setSearch] = useState('');
  const { patients, isLoading, error, update, remove, invalidate } = usePatients();
  const [editing, setEditing] = useState<PatientResponse | null>(null);
  const [serverError, setServerError] = useState('');

  const form = useZodForm<PatientUpdateFormValues>({
    initialValues: { fullName: '', phone: '', age: undefined, gender: ""
     },
    schema: patientUpdateSchema,
    onSubmit: async (values) => {
      setServerError('');
      try {
        if (!editing) return;
        await update(editing.id, {
          fullName: values.fullName,
          phone: values.phone ?? '',
          age: typeof values.age === 'number' ? values.age : undefined,
          gender: (values.gender || editing.gender || 'MALE').toUpperCase() as 'MALE' | 'FEMALE' | 'OTHER',
        });
        setEditing(null);
      } catch (e) {
        setServerError(errorMessage(e));
      }
    },
  });

  const openEdit = (p: PatientResponse) => {
    setEditing(p);
    form.reset({
      fullName: p.fullName,
      phone: p.phone ?? '',
      age: p.age ?? undefined,
      gender: (p.gender ?? 'MALE').toUpperCase() as 'MALE' | 'FEMALE' | 'OTHER',
    });
    setServerError('');
  };

  const handleDelete = async (p: PatientResponse) => {
    if (!window.confirm(`Delete patient ${p.fullName}?`)) return;
    try {
      await remove(p.id);
    } catch (e) {
      alert(errorMessage(e));
      await invalidate();
    }
  };

  const filtered = useMemo(
    () =>
      patients.filter(
        (p) =>
          p.fullName.toLowerCase().includes(search.toLowerCase()) ||
          p.email.toLowerCase().includes(search.toLowerCase())
      ),
    [patients, search]
  );

  return (
    <div>
      <PageHeader title="Patient Management" subtitle="View and manage registered patients" />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search patients..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm" />
          </div>
        </div>

        {isLoading && <LoadingState label="Loading patients..." />}
        {error && <ErrorState message={errorMessage(error)} onRetry={invalidate} />}

        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Name</th>
                  <th className="text-left px-4 py-3 font-semibold">Email</th>
                  <th className="text-left px-4 py-3 font-semibold">Age</th>
                  <th className="text-left px-4 py-3 font-semibold">Gender</th>
                  <th className="text-left px-4 py-3 font-semibold">Phone</th>
                  <th className="text-left px-4 py-3 font-semibold">Updated</th>
                  <th className="text-right px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{p.fullName}</td>
                    <td className="px-4 py-3 text-slate-600">{p.email}</td>
                    <td className="px-4 py-3 text-slate-600">{p.age ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{p.gender ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{p.phone}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(p.updatedAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button onClick={() => openEdit(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-sm">No patients found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Patient">
        <form onSubmit={form.handleSubmit} className="space-y-3" noValidate>
          {serverError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {serverError}
            </div>
          )}
          <FormField label="Full Name" error={form.errors.fullName} touched={form.touched.fullName}>
            <input name="fullName" value={form.values.fullName}
              onChange={form.handleChange} onBlur={() => form.setTouched('fullName')}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
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
          <FormField label="Gender" error={form.errors.gender} touched={form.touched.gender}>
  <select name="gender" value={form.values.gender}
    onChange={form.handleChange} onBlur={() => form.setTouched('gender')}
    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm bg-white">
    <option value="">Select...</option>
    <option value="MALE">Male</option>
    <option value="FEMALE">Female</option>
    <option value="OTHER">Other</option>
  </select>
</FormField>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setEditing(null)}
              className="flex-1 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={form.submitting}
              className="flex-1 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors disabled:opacity-50">
              {form.submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}