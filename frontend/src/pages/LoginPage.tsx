import { useNavigate, Link } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loginSchema, type LoginFormValues } from '../schemas';
import { useZodForm } from '../hooks/useZodForm';
import FormField from '../components/FormField';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const form = useZodForm<LoginFormValues>({
    // initialValues: { email: 'admin@medicore.com', password: 'password' },
    initialValues: { email: '', password: '' },
    schema: loginSchema,
    onSubmit: async (values) => {
      await login(values);
      navigate('/');
    },
  });

  const quickLogin = async (email: string) => {
    await login({ email, password: 'password' });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-teal-500 items-center justify-center mb-4">
            <HeartPulse className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">MediCore</h1>
          <p className="text-slate-400 mt-1">Smart Hospital Management</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-1">Welcome back</h2>
          <p className="text-sm text-slate-500 mb-5">Sign in to your account</p>

          {form.serverError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {form.serverError}
            </div>
          )}

          <form onSubmit={form.handleSubmit} className="space-y-4" noValidate>
            <FormField label="Email" error={form.errors.email} touched={form.touched.email}>
              <input
                type="email"
                name="email"
                value={form.values.email}
                onChange={form.handleChange}
                onBlur={() => form.setTouched('email')}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm"
              />
            </FormField>
            <FormField label="Password" error={form.errors.password} touched={form.touched.password}>
              <input
                type="password"
                name="password"
                value={form.values.password}
                onChange={form.handleChange}
                onBlur={() => form.setTouched('password')}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm"
              />
            </FormField>
            <button
              type="submit"
              disabled={form.submitting}
              className="w-full py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {form.submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-xs text-slate-500 mb-3 font-medium">Quick demo access:</p>
            <div className="grid grid-cols-3 gap-2">
              {['admin@medicore.com', 'dr.smith@medicore.com', 'patient@example.com'].map((email, i) => (
                <button key={email}
                  onClick={() => quickLogin(email)}
                  disabled={form.submitting}
                  className={`px-2 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                    i === 0
                      ? 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                      : i === 1
                        ? 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}>
                  {['Admin', 'Doctor', 'Patient'][i]}
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-4">
            New patient?{' '}
            <Link to="/register" className="text-teal-600 font-semibold hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}