import { useState, useCallback, useMemo } from "react";
import { useActivations } from "@/context/ActivationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Zap, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const initialForm = {
  sm: "", transportador: "", cavalo: "", carreta: "",
  latLong: "", armado: "", motivo: "", autorizadoPor: "", resumo: "",
};

export function NewActivationForm() {
  const [form, setForm] = useState(initialForm);
  const [urgente, setUrgente] = useState(false);
  const { activations, addActivation } = useActivations();

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // Autocomplete suggestions
  const transportadorSuggestions = useMemo(() => {
    const unique = new Set(activations.map((a) => a.transportador).filter(Boolean));
    return Array.from(unique);
  }, [activations]);

  const motivoSuggestions = useMemo(() => {
    const unique = new Set(activations.map((a) => a.motivo).filter(Boolean));
    return Array.from(unique);
  }, [activations]);

  const handleSubmit = useCallback(() => {
    if (!form.sm || !form.motivo) {
      toast.error("SM e Motivo são obrigatórios");
      return;
    }

    // Generate script
    const script = `SM: ${form.sm}
Transportador: ${form.transportador}
Cavalo: ${form.cavalo}
Carreta: ${form.carreta}
Lat / long: ${form.latLong}
Armado? ${form.armado}
Motivo do acionamento: ${form.motivo}
Autorizado por quem? ${form.autorizadoPor}
Breve resumo: ${form.resumo}`;

    // Copy script
    navigator.clipboard.writeText(script);

    // Save to queue
    addActivation({ ...form, urgente });
    setForm(initialForm);
    setUrgente(false);
    toast.success("PR criada! Script copiado automaticamente.");
  }, [form, urgente, addActivation]);

  const fields = [
    { key: "sm", label: "SM", placeholder: "Número da SM" },
    { key: "transportador", label: "Transportador", placeholder: "Nome do transportador", list: "transportador-list" },
    { key: "cavalo", label: "Cavalo", placeholder: "Placa do cavalo" },
    { key: "carreta", label: "Carreta", placeholder: "Placa da carreta" },
    { key: "latLong", label: "Lat / Long", placeholder: "-23.5505, -46.6333" },
    { key: "armado", label: "Armado", placeholder: "Sim / Não / Detalhes" },
    { key: "motivo", label: "Motivo do acionamento", placeholder: "Descreva o motivo", list: "motivo-list" },
    { key: "autorizadoPor", label: "Autorizado por quem", placeholder: "Nome do autorizador" },
  ];

  return (
    <Card className="p-5 shadow-sm border-border">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Zap className="h-5 w-5 text-primary" />
        Novo Acionamento
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {fields.map(({ key, label, placeholder, list }) => (
          <div key={key} className={key === "motivo" ? "col-span-2" : ""}>
            <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
            <Input
              value={(form as any)[key]}
              onChange={set(key)}
              placeholder={placeholder}
              className="mt-1 h-8 text-sm"
              list={list}
            />
          </div>
        ))}
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

      {/* Datalists for autocomplete */}
      <datalist id="transportador-list">
        {transportadorSuggestions.map((s) => <option key={s} value={s} />)}
      </datalist>
      <datalist id="motivo-list">
        {motivoSuggestions.map((s) => <option key={s} value={s} />)}
      </datalist>
    </Card>
  );
}
