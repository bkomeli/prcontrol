import { useMemo } from "react";
import { useActivations } from "@/context/ActivationContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ActivationStatus } from "@/types/activation";

interface Props {
  cavalo: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function StatusTimeline({ cavalo, open, onOpenChange }: Props) {
  const { activations } = useActivations();

  const history = useMemo(() => {
    return activations
      .filter((a) => a.cavalo === cavalo)
      .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());
  }, [activations, cavalo]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Histórico da placa {cavalo}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {history.map((a) => (
            <div key={a.id} className="border-l-2 border-primary/40 pl-4 pb-2">
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={a.status} />
                <span className="text-xs text-muted-foreground">{a.equipe || "—"}</span>
              </div>
              <p className="text-xs text-muted-foreground">{a.motivo}</p>
              <div className="flex gap-4 mt-1 text-[10px] text-muted-foreground">
                <span>Criado: {formatDate(a.criadoEm)}</span>
                <span>Atualizado: {formatDate(a.atualizadoEm)}</span>
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum registro encontrado</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
