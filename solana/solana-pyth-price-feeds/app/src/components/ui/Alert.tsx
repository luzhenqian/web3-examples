import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AlertProps {
  children: ReactNode;
  variant?: "info" | "success" | "warning" | "error";
  className?: string;
  icon?: ReactNode;
}

export function Alert({
  children,
  variant = "info",
  className,
  icon,
}: AlertProps) {
  const variants = {
    info: "bg-primary-500/10 border-primary-500/30 text-primary-100",
    success: "bg-success-500/10 border-success-500/30 text-success-100",
    warning: "bg-yellow-500/10 border-yellow-500/30 text-yellow-100",
    error: "bg-error-500/10 border-error-500/30 text-error-100",
  };

  const icons = {
    info: "ℹ️",
    success: "✅",
    warning: "⚠️",
    error: "❌",
  };

  return (
    <div
      className={cn(
        "rounded-lg px-4 py-3 border backdrop-blur-sm animate-slide-up",
        variants[variant],
        className
      )}
    >
      <div className="flex items-start gap-3">
        {icon !== undefined ? (
          icon
        ) : (
          <span className="text-lg">{icons[variant]}</span>
        )}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
