import { useState, useMemo, useCallback } from "react";
import { useActivations } from "@/context/ActivationContext";
import { ActivationCard } from "@/components/ActivationCard";
import { DateFilter } from "@/components/DateFilter";
import { Button } from "@/components/ui/button";
import { Shield, Copy } from "lucide-react";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";

export default function PrAtivas() {
  const { activations } = useActivations();
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({ from: today, to: today });

  const active = useMemo(() => {
    const dayStart = dateRange.from ? new Date(dateRange.from) : new Date();
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = dateRange.to ? new Date(dateRange.to) : new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    return activations.filter((a) => {
      if (a.status === "Finalizado" || a.status === "Cancelado") return false;
      const d = new Date(a.criadoEm);
      return d >= dayStart && d <= dayEnd;
    });
  }, [activations, filterDate]);

  const statusLabel = (s: string) => {
    if (s === "Aguardando equipe") return "Cotando";
    return s;
  };

  const copyScript = useCallback(() => {
    const lines = [`PRs ATIVAS | ${active.length}`, ""];
    active.forEach((a, i) => {
      lines.push(`Placa: ${a.cavalo}${a.carreta ? ` / ${a.carreta}` : ""}`);
      lines.push(`Equipe: ${a.equipe || ""}`);
      lines.push(`Status: ${statusLabel(a.status)}`);
      lines.push(`Motivo: ${a.motivo}`);
      if (i < active.length - 1) lines.push("", "--------------------", "");
    });
    navigator.clipboard.writeText(lines.join("\n"));
    toast.success("Script das PRs ativas copiado!");
  }, [active]);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          PR Ativas
          <span className="text-sm font-normal bg-primary text-primary-foreground rounded-full px-2.5 py-0.5 ml-2">
            {active.length}
          </span>
        </h1>
        <div className="ml-auto flex items-center gap-2">
          {active.length > 0 && (
            <Button variant="outline" size="sm" className="h-9 text-xs gap-1" onClick={copyScript}>
              <Copy className="h-3.5 w-3.5" />
              Copiar PRs Ativas
            </Button>
          )}
          <DateFilter date={filterDate} onChange={setFilterDate} />
        </div>
      </div>

      {active.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Nenhuma PR ativa no momento</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {active.map((a) => (
            <ActivationCard key={a.id} activation={a} showQuickActions />
          ))}
        </div>
      )}
    </div>
  );
}
