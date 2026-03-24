import { useState, useMemo } from "react";
import { useActivations } from "@/context/ActivationContext";
import { ActivationCard } from "@/components/ActivationCard";
import { DateFilter } from "@/components/DateFilter";
import { Shield } from "lucide-react";

export default function PrAtivas() {
  const { activations } = useActivations();
  const [filterDate, setFilterDate] = useState(new Date());

  const active = useMemo(() => {
    const dayStart = new Date(filterDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(filterDate);
    dayEnd.setHours(23, 59, 59, 999);

    return activations.filter((a) => {
      if (a.status === "Finalizado" || a.status === "Cancelado") return false;
      const d = new Date(a.criadoEm);
      return d >= dayStart && d <= dayEnd;
    });
  }, [activations, filterDate]);

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
        <div className="ml-auto">
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
