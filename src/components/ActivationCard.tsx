import { useState } from "react";
import { useActivations } from "@/context/ActivationContext";
import type { Activation, Team } from "@/types/activation";
import { TEAMS } from "@/types/activation";
import { StatusBadge } from "@/components/StatusBadge";
import { QuickActions } from "@/components/QuickActions";
import { ScriptModal } from "@/components/ScriptModal";
import { useElapsedTime } from "@/hooks/useElapsedTime";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Clock, FileText, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export function ActivationCard({ activation, showQuickActions = false }: { activation: Activation; showQuickActions?: boolean }) {
  const { assignTeam, updateStatus } = useActivations();
  const [equipe, setEquipe] = useState<Team | "">(activation.equipe || "");
  const [responsavel, setResponsavel] = useState(activation.responsavel || "");
  const [scriptOpen, setScriptOpen] = useState(false);
  const elapsed = useElapsedTime(activation.criadoEm);

  const isWaiting = activation.status === "Aguardando equipe";

  const handleConfirm = () => {
    if (!equipe) { toast.error("Selecione uma equipe"); return; }
    if (!responsavel.trim()) { toast.error("Digite o responsável"); return; }
    assignTeam(activation.id, equipe as Team, responsavel);
    toast.success("Deslocamento confirmado!");
  };

  const handleCancel = () => {
    updateStatus(activation.id, "Cancelado");
    toast.info("Acionamento cancelado");
  };

  return (
    <>
      <Card
        className={`p-4 shadow-sm border-border cursor-pointer hover:border-primary/30 transition-colors ${activation.urgente ? "border-destructive/50 ring-1 ring-destructive/30" : ""}`}
        onClick={() => setScriptOpen(true)}
      >
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground font-mono">Placa</span>
              {activation.urgente && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                  <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                  URGENTE
                </Badge>
              )}
            </div>
            <p className="text-sm font-semibold text-foreground">{activation.cavalo}{activation.carreta ? ` / ${activation.carreta}` : ""}</p>
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
          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
            <Select value={equipe} onValueChange={(v) => setEquipe(v as Team)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Selecionar equipe" />
              </SelectTrigger>
              <SelectContent>
                {TEAMS.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              placeholder="Responsável"
              className="h-8 text-xs"
            />

            <div className="flex gap-2">
              <Button size="sm" className="flex-1 h-7 text-xs" onClick={handleConfirm}>
                <CheckCircle className="h-3 w-3 mr-1" />
                Confirmar
              </Button>
              <Button variant="destructive" size="sm" className="flex-1 h-7 text-xs" onClick={handleCancel}>
                <XCircle className="h-3 w-3 mr-1" />
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {!isWaiting && activation.equipe && (
          <div className="text-xs text-muted-foreground space-y-0.5">
            <p>Equipe: <span className="font-medium text-foreground">{activation.equipe}</span></p>
            <p>Responsável: <span className="font-medium text-foreground">{activation.responsavel}</span></p>
          </div>
        )}

        {showQuickActions && !isWaiting && activation.status !== "Finalizado" && activation.status !== "Cancelado" && (
          <div className="mt-3 pt-2 border-t border-border" onClick={(e) => e.stopPropagation()}>
            <QuickActions activation={activation} />
          </div>
        )}
      </Card>
      <ScriptModal activation={activation} open={scriptOpen} onOpenChange={setScriptOpen} />
    </>
  );
}
