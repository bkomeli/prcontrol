import { useMemo } from "react";
import { useActivations } from "@/context/ActivationContext";
import { useDateFilter } from "@/context/DateFilterContext";
import { ActivationCard } from "@/components/ActivationCard";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DateFilter } from "@/components/DateFilter";
import { Radio } from "lucide-react";

export function ActivationQueue() {
  const { activations, loading } = useActivations();
  const { dateRange, setDateRange } = useDateFilter();

  const active = useMemo(() => {
    const dayStart = dateRange.from ? new Date(dateRange.from) : new Date();
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = dateRange.to ? new Date(dateRange.to) : new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    return activations
      .filter((a) => {
        if (a.status !== "Aguardando equipe") return false;
        const d = new Date(a.criadoEm);
        return d >= dayStart && d <= dayEnd;
      })
      .sort((a, b) => {
        if (a.urgente !== b.urgente) return a.urgente ? -1 : 1;
        return 0;
      });
  }, [activations, dateRange]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Radio className="h-5 w-5 text-status-dispatched" />
          Fila de Acionamentos
          <span className="ml-2 text-xs font-normal bg-primary text-primary-foreground rounded-full px-2 py-0.5">
            {active.length}
          </span>
        </h2>
        <div className="ml-auto">
          <DateFilter range={dateRange} onChange={setDateRange} />
        </div>
      </div>

      <ScrollArea className="flex-1 -mr-2 pr-2">
        {loading ? (
          <CardSkeleton count={3} />
        ) : active.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum acionamento ativo
          </p>
        ) : (
          <div className="space-y-3">
            {active.map((a) => (
              <ActivationCard key={a.id} activation={a} />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
