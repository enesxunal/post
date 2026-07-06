"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  default:
    "bg-emerald-500 text-white hover:bg-emerald-600 focus-visible:ring-emerald-300",
  secondary:
    "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 focus-visible:ring-emerald-200",
  outline:
    "border border-emerald-200 bg-white text-slate-900 hover:bg-emerald-50 focus-visible:ring-emerald-200",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-200",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
