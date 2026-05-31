import React, { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon: Icon, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className={`w-full flex-col flex ${className || ''}`}>
        {label && (
          <label className="mb-1.5 text-sm font-semibold text-text-main">
            {label}
          </label>
        )}
        <div className="relative group">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Icon className="h-5 w-5 text-text-muted group-focus-within:text-primary transition-colors duration-200" />
            </div>
          )}
          <input
            type={inputType}
            className={clsx(
              `flex h-12 w-full rounded-2xl border bg-surface px-4 py-2 text-sm text-text-main placeholder:text-text-muted transition-all duration-200`,
              `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary`,
              `disabled:cursor-not-allowed disabled:opacity-50`,
              Icon ? 'pl-11' : '',
              isPassword ? 'pr-11' : '',
              error ? 'border-red-500 ring-2 ring-red-500/20' : 'border-border hover:border-primary/50',
              className
            )}
            ref={ref}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-primary transition-colors duration-200"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
          {!error && (
            <div className="absolute inset-x-0 bottom-0 h-12 rounded-2xl pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 shadow-[0_0_12px_-2px_rgba(127,13,242,0.15)]" />
          )}
        </div>
        {error && <span className="mt-1.5 text-xs text-red-500 font-medium">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

function clsx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}