import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  ok: "bg-ok/15 text-ok",
  soon: "bg-soon/15 text-soon",
  overdue: "bg-overdue/15 text-overdue",
  unknown: "bg-muted/15 text-muted",
};

export function Badge({ status, children, className }: { status: keyof typeof styles; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("font-mono text-[10px] uppercase tracking-wide px-2 py-1 rounded-full whitespace-nowrap", styles[status], className)}>
      {children}
    </span>
  );
}
