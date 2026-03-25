import { useState } from "react";
import type { Activation } from "@/types/activation";
import { useActivations } from "@/context/ActivationContext";
import { useEquipes } from "@/hooks/useCadastros";
import { useTransportadoras, useMotivos } from "@/hooks/useCadastros";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { QuickActions } from "@/components/QuickActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Save, X } from "lucide-react";
import { toast } from "sonner";
import { STATUS_LIST } from "@/types/activation";

export function DetailModal({ activation, open, onOpenChange }: { activation: Activation | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { updateActivation } = useActivations();
  const { items: equipes } = useEquipes();
  const { items: transportadoras } = useTransportadoras();
  const { items: motivos } = useMotivos();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  if (!activation) return null;
  const a = activation;

  const startEdit = () => {
    setForm({
      sm: a.sm,
      transportador: a.transportador,
      cavalo: a.cavalo,
      carreta: a.carreta,
      latLong: a.latLong,
      armado: a.armado,
      motivo: a.motivo,
      autorizadoPor: a.autorizadoPor,
      resumo: a.resumo,
      equipe: a.equipe || "",
      responsavel: a.responsavel || "",
      status: a.status,
    });
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setForm({});
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await updateActivation(a.id, {
        sm: form.sm,
        transportador: form.transportador,
        cavalo: form.cavalo,
        carreta: form.carreta,
        latLong: form.latLong,
        armado: form.armado,
        motivo: form.motivo,
        autorizadoPor: form.autorizadoPor,
        resumo: form.resumo,
        equipe: form.equipe || undefined,
        responsavel: form.responsavel || undefined,
        status: form.status as any,
      });
      toast.success("Atualizado com sucesso ✅");
      setEditing(false);
    } catch {
      toast.error("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

  const editableFields: { key: string; label: string; type: "text" | "select"; options?: { value: string; label: string }[] }[] = [
    { key: "sm", label: "SM", type: "text" },
    { key: "transportador", label: "Transportador", type: "select", options: transportadoras.map((t) => ({ value: t.nome, label: t.nome })) },
    { key: "cavalo", label: "Cavalo", type: "text" },
    { key: "carreta", label: "Carreta", type: "text" },
    { key: "latLong", label: "Lat / Long", type: "text" },
    { key: "armado", label: "Armado", type: "select", options: [{ value: "AMBOS", label: "AMBOS" }, { value: "SIM", label: "SIM" }, { value: "NÃO", label: "NÃO" }] },
    { key: "motivo", label: "Motivo", type: "select", options: motivos.map((m) => ({ value: m.nome, label: m.nome })) },
    { key: "autorizadoPor", label: "Autorizado por", type: "text" },
    { key: "resumo", label: "Resumo", type: "text" },
    { key: "equipe", label: "Equipe", type: "select", options: [{ value: "", label: "—" }, ...equipes.map((e) => ({ value: e.nome, label: e.nome }))] },
    { key: "responsavel", label: "Responsável", type: "text" },
    { key: "status", label: "Status", type: "select", options: STATUS_LIST.map((s) => ({ value: s, label: s })) },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) cancelEdit(); onOpenChange(o); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            SM {a.sm}
            <StatusBadge status={a.status} />
            {a.urgente && <Badge variant="destructive" className="text-[10px]">URGENTE</Badge>}
            {!editing && (
              <Button variant="ghost" size="sm" className="ml-auto h-7 text-xs gap-1 transition-colors duration-200" onClick={startEdit}>
                <Pencil className="h-3 w-3" /> Editar
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2.5">
          {editing ? (
            <>
              {editableFields.map((f) => (
                <div key={f.key} className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground w-32 shrink-0">{f.label}:</span>
                  {f.type === "text" ? (
                    <Input
                      value={form[f.key] || ""}
                      onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                      className="h-8 text-sm flex-1"
                    />
                  ) : (
                    <Select value={form[f.key] || ""} onValueChange={(v) => setForm((p) => ({ ...p, [f.key]: v }))}>
                      <SelectTrigger className="h-8 text-sm flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {f.options?.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1 h-8 text-xs gap-1" onClick={saveEdit} disabled={saving}>
                  <Save className="h-3 w-3" /> {saving ? "Salvando…" : "Salvar"}
                </Button>
                <Button variant="outline" size="sm" className="flex-1 h-8 text-xs gap-1" onClick={cancelEdit} disabled={saving}>
                  <X className="h-3 w-3" /> Cancelar
                </Button>
              </div>
            </>
          ) : (
            <>
              {editableFields.map((f) => {
                const value = f.key === "equipe" ? (a.equipe || "—") : f.key === "responsavel" ? (a.responsavel || "—") : (a as any)[f.key] || "—";
                return (
                  <div key={f.key} className="flex gap-2 text-sm">
                    <span className="text-muted-foreground w-32 shrink-0">{f.label}:</span>
                    <span className="text-foreground font-medium">{value}</span>
                  </div>
                );
              })}
              <div className="flex gap-2 text-sm">
                <span className="text-muted-foreground w-32 shrink-0">Criado em:</span>
                <span className="text-foreground font-medium">{formatDate(a.criadoEm)}</span>
              </div>
              <div className="flex gap-2 text-sm">
                <span className="text-muted-foreground w-32 shrink-0">Atualizado em:</span>
                <span className="text-foreground font-medium">{formatDate(a.atualizadoEm)}</span>
              </div>
            </>
          )}
        </div>

        {!editing && a.status !== "Finalizado" && a.status !== "Cancelado" && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Ações rápidas</p>
            <QuickActions activation={a} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
