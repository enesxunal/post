"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export function Checkbox({ checked, onCheckedChange, className }: CheckboxProps) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "flex h-6 w-6 items-center justify-center rounded-md border border-emerald-200 transition",
        checked ? "bg-emerald-500 text-white" : "bg-white text-transparent",
        className,
      )}
    >
      <Check className="h-4 w-4" />
    </button>
  );
}
