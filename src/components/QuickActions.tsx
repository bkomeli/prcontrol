import { useState } from "react";
import { useActivations } from "@/context/ActivationContext";
import type { Activation, ActivationStatus } from "@/types/activation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Truck, Shield, Search, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

const actions: { status: ActivationStatus; label: string; icon: React.ElementType; variant?: "default" | "outline" | "destructive" }[] = [
  { status: "Em deslocamento", label: "Deslocamento", icon: Truck, variant: "outline" },
  { status: "Em preservação", label: "Preservação", icon: Shield, variant: "outline" },
  { status: "Em varredura", label: "Varredura", icon: Search, variant: "outline" },
  { status: "Finalizado", label: "Finalizar", icon: CheckCircle, variant: "default" },
  { status: "Cancelado", label: "Cancelar", icon: XCircle, variant: "destructive" },
];

export function QuickActions({ activation }: { activation: Activation }) {
  const { updateStatus, updateActivation } = useActivations();
  const [saving, setSaving] = useState<string | null>(null);
  const [reasonModal, setReasonModal] = useState<{ status: ActivationStatus } | null>(null);
  const [reason, setReason] = useState("");

  const handle = async (status: ActivationStatus) => {
    // Require reason for Finalizado and Cancelado
    if (status === "Finalizado" || status === "Cancelado") {
      setReasonModal({ status });
      setReason("");
      return;
    }
    setSaving(status);
    try {
      await updateStatus(activation.id, status);
      toast.success("Atualizado com sucesso ✅");
    } catch {
      toast.error("Erro ao atualizar. Tente novamente.");
    } finally {
      setSaving(null);
    }
  };

  const confirmWithReason = async () => {
    if (!reason.trim()) {
      toast.error("Informe o motivo");
      return;
    }
    if (!reasonModal) return;
    setSaving(reasonModal.status);
    try {
      await updateActivation(activation.id, {
        status: reasonModal.status,
        observacoes: `${activation.observacoes ? activation.observacoes + "\n" : ""}[${reasonModal.status}] ${reason}`,
      });
      toast.success("Atualizado com sucesso ✅");
      setReasonModal(null);
    } catch {
      toast.error("Erro ao atualizar. Tente novamente.");
    } finally {
      setSaving(null);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {actions
          .filter((a) => a.status !== activation.status)
          .map((a) => (
            <Button
              key={a.status}
              variant={a.variant}
              size="sm"
              className="h-7 text-xs transition-all duration-200 hover:scale-105 active:scale-95"
              onClick={(e) => { e.stopPropagation(); handle(a.status); }}
              disabled={saving !== null}
            >
              <a.icon className="h-3 w-3 mr-1" />
              {saving === a.status ? "Salvando…" : a.label}
            </Button>
          ))}
      </div>

      <Dialog open={!!reasonModal} onOpenChange={(o) => !o && setReasonModal(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {reasonModal?.status === "Finalizado" ? "Finalizar PR" : "Cancelar PR"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Informe o motivo para {reasonModal?.status === "Finalizado" ? "finalizar" : "cancelar"} esta PR:</p>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Motivo obrigatório..."
            className="min-h-[80px]"
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setReasonModal(null)}>Voltar</Button>
            <Button size="sm" onClick={confirmWithReason} disabled={saving !== null}>
              {saving ? "Salvando…" : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
