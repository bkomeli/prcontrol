import { useState, useEffect } from "react";
import type { Activation, ActivationLog } from "@/types/activation";
import { SINISTRO_MOTIVOS } from "@/types/activation";
import { useActivations } from "@/context/ActivationContext";
import { useEquipes } from "@/hooks/useCadastros";
import { useTransportadoras, useMotivos } from "@/hooks/useCadastros";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { QuickActions } from "@/components/QuickActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Save, X, AlertTriangle, Clock, ScrollText, MapPin, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { STATUS_LIST } from "@/types/activation";

export function DetailModal({ activation, open, onOpenChange }: { activation: Activation | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { updateActivation, getLogs } = useActivations();
  const { items: equipes } = useEquipes();
  const { items: transportadoras } = useTransportadoras();
  const { items: motivos } = useMotivos();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [logs, setLogs] = useState<ActivationLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    if (!open || !activation) return;
    setEditing(false);
    setForm({});
    setShowLogs(false);
    setLogs([]);
  }, [open, activation?.id]);

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
      equipe: a.equipe || "__none__",
      responsavel: a.responsavel || "",
      status: a.status,
      observacoes: a.observacoes || "",
      sinistro: a.sinistro,
      pacotes: String(a.pacotes || 0),
      cidade: a.cidade || "",
    });
    setEditing(true);
  };

  const cancelEdit = () => { setEditing(false); setForm({}); };

  const onField = (key: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "motivo" ? { sinistro: SINISTRO_MOTIVOS.has(String(value).toUpperCase()) || prev.sinistro } : {}),
    }));
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
        equipe: form.equipe === "__none__" ? undefined : form.equipe || undefined,
        responsavel: form.responsavel || undefined,
        status: form.status as any,
        observacoes: form.observacoes,
        sinistro: form.sinistro,
        pacotes: Number(form.pacotes || 0),
        cidade: form.cidade,
      });
      toast.success("Atualizado com sucesso ✅");
      setEditing(false);
    } catch {
      toast.error("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const loadLogs = async () => {
    if (showLogs) { setShowLogs(false); return; }
    const data = await getLogs(a.id);
    setLogs(data);
    setShowLogs(true);
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

  const openGoogleMaps = (latLong: string) => {
    const [lat, lng] = latLong.split(",").map((s) => s.trim());
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  };

  const editableFields: { key: string; label: string; type: "text" | "select" | "textarea" | "number"; options?: { value: string; label: string }[] }[] = [
    { key: "sm", label: "SM", type: "text" },
    { key: "transportador", label: "Transportador", type: "select", options: transportadoras.map((t) => ({ value: t.nome, label: t.nome })) },
    { key: "cavalo", label: "Cavalo", type: "text" },
    { key: "carreta", label: "Carreta", type: "text" },
    { key: "latLong", label: "Lat / Long", type: "text" },
    { key: "cidade", label: "Cidade", type: "text" },
    { key: "armado", label: "Armado", type: "select", options: [{ value: "AMBOS", label: "AMBOS" }, { value: "SIM", label: "SIM" }, { value: "NÃO", label: "NÃO" }] },
    { key: "motivo", label: "Motivo", type: "select", options: motivos.map((m) => ({ value: m.nome, label: m.nome })) },
    { key: "autorizadoPor", label: "Autorizado por", type: "text" },
    { key: "resumo", label: "Resumo", type: "text" },
    { key: "equipe", label: "Equipe", type: "select", options: [{ value: "__none__", label: "—" }, ...equipes.map((e) => ({ value: e.nome, label: e.nome }))] },
    { key: "responsavel", label: "Responsável", type: "text" },
    { key: "pacotes", label: "Pacotes", type: "number" },
    { key: "status", label: "Status", type: "select", options: STATUS_LIST.map((s) => ({ value: s, label: s })) },
    { key: "observacoes", label: "Observações", type: "textarea" },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) cancelEdit(); onOpenChange(o); }}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            SM {a.sm}
            <StatusBadge status={a.status} />
            {a.urgente && <Badge variant="destructive" className="text-[10px]">URGENTE</Badge>}
            {a.sinistro && <Badge className="text-[10px] bg-orange-600 text-white">SINISTRO</Badge>}
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
                <div key={f.key} className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground w-32 shrink-0 pt-2">{f.label}:</span>
                  {f.type === "textarea" ? (
                    <Textarea value={form[f.key] || ""} onChange={(e) => onField(f.key, e.target.value)} className="text-sm flex-1 min-h-[60px]" />
                  ) : f.type === "number" ? (
                    <Input type="number" value={form[f.key] || ""} onChange={(e) => onField(f.key, e.target.value)} className="h-8 text-sm flex-1" />
                  ) : f.type === "text" ? (
                    <Input value={form[f.key] || ""} onChange={(e) => onField(f.key, e.target.value)} className="h-8 text-sm flex-1" />
                  ) : (
                    <Select value={form[f.key] || ""} onValueChange={(v) => onField(f.key, v)}>
                      <SelectTrigger className="h-8 text-sm flex-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {f.options?.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground w-32 shrink-0">Sinistro:</span>
                <Checkbox checked={!!form.sinistro} onCheckedChange={(c) => onField("sinistro", !!c)} />
                <Label className="text-sm">É sinistro?</Label>
              </div>
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
                const value = f.key === "equipe" ? (a.equipe || "—") : f.key === "responsavel" ? (a.responsavel || "—") : f.key === "pacotes" ? String(a.pacotes || 0) : (a as any)[f.key] || "—";
                return (
                  <div key={f.key} className="flex gap-2 text-sm">
                    <span className="text-muted-foreground w-32 shrink-0">{f.label}:</span>
                    {f.key === "cidade" && a.cidade && a.latLong ? (
                      <button
                        onClick={() => openGoogleMaps(a.latLong)}
                        className="text-primary font-medium flex items-center gap-1 hover:underline transition-colors duration-200"
                      >
                        <MapPin className="h-3 w-3" /> {a.cidade}
                        <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                      </button>
                    ) : (
                      <span className="text-foreground font-medium">{value}</span>
                    )}
                  </div>
                );
              })}
              <div className="flex gap-2 text-sm">
                <span className="text-muted-foreground w-32 shrink-0">Sinistro:</span>
                <span className={`font-medium ${a.sinistro ? "text-orange-500" : "text-foreground"}`}>
                  {a.sinistro ? "⚠️ Sim" : "Não"}
                </span>
              </div>
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

        <div className="pt-2 border-t border-border">
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 w-full" onClick={loadLogs}>
            <ScrollText className="h-3 w-3" /> {showLogs ? "Ocultar Log" : "Ver Log de Alterações"}
          </Button>
          {showLogs && (
            <div className="mt-2 space-y-2 max-h-[200px] overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">Nenhum registro</p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="border-l-2 border-primary/40 pl-3 py-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">{log.acao}</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {formatDate(log.criado_em)}
                      </span>
                    </div>
                    {log.detalhes && <p className="text-[11px] text-muted-foreground mt-0.5">{log.detalhes}</p>}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
