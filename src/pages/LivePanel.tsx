import { useMemo } from "react";
import { useActivations } from "@/context/ActivationContext";
import { StatusBadge } from "@/components/StatusBadge";
import { useElapsedTime } from "@/hooks/useElapsedTime";
import { Monitor, Clock, AlertTriangle } from "lucide-react";

function LiveRow({ activation }: { activation: any }) {
  const elapsed = useElapsedTime(activation.criadoEm);
  return (
    <tr className="border-b border-border/50">
      <td className="px-4 py-3 text-center">
        {activation.urgente && <AlertTriangle className="h-4 w-4 text-destructive inline" />}
      </td>
      <td className="px-4 py-3 font-mono text-base font-semibold text-foreground">
        {activation.cavalo}{activation.carreta ? ` / ${activation.carreta}` : ""}
      </td>
      <td className="px-4 py-3 text-sm">{activation.transportador}</td>
      <td className="px-4 py-3 text-sm">{activation.motivo}</td>
      <td className="px-4 py-3"><StatusBadge status={activation.status} /></td>
      <td className="px-4 py-3 text-sm">{activation.equipe || "—"}</td>
      <td className="px-4 py-3 text-sm font-mono flex items-center gap-1 text-muted-foreground">
        <Clock className="h-3.5 w-3.5" /> {elapsed}
      </td>
    </tr>
  );
}

export default function LivePanel() {
  const { activations } = useActivations();

  const active = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return activations
      .filter((a) => {
        if (a.status === "Finalizado" || a.status === "Cancelado") return false;
        return new Date(a.criadoEm) >= today;
      })
      .sort((a, b) => {
        if (a.urgente !== b.urgente) return a.urgente ? -1 : 1;
        return new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime();
      });
  }, [activations]);

  return (
    <div className="p-6 min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <Monitor className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Painel ao Vivo</h1>
        <span className="text-sm font-normal bg-primary text-primary-foreground rounded-full px-3 py-1 ml-2">
          {active.length} ativas
        </span>
        <span className="ml-auto text-xs text-muted-foreground">Atualização automática em tempo real</span>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-4 py-3 text-xs text-left w-10"></th>
              <th className="px-4 py-3 text-xs text-left font-semibold text-muted-foreground">Placa</th>
              <th className="px-4 py-3 text-xs text-left font-semibold text-muted-foreground">Transportadora</th>
              <th className="px-4 py-3 text-xs text-left font-semibold text-muted-foreground">Motivo</th>
              <th className="px-4 py-3 text-xs text-left font-semibold text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-xs text-left font-semibold text-muted-foreground">Equipe</th>
              <th className="px-4 py-3 text-xs text-left font-semibold text-muted-foreground">Tempo</th>
            </tr>
          </thead>
          <tbody>
            {active.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-muted-foreground py-12 text-lg">
                  Nenhuma PR ativa no momento
                </td>
              </tr>
            ) : (
              active.map((a) => <LiveRow key={a.id} activation={a} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
