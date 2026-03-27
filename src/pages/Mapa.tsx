import { useState, useMemo, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";
import { useActivations } from "@/context/ActivationContext";
import { useDateFilter } from "@/context/DateFilterContext";
import { useEquipes } from "@/hooks/useCadastros";
import { DateFilter } from "@/components/DateFilter";
import { StatusBadge } from "@/components/StatusBadge";
import { DetailModal } from "@/components/DetailModal";
import { STATUS_LIST } from "@/types/activation";
import type { Activation, ActivationStatus } from "@/types/activation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MapPin, Crosshair, XCircle, Download, Image, Flame } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { toast } from "sonner";
import { toPng } from "html-to-image";
import "leaflet/dist/leaflet.css";

// Fix leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const STATUS_COLORS: Record<string, string> = {
  "Aguardando equipe": "#eab308",
  "Em deslocamento": "#3b82f6",
  "Em preservação": "#f97316",
  "Em varredura": "#a855f7",
  "Finalizado": "#22c55e",
  "Cancelado": "#ef4444",
};

function createIcon(status: string, sinistro: boolean) {
  if (sinistro) {
    return L.divIcon({
      className: "",
      html: `<div style="width:30px;height:30px;border-radius:50%;background:#dc2626;border:3px solid #fbbf24;box-shadow:0 0 12px 4px rgba(220,38,38,0.6);display:flex;align-items:center;justify-content:center;animation:pulse 1.5s ease-in-out infinite;">
        <span style="color:white;font-size:16px;font-weight:bold;">⚠</span>
      </div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  }
  const color = STATUS_COLORS[status] || "#6b7280";
  return L.divIcon({
    className: "",
    html: `<div style="width:24px;height:24px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function parseLatLong(latLong: string): [number, number] | null {
  if (!latLong) return null;
  const parts = latLong.split(",").map((s) => parseFloat(s.trim()));
  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return [parts[0], parts[1]];
  return null;
}

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions.map(([lat, lng]) => [lat, lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
  }, [positions, map]);
  return null;
}

function CenterButton({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  const center = () => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions.map(([lat, lng]) => [lat, lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
  };
  return (
    <div className="leaflet-top leaflet-right" style={{ zIndex: 1000 }}>
      <div className="leaflet-control" style={{ margin: "10px" }}>
        <Button size="sm" variant="secondary" className="h-8 text-xs gap-1 shadow-md" onClick={center}>
          <Crosshair className="h-3 w-3" /> Centralizar
        </Button>
      </div>
    </div>
  );
}

// Heatmap layer component
function HeatmapLayer({ positions, enabled }: { positions: [number, number][]; enabled: boolean }) {
  const map = useMap();
  const heatRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    // Remove existing layer first
    if (heatRef.current) {
      map.removeLayer(heatRef.current);
      heatRef.current = null;
    }

    if (!enabled || positions.length === 0) return;

    import("leaflet.heat").then(() => {
      const heatData = positions.map(([lat, lng]) => [lat, lng, 1] as [number, number, number]);
      const heat = (L as any).heatLayer(heatData, {
        radius: 30,
        blur: 20,
        maxZoom: 12,
        gradient: { 0.2: "#3b82f6", 0.5: "#eab308", 0.8: "#f97316", 1: "#ef4444" },
      }).addTo(map);
      heatRef.current = heat;
    });

    return () => {
      if (heatRef.current) {
        map.removeLayer(heatRef.current);
        heatRef.current = null;
      }
    };
  }, [map, positions, enabled]);

  return null;
}

function generateKML(activations: Activation[], dateRange: { from?: Date; to?: Date }): string {
  const fromStr = dateRange.from ? dateRange.from.toISOString().slice(0, 10) : "inicio";
  const toStr = dateRange.to ? dateRange.to.toISOString().slice(0, 10) : "fim";

  let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
<name>PRs_${fromStr}_a_${toStr}</name>
<description>Acionamentos de Pronta Resposta</description>
`;
  Object.entries(STATUS_COLORS).forEach(([status, color]) => {
    const hex = color.replace("#", "");
    const abgr = `ff${hex.slice(4, 6)}${hex.slice(2, 4)}${hex.slice(0, 2)}`;
    kml += `<Style id="${status.replace(/\s/g, "_")}"><IconStyle><color>${abgr}</color><scale>1.2</scale><Icon><href>http://maps.google.com/mapfiles/kml/paddle/wht-blank.png</href></Icon></IconStyle></Style>\n`;
  });

  activations.forEach((a) => {
    const coords = parseLatLong(a.latLong);
    if (!coords) return;
    kml += `<Placemark>
<name>PR ${a.sm}</name>
<description><![CDATA[Status: ${a.status}
Data: ${new Date(a.criadoEm).toLocaleString("pt-BR")}
Equipe: ${a.equipe || "—"}
Motivo: ${a.motivo}
Cidade: ${a.cidade || "—"}
Placa: ${a.cavalo}]]></description>
<styleUrl>#${a.status.replace(/\s/g, "_")}</styleUrl>
<Point><coordinates>${coords[1]},${coords[0]},0</coordinates></Point>
</Placemark>\n`;
  });

  kml += `</Document></kml>`;
  return kml;
}

