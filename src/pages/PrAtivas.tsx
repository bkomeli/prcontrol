import { useActivations } from "@/context/ActivationContext";
import { ActivationCard } from "@/components/ActivationCard";
import { Shield } from "lucide-react";

export default function PrAtivas() {
  const { activations } = useActivations();
  const active = activations.filter(
    (a) => a.status !== "Finalizado" && a.status !== "Cancelado"
  );

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        PR Ativas
        <span className="text-sm font-normal bg-primary text-primary-foreground rounded-full px-2.5 py-0.5 ml-2">
          {active.length}
        </span>
      </h1>

      {active.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Nenhuma PR ativa no momento</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {active.map((a) => (
            <ActivationCard key={a.id} activation={a} />
          ))}
        </div>
      )}
    </div>
  );
}
