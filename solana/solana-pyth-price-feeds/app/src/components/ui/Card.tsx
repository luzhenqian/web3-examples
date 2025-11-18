import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  gradient?: boolean;
}

export function Card({ children, className, gradient = false }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl",
        gradient
          ? "bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/20"
          : "bg-white/10 border border-white/10",
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn("mb-4", className)}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn("text-xl font-bold text-white", className)}>
      {children}
    </h3>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  );
}