export default function Mapa() {
  const { activations, loading } = useActivations();
  const { dateRange, setDateRange } = useDateFilter();
  const { items: equipes } = useEquipes();
  const [activeStatuses, setActiveStatuses] = useState<Set<string>>(new Set(STATUS_LIST));
  const [filterEquipe, setFilterEquipe] = useState<string>("all");
  const [filterCidade, setFilterCidade] = useState("");
  const [selected, setSelected] = useState<Activation | null>(null);
  const [heatmapEnabled, setHeatmapEnabled] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const toggleStatus = (status: string) => {
    setActiveStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const dayStart = dateRange.from ? new Date(dateRange.from) : new Date();
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = dateRange.to ? new Date(dateRange.to) : new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    return activations.filter((a) => {
      const d = new Date(a.criadoEm);
      if (d < dayStart || d > dayEnd) return false;
      if (!activeStatuses.has(a.status)) return false;
      if (filterEquipe !== "all" && a.equipe !== filterEquipe) return false;
      if (filterCidade && !(a.cidade || "").toLowerCase().includes(filterCidade.toLowerCase())) return false;
      return !!parseLatLong(a.latLong);
    });
  }, [activations, dateRange, activeStatuses, filterEquipe, filterCidade]);

  const positions = useMemo(() => filtered.map((a) => parseLatLong(a.latLong)!).filter(Boolean), [filtered]);

  const clearFilters = () => {
    setActiveStatuses(new Set(STATUS_LIST));
    setFilterEquipe("all");
    setFilterCidade("");
  };

  const exportPNG = useCallback(async () => {
    if (!mapRef.current) return;
    toast.loading("Exportando PNG...");
    try {
      const dataUrl = await toPng(mapRef.current, { quality: 0.95, backgroundColor: "#111827" });
      const link = document.createElement("a");
      link.download = `mapa_prs_${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
      toast.dismiss();
      toast.success("PNG exportado!");
    } catch {
      toast.dismiss();
      toast.error("Erro ao exportar PNG");
    }
  }, []);

  const exportKML = useCallback(() => {
    const kml = generateKML(filtered, dateRange);
    const fromStr = dateRange.from ? dateRange.from.toISOString().slice(0, 10) : "inicio";
    const toStr = dateRange.to ? dateRange.to.toISOString().slice(0, 10) : "fim";
    const blob = new Blob([kml], { type: "application/vnd.google-earth.kml+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PRs_${fromStr}_a_${toStr}.kml`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("KML exportado!");
  }, [filtered, dateRange]);

  // Equipes for filter
  const equipeOptions = useMemo(() => {
    const set = new Set<string>();
    activations.forEach((a) => { if (a.equipe) set.add(a.equipe); });
    return Array.from(set).sort();
  }, [activations]);

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          Mapa de Acionamentos
          <span className="text-sm font-normal bg-primary text-primary-foreground rounded-full px-2.5 py-0.5 ml-2">
            {filtered.length} PRs
          </span>
        </h1>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-400" />
            <span className="text-xs text-muted-foreground">Heatmap</span>
            <Switch checked={heatmapEnabled} onCheckedChange={setHeatmapEnabled} />
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={exportPNG}>
            <Image className="h-3.5 w-3.5" /> PNG
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={exportKML}>
            <Download className="h-3.5 w-3.5" /> KML
          </Button>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={filterEquipe}
          onChange={(e) => setFilterEquipe(e.target.value)}
          className="h-8 rounded-md border border-border bg-card px-2 text-sm text-foreground"
        >
          <option value="all">Todas equipes</option>
          {equipeOptions.map((eq) => <option key={eq} value={eq}>{eq}</option>)}
        </select>
        <Input
          value={filterCidade}
          onChange={(e) => setFilterCidade(e.target.value)}
          placeholder="Filtrar cidade..."
          className="h-8 w-40 text-sm"
        />
        <DateFilter range={dateRange} onChange={setDateRange} />
        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={clearFilters}>
          <XCircle className="h-3.5 w-3.5" /> Limpar filtros
        </Button>
      </div>

      {/* Interactive legend */}
      <div className="flex flex-wrap gap-2 mb-3">
        {Object.entries(STATUS_COLORS).map(([status, color]) => {
          const isActive = activeStatuses.has(status);
          const count = filtered.filter((a) => a.status === status).length;
          return (
            <button
              key={status}
              onClick={() => toggleStatus(status)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all duration-200 cursor-pointer ${
                isActive
                  ? "border-border bg-card text-foreground"
                  : "border-transparent bg-muted/30 text-muted-foreground line-through opacity-50"
              }`}
            >
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color, opacity: isActive ? 1 : 0.3 }} />
              {status} {count > 0 && <span className="font-semibold">({count})</span>}
            </button>
          );
        })}
        {/* Sinistro legend */}
        <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-400">
          <span>⚠</span> SINISTRADO
        </div>
      </div>

      {/* Map - ALWAYS visible */}
      <div ref={mapRef} className="rounded-lg overflow-hidden border border-border relative" style={{ height: "calc(100vh - 300px)" }}>
        <MapContainer
          center={positions[0] || [-23.55, -46.63]}
          zoom={10}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OSM</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {positions.length > 0 && <FitBounds positions={positions} />}
          <CenterButton positions={positions} />
          <HeatmapLayer positions={positions} enabled={heatmapEnabled} />
          {filtered.map((a) => {
            const pos = parseLatLong(a.latLong);
            if (!pos) return null;
            return (
              <Marker key={a.id} position={pos} icon={createIcon(a.status, a.sinistro)}>
                <Popup>
                  <div className="text-xs space-y-1 min-w-[180px]">
                    <p className="font-semibold text-sm">{a.cavalo} {a.sinistro && "⚠️ SINISTRADO"}</p>
                    <p>SM: {a.sm}</p>
                    <p>Status: {a.status}</p>
                    <p>Equipe: {a.equipe || "—"}</p>
                    <p>Motivo: {a.motivo}</p>
                    <p>Cidade: {a.cidade || "—"}</p>
                    <p>{new Date(a.criadoEm).toLocaleString("pt-BR")}</p>
                    <button
                      className="text-blue-500 hover:underline mt-1 block"
                      onClick={() => setSelected(a)}
                    >
                      Ver detalhes →
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
        {filtered.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-[500] pointer-events-none">
            <p className="text-muted-foreground text-sm bg-card/90 px-4 py-2 rounded-lg border border-border">
              Nenhuma PR encontrada para os filtros selecionados
            </p>
          </div>
        )}
      </div>

      <DetailModal activation={selected} open={!!selected} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
}
