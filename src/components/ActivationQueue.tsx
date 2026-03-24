import { useActivations } from "@/context/ActivationContext";
import { ActivationCard } from "@/components/ActivationCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Radio } from "lucide-react";

export function ActivationQueue() {
  const { activations } = useActivations();
  const active = activations.filter(
    (a) => a.status !== "Finalizado" && a.status !== "Cancelado"
  );

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Radio className="h-5 w-5 text-status-dispatched" />
        Fila de Acionamentos
        <span className="ml-auto text-xs font-normal bg-primary text-primary-foreground rounded-full px-2 py-0.5">
          {active.length}
        </span>
      </h2>

      <ScrollArea className="flex-1 -mr-2 pr-2">
        {active.length === 0 ? (
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
