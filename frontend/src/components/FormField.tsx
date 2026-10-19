import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  touched?: boolean;
  children: ReactNode;
  hint?: string;
}

export default function FormField({ label, error, touched, children, hint }: FormFieldProps) {
  const showError = touched && error;
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
      {showError && <p className="text-xs text-red-600 mt-1">{error}</p>}
      {!showError && hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}