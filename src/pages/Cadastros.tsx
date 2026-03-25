import { useState } from "react";
import { useTransportadoras, useMotivos } from "@/hooks/useCadastros";
import { CadastroModal } from "@/components/CadastroModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Truck, FileWarning } from "lucide-react";

export default function Cadastros() {
  const transportadoras = useTransportadoras();
  const motivos = useMotivos();
  const [openTransp, setOpenTransp] = useState(false);
  const [openMotivo, setOpenMotivo] = useState(false);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
        <Settings className="h-6 w-6 text-primary" />
        Cadastros
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
        <Card className="p-5 flex flex-col items-center gap-3">
          <Truck className="h-10 w-10 text-primary" />
          <h3 className="text-sm font-semibold">Transportadoras</h3>
          <p className="text-xs text-muted-foreground">{transportadoras.items.length} cadastradas</p>
          <Button size="sm" onClick={() => setOpenTransp(true)}>Gerenciar</Button>
        </Card>
        <Card className="p-5 flex flex-col items-center gap-3">
          <FileWarning className="h-10 w-10 text-primary" />
          <h3 className="text-sm font-semibold">Motivos</h3>
          <p className="text-xs text-muted-foreground">{motivos.items.length} cadastrados</p>
          <Button size="sm" onClick={() => setOpenMotivo(true)}>Gerenciar</Button>
        </Card>
      </div>
      <CadastroModal title="Transportadoras" items={transportadoras.items} onAdd={transportadoras.add} onRemove={transportadoras.remove} open={openTransp} onOpenChange={setOpenTransp} />
      <CadastroModal title="Motivos" items={motivos.items} onAdd={motivos.add} onRemove={motivos.remove} open={openMotivo} onOpenChange={setOpenMotivo} />
    </div>
  );
}
