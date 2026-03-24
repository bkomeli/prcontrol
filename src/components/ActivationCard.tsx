import { useState } from "react";
import { useActivations } from "@/context/ActivationContext";
import type { Activation, Team } from "@/types/activation";
import { TEAMS } from "@/types/activation";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export function ActivationCard({ activation }: { activation: Activation }) {
  const { assignTeam, updateStatus } = useActivations();
  const [equipe, setEquipe] = useState<Team | "">(activation.equipe || "");
  const [responsavel, setResponsavel] = useState(activation.responsavel || "");

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
    <Card className="p-4 shadow-sm border-border">
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-xs text-muted-foreground font-mono">SM</span>
          <p className="text-sm font-semibold text-foreground">{activation.sm}</p>
        </div>
        <StatusBadge status={activation.status} />
      </div>

      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{activation.motivo}</p>

      {isWaiting && (
        <div className="space-y-2">
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
    </Card>
  );
}
