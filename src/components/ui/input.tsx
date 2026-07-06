import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-2xl border border-emerald-100 bg-white px-4 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-emerald-300",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
