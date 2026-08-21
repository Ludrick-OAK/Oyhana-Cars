"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

// Select natif stylé (plus simple qu'un Radix Select pour ce MVP,
// remplaçable plus tard par @radix-ui/react-select si besoin d'options riches).
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-ink focus:outline-none focus:border-copper",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";
