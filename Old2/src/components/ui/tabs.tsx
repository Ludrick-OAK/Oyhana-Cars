"use client";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn("flex gap-1 border-b border-border mb-6 overflow-x-auto", className)}
      {...props}
    />
  );
}
export function TabsTrigger({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "px-4 py-2.5 text-sm font-medium text-muted border-b-2 border-transparent whitespace-nowrap",
        "data-[state=active]:text-copper data-[state=active]:border-copper transition-colors",
        className
      )}
      {...props}
    />
  );
}
export function TabsContent({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn("focus:outline-none", className)} {...props} />;
}
