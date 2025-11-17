import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-white mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-4 py-3 rounded-lg",
            "bg-white/10 border transition-all duration-200",
            "text-white placeholder:text-white/50",
            "focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent",
            error
              ? "border-error-500 focus:ring-error-400"
              : "border-white/20 hover:border-white/30",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-error-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-white/60">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
