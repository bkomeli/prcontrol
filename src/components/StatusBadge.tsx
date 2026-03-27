import type { ActivationStatus } from "@/types/activation";
import { cn } from "@/lib/utils";

const statusStyles: Record<ActivationStatus, string> = {
  "Aguardando equipe": "bg-status-waiting text-status-waiting-foreground",
  "Em deslocamento": "bg-status-dispatched text-status-dispatched-foreground",
  "Em preservação": "bg-status-preservation text-status-preservation-foreground",
  "Em varredura": "bg-status-sweep text-status-sweep-foreground",
  "Finalizado": "bg-status-finished text-status-finished-foreground",
  "Cancelado": "bg-status-cancelled text-status-cancelled-foreground",
};

export function StatusBadge({ status, className }: { status: ActivationStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        statusStyles[status] || "bg-muted text-muted-foreground",
        status === "Aguardando equipe" && "animate-pulse-soft",
        className
      )}
    >
      {status}
    </span>
  );
}
