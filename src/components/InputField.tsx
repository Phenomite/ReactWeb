import { memo, type ChangeEvent } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon: LucideIcon;
  required?: boolean;
  className?: string;
}

// Reusable accessible text/password input field with left-anchored icon
export const InputField = memo(({ label, type = 'text', value, onChange, placeholder, icon: Icon, required = false, className }: InputFieldProps) => (
  <div className={className}>
    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
    <div className="relative">
      <Icon className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-slate-400" aria-hidden="true" />
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={cn(
          'w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors',
          'focus:border-blue-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-900'
        )}
      />
    </div>
  </div>
));
