import { useState } from "react";
import { useActivations } from "@/context/ActivationContext";
import { useEquipes } from "@/hooks/useCadastros";
import type { Activation, Team } from "@/types/activation";
import { StatusBadge } from "@/components/StatusBadge";
import { QuickActions } from "@/components/QuickActions";
import { ScriptModal } from "@/components/ScriptModal";
import { useElapsedTime } from "@/hooks/useElapsedTime";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export function ActivationCard({ activation, showQuickActions = false }: { activation: Activation; showQuickActions?: boolean }) {
  const { assignTeam, updateStatus } = useActivations();
  const { items: equipes } = useEquipes();
  const [equipe, setEquipe] = useState<Team | "">(activation.equipe || ((activation as any).type === "escolta" ? "ATIVA" : ""));
  const [responsavel, setResponsavel] = useState(activation.responsavel || "");
  const [pacotes, setPacotes] = useState(String(activation.pacotes || ""));
  const [scriptOpen, setScriptOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const elapsed = useElapsedTime(activation.criadoEm);

  const isWaiting = activation.status === "Aguardando equipe";

  const handleConfirm = async () => {
    if (!equipe) { toast.error("Selecione uma equipe"); return; }
    if (!responsavel.trim()) { toast.error("Digite o responsável"); return; }
    setSaving(true);
    try {
      await assignTeam(activation.id, equipe as Team, responsavel, Number(pacotes) || 0);
      toast.success("Deslocamento confirmado! ✅");
    } catch {
      toast.error("Erro ao confirmar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    setSaving(true);
    try {
      await updateStatus(activation.id, "Cancelado");
      toast.info("Acionamento cancelado");
    } catch {
      toast.error("Erro ao cancelar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Card
        className={`p-5 shadow-sm border-border cursor-pointer hover:border-primary/30 hover:shadow-md transition-all duration-200 ${activation.urgente ? "border-destructive/50 ring-1 ring-destructive/30" : ""} ${activation.sinistro ? "border-orange-500/50 ring-1 ring-orange-500/30" : ""}`}
        onClick={() => setScriptOpen(true)}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground font-mono">Placa</span>
              {activation.urgente && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                  <AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> URGENTE
                </Badge>
              )}
              {activation.sinistro && (
                <Badge className="text-[10px] px-1.5 py-0 bg-orange-600 text-white">SINISTRO</Badge>
              )}
            </div>
            <p className="text-sm font-semibold text-foreground">{activation.cavalo}{activation.carreta ? ` / ${activation.carreta}` : ""}</p>
            {activation.cidade && <p className="text-[10px] text-primary">📍 {activation.cidade}</p>}
          </div>
          <div className="flex flex-col items-end gap-1">
            <StatusBadge status={activation.status} />
            <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
              <Clock className="h-3 w-3" /> {elapsed}
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{activation.motivo}</p>

        {isWaiting && (
          <div className="space-y-2.5" onClick={(e) => e.stopPropagation()}>
            <Select value={equipe} onValueChange={(v) => setEquipe(v as Team)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecionar equipe" /></SelectTrigger>
              <SelectContent>
                {equipes.map((t) => <SelectItem key={t.id} value={t.nome}>{t.nome}</SelectItem>)}
              </SelectContent>
            </Select>

            <Input value={responsavel} onChange={(e) => setResponsavel(e.target.value)} placeholder="Responsável" className="h-8 text-xs" />
            
            <Input type="number" value={pacotes} onChange={(e) => setPacotes(e.target.value)} placeholder="Nº de pacotes" className="h-8 text-xs" />

            <div className="flex gap-2">
              <Button size="sm" className="flex-1 h-7 text-xs transition-colors duration-200" onClick={handleConfirm} disabled={saving}>
                <CheckCircle className="h-3 w-3 mr-1" /> {saving ? "Salvando…" : "Confirmar"}
              </Button>
              <Button variant="destructive" size="sm" className="flex-1 h-7 text-xs transition-colors duration-200" onClick={handleCancel} disabled={saving}>
                <XCircle className="h-3 w-3 mr-1" /> Cancelar
              </Button>
            </div>
          </div>
        )}

        {!isWaiting && activation.equipe && (
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Equipe: <span className="font-medium text-foreground">{activation.equipe}</span></p>
            <p>Responsável: <span className="font-medium text-foreground">{activation.responsavel}</span></p>
            {activation.pacotes > 0 && <p>Pacotes: <span className="font-medium text-foreground">{activation.pacotes}</span></p>}
          </div>
        )}

        {showQuickActions && !isWaiting && activation.status !== "Finalizado" && activation.status !== "Cancelado" && (
          <div className="mt-3 pt-3 border-t border-border" onClick={(e) => e.stopPropagation()}>
            <QuickActions activation={activation} />
          </div>
        )}
      </Card>
      <ScriptModal activation={activation} open={scriptOpen} onOpenChange={setScriptOpen} />
    </>
  );
}
