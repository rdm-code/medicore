import { useNavigate, Link } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { registerSchema, type RegisterFormValues } from '../schemas';
import { useZodForm } from '../hooks/useZodForm';
import FormField from '../components/FormField';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const form = useZodForm<RegisterFormValues>({
    initialValues: { fullName: '', email: '', password: '', phone: '', age: 0, gender: '' },
    schema: registerSchema,
    onSubmit: async (values) => {
  await register({
    email: values.email,
    password: values.password,
    fullName: values.fullName,
    age: Number(values.age),
    gender: values.gender.toUpperCase() as 'MALE' | 'FEMALE' | 'OTHER',
    phone: values.phone,
  });
  navigate('/patient/dashboard');
}
  });

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-teal-500 items-center justify-center mb-3">
            <HeartPulse className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-slate-400 text-sm mt-1">Patient self-registration</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {form.serverError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {form.serverError}
            </div>
          )}
          <form onSubmit={form.handleSubmit} className="space-y-3" noValidate>
            <FormField label="Full Name" error={form.errors.fullName} touched={form.touched.fullName}>
              <input type="text" name="fullName" value={form.values.fullName}
                onChange={form.handleChange} onBlur={() => form.setTouched('fullName')}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm" />
            </FormField>
            <FormField label="Email" error={form.errors.email} touched={form.touched.email}>
              <input type="email" name="email" value={form.values.email}
                onChange={form.handleChange} onBlur={() => form.setTouched('email')}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm" />
            </FormField>
            <FormField label="Password" error={form.errors.password} touched={form.touched.password}
              hint="Min 8 chars, 1 uppercase, 1 lowercase, 1 number">
              <input type="password" name="password" value={form.values.password}
                onChange={form.handleChange} onBlur={() => form.setTouched('password')}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm" />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Phone" error={form.errors.phone} touched={form.touched.phone}>
                <input type="tel" name="phone" value={form.values.phone}
                  onChange={form.handleChange} onBlur={() => form.setTouched('phone')}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm" />
              </FormField>
              <FormField label="Age" error={form.errors.age} touched={form.touched.age}>
                <input type="number" name="age" value={form.values.age}
                  onChange={form.handleChange} onBlur={() => form.setTouched('age')}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm" />
              </FormField>
              <FormField label="Gender" error={form.errors.gender} touched={form.touched.gender}>
  <select name="gender" value={form.values.gender}
    onChange={form.handleChange} onBlur={() => form.setTouched('gender')}
    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm bg-white">
    <option value="">Select...</option>
    <option value="MALE">Male</option>
    <option value="FEMALE">Female</option>
    <option value="OTHER">Other</option>
  </select>
</FormField>
            </div>
            <button type="submit" disabled={form.submitting}
              className="w-full py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-colors disabled:opacity-50 mt-2">
              {form.submitting ? 'Creating...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}