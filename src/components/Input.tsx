import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon: Icon, ...props }, ref) => {
    return (
      <div className={`w-full flex-col flex ${className || ''}`}>
        {label && (
          <label className="mb-1.5 text-sm font-semibold text-text-main">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Icon className="h-5 w-5 text-text-muted" />
            </div>
          )}
          <input
            className={`flex h-12 w-full rounded-2xl border bg-surface px-4 py-2 text-sm text-text-main placeholder:text-text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${
              Icon ? 'pl-11' : ''
            } ${error ? 'border-red-500 ring-red-500' : 'border-border'}`}
            ref={ref}
            {...props}
          />
        </div>
        {error && <span className="mt-1.5 text-xs text-red-500 font-medium">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
