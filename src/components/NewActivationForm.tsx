import { useState, useCallback, useEffect } from "react";
import { useActivations } from "@/context/ActivationContext";
import { useTransportadoras, useMotivos } from "@/hooks/useCadastros";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const initialForm = {
  sm: "", transportador: "", cavalo: "", carreta: "",
  latLong: "", armado: "AMBOS", motivo: "", autorizadoPor: "", resumo: "",
};

export function NewActivationForm() {
  const [form, setForm] = useState(initialForm);
  const [urgente, setUrgente] = useState(false);
  const { addActivation } = useActivations();
  const { items: transportadoras } = useTransportadoras();
  const { items: motivos } = useMotivos();

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const setField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = useCallback(() => {
    if (!form.sm || !form.motivo) {
      toast.error("SM e Motivo são obrigatórios");
      return;
    }

    const script = `SM: ${form.sm}
Transportador: ${form.transportador}
Cavalo: ${form.cavalo}
Carreta: ${form.carreta}
Lat / long: ${form.latLong}
Armado? ${form.armado}
Motivo do acionamento: ${form.motivo}
Autorizado por quem? ${form.autorizadoPor}
Breve resumo: ${form.resumo}`;

    navigator.clipboard.writeText(script);
    addActivation({ ...form, urgente });
    setForm(initialForm);
    setUrgente(false);
    toast.success("PR criada! Script copiado automaticamente.");
  }, [form, urgente, addActivation]);

  // Keyboard shortcut: Enter to save (when not in textarea)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && (e.target as HTMLElement)?.tagName !== "TEXTAREA") {
        e.preventDefault();
        handleSubmit();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handleSubmit]);

  return (
    <Card className="p-5 shadow-sm border-border">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Zap className="h-5 w-5 text-primary" />
        Novo Acionamento
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {/* Row 1: SM | Lat/Long */}
        <div>
          <Label className="text-xs font-medium text-muted-foreground">SM</Label>
          <Input value={form.sm} onChange={set("sm")} placeholder="Número da SM" className="mt-1 h-8 text-sm" />
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Lat / Long</Label>
          <Input value={form.latLong} onChange={set("latLong")} placeholder="-23.5505, -46.6333" className="mt-1 h-8 text-sm" />
        </div>

        {/* Row 2: Cavalo | Carreta */}
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Cavalo</Label>
          <Input value={form.cavalo} onChange={set("cavalo")} placeholder="Placa do cavalo" className="mt-1 h-8 text-sm" />
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Carreta</Label>
          <Input value={form.carreta} onChange={set("carreta")} placeholder="Placa da carreta" className="mt-1 h-8 text-sm" />
        </div>

        {/* Row 3: Transportador | Armado */}
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Transportador</Label>
          <Select value={form.transportador} onValueChange={(v) => setField("transportador", v)}>
            <SelectTrigger className="mt-1 h-8 text-sm">
              <SelectValue placeholder="Selecionar transportador" />
            </SelectTrigger>
            <SelectContent>
              {transportadoras.map((t) => (
                <SelectItem key={t.id} value={t.nome}>{t.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Armado</Label>
          <Select value={form.armado} onValueChange={(v) => setField("armado", v)}>
            <SelectTrigger className="mt-1 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AMBOS">AMBOS</SelectItem>
              <SelectItem value="SIM">SIM</SelectItem>
              <SelectItem value="NÃO">NÃO</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Row 4: Autorizado por (full width below armado) */}
        <div className="col-span-2">
          <Label className="text-xs font-medium text-muted-foreground">Autorizado por quem</Label>
          <Input value={form.autorizadoPor} onChange={set("autorizadoPor")} placeholder="Nome do autorizador" className="mt-1 h-8 text-sm" />
        </div>

        {/* Motivo select */}
        <div className="col-span-2">
          <Label className="text-xs font-medium text-muted-foreground">Motivo do acionamento</Label>
          <Select value={form.motivo} onValueChange={(v) => setField("motivo", v)}>
            <SelectTrigger className="mt-1 h-8 text-sm">
              <SelectValue placeholder="Selecionar motivo" />
            </SelectTrigger>
            <SelectContent>
              {motivos.map((m) => (
                <SelectItem key={m.id} value={m.nome}>{m.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2">
          <Label className="text-xs font-medium text-muted-foreground">Breve resumo</Label>
          <Textarea
            value={form.resumo}
            onChange={set("resumo")}
            placeholder="Resumo da situação"
            className="mt-1 text-sm min-h-[60px]"
          />
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <Checkbox
            id="urgente"
            checked={urgente}
            onCheckedChange={(c) => setUrgente(!!c)}
          />
          <Label htmlFor="urgente" className="text-sm text-destructive font-medium flex items-center gap-1 cursor-pointer">
            <AlertTriangle className="h-3.5 w-3.5" />
            Urgente
          </Label>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Button size="sm" onClick={handleSubmit} className="ml-auto">
          <Zap className="h-3.5 w-3.5 mr-1" />
          Acionar PR
        </Button>
      </div>
    </Card>
  );
}
