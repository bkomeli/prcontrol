import { useState, useCallback, useEffect } from "react";
import { useActivations } from "@/context/ActivationContext";
import { useTransportadoras } from "@/hooks/useCadastros";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, Plus, Trash2, MapPin, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface VehicleForm {
  sm: string;
  placaCavalo: string;
  placaCarreta: string;
  destino: string;
  transportadora: string;
}

const emptyVehicle = (): VehicleForm => ({
  sm: "", placaCavalo: "", placaCarreta: "", destino: "", transportadora: "",
});

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

export function NewEscoltaForm() {
  const [origem, setOrigem] = useState("");
  const [latLong, setLatLong] = useState("");
  const [autorizadoPor, setAutorizadoPor] = useState("");
  const [cidade, setCidade] = useState("");
  const [geocoding, setGeocoding] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleForm[]>([emptyVehicle()]);
  const { addActivation } = useActivations();
  const { items: transportadoras } = useTransportadoras();

  useEffect(() => {
    if (!latLong || latLong.split(",").length < 2) return;
    setGeocoding(true);
    const timeout = setTimeout(async () => {
      const c = await reverseGeocode(latLong);
      if (c) setCidade(c);
      setGeocoding(false);
    }, 800);
    return () => { clearTimeout(timeout); setGeocoding(false); };
  }, [latLong]);

  const openGoogleMaps = () => {
    if (!latLong) return;
    const [lat, lng] = latLong.split(",").map((s) => s.trim());
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  };

  const updateVehicle = (index: number, field: keyof VehicleForm, value: string) => {
    setVehicles((prev) => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
  };

  const addVehicle = () => setVehicles((prev) => [...prev, emptyVehicle()]);

  const removeVehicle = (index: number) => {
    if (vehicles.length <= 1) return;
    setVehicles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = useCallback(async () => {
    if (!origem.trim()) { toast.error("Campo obrigatório: Origem"); return; }
    if (!latLong.trim()) { toast.error("Campo obrigatório: Lat / Long"); return; }
    if (!autorizadoPor.trim()) { toast.error("Campo obrigatório: Autorizado por"); return; }

    const invalidVehicles = vehicles.filter((v) => !v.sm.trim());
    if (invalidVehicles.length > 0) {
      toast.error("Cada veículo deve ter um número de SM");
      return;
    }

    // Create activation record
    const now = new Date().toISOString();
    const { data: inserted, error } = await supabase.from("activations").insert({
      sm: vehicles.map((v) => v.sm).join(", "),
      transportador: vehicles.map((v) => v.transportadora).filter(Boolean).join(", ") || "—",
      cavalo: vehicles.map((v) => v.placaCavalo).filter(Boolean).join(", ") || "—",
      carreta: vehicles.map((v) => v.placaCarreta).filter(Boolean).join(", ") || "—",
      lat_long: latLong,
      armado: "SIM",
      motivo: "ESCOLTA",
      autorizado_por: autorizadoPor,
      resumo: `Escolta com ${vehicles.length} veículo(s) — Origem: ${origem}`,
      urgente: false,
      observacoes: "",
      sinistro: false,
      pacotes: 0,
      cidade: cidade,
      type: "escolta",
      origem: origem,
    } as any).select().single();

    if (error || !inserted) {
      toast.error("Erro ao criar escolta");
      return;
    }

    // Insert vehicles
    const vehicleInserts = vehicles.map((v) => ({
      activation_id: (inserted as any).id,
      sm: v.sm,
      placa_cavalo: v.placaCavalo,
      placa_carreta: v.placaCarreta,
      destino: v.destino,
      transportadora: v.transportadora,
    }));

    await supabase.from("vehicles").insert(vehicleInserts as any);

    // Generate script for clipboard
    const vehicleLines = vehicles.map((v) =>
      `SM: ${v.sm}\nCavalo: ${v.placaCavalo || "—"}\nCarreta: ${v.placaCarreta || "—"}\nDestino: ${v.destino || "—"}\nTransp: ${v.transportadora || "—"}`
    ).join("\n\n");

    const script = `🚛 ESCOLTA INICIADA\n\n📍 Origem: ${origem}\n\n🚗 Veículos:\n${vehicleLines}\n\n📍 Localização:\nhttps://www.google.com/maps?q=${latLong.replace(/\s/g, "")}`;

    navigator.clipboard.writeText(script);

    // Add log
    await supabase.from("activation_logs").insert({
      activation_id: (inserted as any).id,
      acao: "Escolta criada",
      detalhes: `${vehicles.length} veículo(s) | Origem: ${origem}`,
    } as any);

    // Reset
    setOrigem("");
    setLatLong("");
    setAutorizadoPor("");
    setCidade("");
    setVehicles([emptyVehicle()]);
    toast.success(`Escolta criada com ${vehicles.length} veículo(s)! Script copiado.`);
  }, [origem, latLong, autorizadoPor, cidade, vehicles]);

  return (
    <Card className="p-5 shadow-sm border-border">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        Nova Escolta
      </h2>

      {/* Global fields */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Origem *</Label>
          <Input value={origem} onChange={(e) => setOrigem(e.target.value)} placeholder="Cidade/local de origem" className="mt-1 h-8 text-sm" />
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Lat / Long *</Label>
          <Input value={latLong} onChange={(e) => setLatLong(e.target.value)} placeholder="-23.5505, -46.6333" className="mt-1 h-8 text-sm" />
        </div>

        {(cidade || geocoding) && (
          <div className="col-span-2">
            {geocoding ? (
              <span className="text-xs text-muted-foreground">Identificando cidade...</span>
            ) : (
              <button type="button" onClick={openGoogleMaps} className="text-xs text-primary font-medium flex items-center gap-1 hover:underline cursor-pointer">
                <MapPin className="h-3 w-3" /> {cidade}
                <ExternalLink className="h-2.5 w-2.5 opacity-60" />
              </button>
            )}
          </div>
        )}

        <div className="col-span-2">
          <Label className="text-xs font-medium text-muted-foreground">Autorizado por *</Label>
          <Input value={autorizadoPor} onChange={(e) => setAutorizadoPor(e.target.value)} placeholder="Nome do autorizador" className="mt-1 h-8 text-sm" />
        </div>

        <div className="col-span-2">
          <div className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1 inline-flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Armado: <span className="font-semibold text-foreground">SIM</span> (fixo para escoltas)
          </div>
        </div>
      </div>

      {/* Vehicles section */}
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">🚗 Veículos ({vehicles.length})</h3>
          <Button type="button" size="sm" variant="outline" onClick={addVehicle} className="h-7 text-xs">
            <Plus className="h-3 w-3 mr-1" /> Adicionar veículo
          </Button>
        </div>

        {vehicles.map((v, i) => (
          <Card key={i} className="p-3 border-dashed">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground">Veículo {i + 1}</span>
              {vehicles.length > 1 && (
                <Button type="button" size="sm" variant="ghost" onClick={() => removeVehicle(i)} className="h-6 w-6 p-0 text-destructive hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">SM *</Label>
                <Input value={v.sm} onChange={(e) => updateVehicle(i, "sm", e.target.value)} placeholder="Número da SM" className="mt-1 h-7 text-xs" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Placa Cavalo</Label>
                <Input value={v.placaCavalo} onChange={(e) => updateVehicle(i, "placaCavalo", e.target.value)} placeholder="Placa" className="mt-1 h-7 text-xs" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Placa Carreta</Label>
                <Input value={v.placaCarreta} onChange={(e) => updateVehicle(i, "placaCarreta", e.target.value)} placeholder="Placa" className="mt-1 h-7 text-xs" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Destino</Label>
                <Input value={v.destino} onChange={(e) => updateVehicle(i, "destino", e.target.value)} placeholder="Cidade destino" className="mt-1 h-7 text-xs" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs text-muted-foreground">Transportadora</Label>
                <Select value={v.transportadora} onValueChange={(val) => updateVehicle(i, "transportadora", val)}>
                  <SelectTrigger className="mt-1 h-7 text-xs"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    {transportadoras.map((t) => <SelectItem key={t.id} value={t.nome}>{t.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <Button size="sm" onClick={handleSubmit} className="ml-auto">
          <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Iniciar Escolta
        </Button>
      </div>
    </Card>
  );
}
