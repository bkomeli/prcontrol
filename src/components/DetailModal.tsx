import type { Activation } from "@/types/activation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { QuickActions } from "@/components/QuickActions";
import { Badge } from "@/components/ui/badge";

export function DetailModal({ activation, open, onOpenChange }: { activation: Activation | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  if (!activation) return null;
  const a = activation;
  const rows = [
    ["SM", a.sm],
    ["Transportador", a.transportador],
    ["Cavalo", a.cavalo],
    ["Carreta", a.carreta],
    ["Lat / Long", a.latLong],
    ["Armado", a.armado],
    ["Motivo", a.motivo],
    ["Autorizado por", a.autorizadoPor],
    ["Resumo", a.resumo],
    ["Equipe", a.equipe || "—"],
    ["Responsável", a.responsavel || "—"],
  ];

  const formatDate = (iso: string) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            SM {a.sm}
            <StatusBadge status={a.status} />
            {a.urgente && <Badge variant="destructive" className="text-[10px]">URGENTE</Badge>}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {rows.map(([label, value]) => (
            <div key={label} className="flex gap-2 text-sm">
              <span className="text-muted-foreground w-32 shrink-0">{label}:</span>
              <span className="text-foreground font-medium">{value}</span>
            </div>
          ))}
          <div className="flex gap-2 text-sm">
            <span className="text-muted-foreground w-32 shrink-0">Criado em:</span>
            <span className="text-foreground font-medium">{formatDate(a.criadoEm)}</span>
          </div>
          <div className="flex gap-2 text-sm">
            <span className="text-muted-foreground w-32 shrink-0">Atualizado em:</span>
            <span className="text-foreground font-medium">{formatDate(a.atualizadoEm)}</span>
          </div>
        </div>
        {a.status !== "Finalizado" && a.status !== "Cancelado" && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Ações rápidas</p>
            <QuickActions activation={a} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
