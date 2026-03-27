import { useState, useCallback, useEffect } from "react";
import { useActivations } from "@/context/ActivationContext";
import { useTransportadoras, useMotivos } from "@/hooks/useCadastros";
import { SINISTRO_MOTIVOS } from "@/types/activation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, AlertTriangle, MapPin, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const initialForm = {
  sm: "", transportador: "", cavalo: "", carreta: "",
  latLong: "", armado: "AMBOS", motivo: "", autorizadoPor: "", resumo: "",
  cidade: "",
};

async function reverseGeocode(latLong: string): Promise<string> {
  try {
    const [lat, lng] = latLong.split(",").map((s) => s.trim());
    if (!lat || !lng || isNaN(Number(lat)) || isNaN(Number(lng))) return "";
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=pt`);
    const data = await res.json();
    const city = data?.address?.city || data?.address?.town || data?.address?.municipality || data?.address?.village || "";
    const state = data?.address?.state || "";
    return city ? `${city}${state ? `-${state}` : ""}` : "";
  } catch {
    return "";
  }
}

export function NewActivationForm() {
  const [form, setForm] = useState(initialForm);
  const [urgente, setUrgente] = useState(false);
  const [sinistro, setSinistro] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const { addActivation } = useActivations();
  const { items: transportadoras } = useTransportadoras();
  const { items: motivos } = useMotivos();

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const setField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "motivo") {
      if (SINISTRO_MOTIVOS.has(value.toUpperCase())) setSinistro(true);
    }
  };

  // Auto reverse geocode
  useEffect(() => {
    if (!form.latLong || form.latLong.split(",").length < 2) return;
    setGeocoding(true);
    const timeout = setTimeout(async () => {
      const cidade = await reverseGeocode(form.latLong);
      if (cidade) setForm((prev) => ({ ...prev, cidade }));
      setGeocoding(false);
    }, 800);
    return () => { clearTimeout(timeout); setGeocoding(false); };
  }, [form.latLong]);

  const openGoogleMaps = () => {
    if (!form.latLong) return;
    const [lat, lng] = form.latLong.split(",").map((s) => s.trim());
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  };

  const handleSubmit = useCallback(() => {
    const requiredFields = [
      { key: "sm", label: "SM" },
      { key: "transportador", label: "Transportador" },
      { key: "cavalo", label: "Cavalo" },
      { key: "carreta", label: "Carreta" },
      { key: "latLong", label: "Lat / Long" },
      { key: "armado", label: "Armado" },
      { key: "motivo", label: "Motivo" },
      { key: "autorizadoPor", label: "Autorizado por" },
    ];

    const missing = requiredFields.filter((f) => !form[f.key as keyof typeof form]?.trim());
    if (missing.length > 0) {
      toast.error(`Campos obrigatórios: ${missing.map((f) => f.label).join(", ")}`);
      return;
    }

    const script = `SM: ${form.sm}
Transportador: ${form.transportador}
Cavalo: ${form.cavalo}
Carreta: ${form.carreta}
Lat / long: ${form.latLong}${form.cidade ? ` (${form.cidade})` : ""}
Armado? ${form.armado}
Motivo do acionamento: ${form.motivo}
Autorizado por quem? ${form.autorizadoPor}
Breve resumo: ${form.resumo || "—"}${sinistro ? "\n⚠️ SINISTRO" : ""}`;

    navigator.clipboard.writeText(script);
    addActivation({
      ...form,
      observacoes: "",
      urgente,
      sinistro,
      pacotes: 0,
    });
    setForm(initialForm);
    setUrgente(false);
    setSinistro(false);
    toast.success("PR criada! Script copiado automaticamente.");
  }, [form, urgente, sinistro, addActivation]);

  // ENTER key no longer submits the form - only the button does

  return (
    <Card className="p-5 shadow-sm border-border">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Zap className="h-5 w-5 text-primary" />
        Novo Acionamento
      </h2>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs font-medium text-muted-foreground">SM *</Label>
          <Input value={form.sm} onChange={set("sm")} placeholder="Número da SM" className="mt-1 h-8 text-sm" />
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Lat / Long *</Label>
          <Input value={form.latLong} onChange={set("latLong")} placeholder="-23.5505, -46.6333" className="mt-1 h-8 text-sm" />
        </div>

        {(form.cidade || geocoding) && (
          <div className="col-span-2">
            {geocoding ? (
              <span className="text-xs text-muted-foreground">Identificando cidade...</span>
            ) : (
              <button
                type="button"
                onClick={openGoogleMaps}
                className="text-xs text-primary font-medium flex items-center gap-1 hover:underline transition-colors duration-200 cursor-pointer"
              >
                <MapPin className="h-3 w-3" /> {form.cidade}
                <ExternalLink className="h-2.5 w-2.5 opacity-60" />
              </button>
            )}
          </div>
        )}

        <div>
          <Label className="text-xs font-medium text-muted-foreground">Cavalo *</Label>
          <Input value={form.cavalo} onChange={set("cavalo")} placeholder="Placa do cavalo" className="mt-1 h-8 text-sm" />
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Carreta *</Label>
          <Input value={form.carreta} onChange={set("carreta")} placeholder="Placa da carreta" className="mt-1 h-8 text-sm" />
        </div>

        <div>
          <Label className="text-xs font-medium text-muted-foreground">Transportador *</Label>
          <Select value={form.transportador} onValueChange={(v) => setField("transportador", v)}>
            <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue placeholder="Selecionar" /></SelectTrigger>
            <SelectContent>
              {transportadoras.map((t) => <SelectItem key={t.id} value={t.nome}>{t.nome}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Armado *</Label>
          <Select value={form.armado} onValueChange={(v) => setField("armado", v)}>
            <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="AMBOS">AMBOS</SelectItem>
              <SelectItem value="SIM">SIM</SelectItem>
              <SelectItem value="NÃO">NÃO</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2">
          <Label className="text-xs font-medium text-muted-foreground">Autorizado por quem *</Label>
          <Input value={form.autorizadoPor} onChange={set("autorizadoPor")} placeholder="Nome do autorizador" className="mt-1 h-8 text-sm" />
        </div>

        <div className="col-span-2">
          <Label className="text-xs font-medium text-muted-foreground">Motivo do acionamento *</Label>
          <Select value={form.motivo} onValueChange={(v) => setField("motivo", v)}>
            <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue placeholder="Selecionar motivo" /></SelectTrigger>
            <SelectContent>
              {motivos.map((m) => <SelectItem key={m.id} value={m.nome}>{m.nome}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2">
          <Label className="text-xs font-medium text-muted-foreground">Breve resumo (opcional)</Label>
          <Textarea value={form.resumo} onChange={set("resumo")} placeholder="Resumo da situação" className="mt-1 text-sm min-h-[60px]" />
        </div>

        <div className="col-span-2 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox id="urgente" checked={urgente} onCheckedChange={(c) => setUrgente(!!c)} />
            <Label htmlFor="urgente" className="text-sm text-destructive font-medium flex items-center gap-1 cursor-pointer">
              <AlertTriangle className="h-3.5 w-3.5" /> Urgente
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="sinistro" checked={sinistro} onCheckedChange={(c) => setSinistro(!!c)} />
            <Label htmlFor="sinistro" className="text-sm text-orange-500 font-medium cursor-pointer">
              ⚠️ Sinistro
            </Label>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Button size="sm" onClick={handleSubmit} className="ml-auto">
          <Zap className="h-3.5 w-3.5 mr-1" /> Acionar PR
        </Button>
      </div>
    </Card>
  );
}
