import { useState, useCallback } from "react";
import { useActivations } from "@/context/ActivationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { FileText, Copy, Zap } from "lucide-react";
import { toast } from "sonner";

const initialForm = {
  sm: "", transportador: "", cavalo: "", carreta: "",
  latLong: "", armado: "", motivo: "", autorizadoPor: "", resumo: "",
};

export function NewActivationForm() {
  const [form, setForm] = useState(initialForm);
  const [script, setScript] = useState("");
  const { addActivation } = useActivations();

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const generateScript = useCallback(() => {
    const s = `SM: ${form.sm}
Transportador: ${form.transportador}
Cavalo: ${form.cavalo}
Carreta: ${form.carreta}
Lat / long: ${form.latLong}
Armado? ${form.armado}
Motivo do acionamento: ${form.motivo}
Autorizado por quem? ${form.autorizadoPor}
Breve resumo: ${form.resumo}`;
    setScript(s);
    toast.success("Script gerado!");
  }, [form]);

  const copyScript = useCallback(() => {
    if (!script) {
      toast.error("Gere o script primeiro");
      return;
    }
    navigator.clipboard.writeText(script);
    toast.success("Script copiado!");
  }, [script]);

  const handleSubmit = useCallback(() => {
    if (!form.sm || !form.motivo) {
      toast.error("SM e Motivo são obrigatórios");
      return;
    }
    addActivation(form);
    setForm(initialForm);
    setScript("");
    toast.success("Acionamento criado!");
  }, [form, addActivation]);

  const fields = [
    { key: "sm", label: "SM", placeholder: "Número da SM" },
    { key: "transportador", label: "Transportador", placeholder: "Nome do transportador" },
    { key: "cavalo", label: "Cavalo", placeholder: "Placa do cavalo" },
    { key: "carreta", label: "Carreta", placeholder: "Placa da carreta" },
    { key: "latLong", label: "Lat / Long", placeholder: "-23.5505, -46.6333" },
    { key: "armado", label: "Armado", placeholder: "Sim / Não / Detalhes" },
    { key: "motivo", label: "Motivo do acionamento", placeholder: "Descreva o motivo" },
    { key: "autorizadoPor", label: "Autorizado por quem", placeholder: "Nome do autorizador" },
  ];

  return (
    <Card className="p-5 shadow-sm border-border">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Zap className="h-5 w-5 text-primary" />
        Novo Acionamento
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {fields.map(({ key, label, placeholder }) => (
          <div key={key} className={key === "motivo" ? "col-span-2" : ""}>
            <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
            <Input
              value={(form as any)[key]}
              onChange={set(key)}
              placeholder={placeholder}
              className="mt-1 h-8 text-sm"
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
      </div>

      <div className="flex gap-2 mt-4">
        <Button variant="outline" size="sm" onClick={generateScript}>
          <FileText className="h-3.5 w-3.5 mr-1" />
          Gerar Script
        </Button>
        <Button variant="outline" size="sm" onClick={copyScript}>
          <Copy className="h-3.5 w-3.5 mr-1" />
          Copiar Script
        </Button>
        <Button size="sm" onClick={handleSubmit} className="ml-auto">
          <Zap className="h-3.5 w-3.5 mr-1" />
          Acionar PR
        </Button>
      </div>

      {script && (
        <pre className="mt-3 p-3 rounded-md bg-muted text-xs font-mono text-foreground whitespace-pre-wrap border border-border">
          {script}
        </pre>
      )}
    </Card>
  );
}
