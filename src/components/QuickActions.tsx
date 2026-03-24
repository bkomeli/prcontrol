import { useActivations } from "@/context/ActivationContext";
import type { Activation, ActivationStatus } from "@/types/activation";
import { Button } from "@/components/ui/button";
import { Truck, Shield, Search, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const actions: { status: ActivationStatus; label: string; icon: React.ElementType; variant?: "default" | "outline" }[] = [
  { status: "Em deslocamento", label: "Deslocamento", icon: Truck, variant: "outline" },
  { status: "Em preservação", label: "Preservação", icon: Shield, variant: "outline" },
  { status: "Em varredura", label: "Varredura", icon: Search, variant: "outline" },
  { status: "Finalizado", label: "Finalizar", icon: CheckCircle, variant: "default" },
];

export function QuickActions({ activation }: { activation: Activation }) {
  const { updateStatus } = useActivations();

  const handle = (status: ActivationStatus) => {
    updateStatus(activation.id, status);
    toast.success(`Status alterado para "${status}"`);
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {actions
        .filter((a) => a.status !== activation.status)
        .map((a) => (
          <Button
            key={a.status}
            variant={a.variant}
            size="sm"
            className="h-7 text-xs"
            onClick={(e) => { e.stopPropagation(); handle(a.status); }}
          >
            <a.icon className="h-3 w-3 mr-1" />
            {a.label}
          </Button>
        ))}
    </div>
  );
}
