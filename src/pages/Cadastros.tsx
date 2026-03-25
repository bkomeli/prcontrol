import { useState } from "react";
import { useTransportadoras, useMotivos, useEquipes } from "@/hooks/useCadastros";
import { CadastroModal } from "@/components/CadastroModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Truck, FileWarning, Users } from "lucide-react";

export default function Cadastros() {
  const transportadoras = useTransportadoras();
  const motivos = useMotivos();
  const equipes = useEquipes();
  const [openTransp, setOpenTransp] = useState(false);
  const [openMotivo, setOpenMotivo] = useState(false);
  const [openEquipe, setOpenEquipe] = useState(false);

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
        <Settings className="h-6 w-6 text-primary" />
        Cadastros
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
        <Card className="p-6 flex flex-col items-center gap-3 transition-shadow duration-200 hover:shadow-lg hover:border-primary/30 cursor-pointer" onClick={() => setOpenTransp(true)}>
          <Truck className="h-10 w-10 text-primary" />
          <h3 className="text-sm font-semibold">Transportadoras</h3>
          <p className="text-xs text-muted-foreground">{transportadoras.items.length} cadastradas</p>
          <Button size="sm" className="transition-colors duration-200">Gerenciar</Button>
        </Card>
        <Card className="p-6 flex flex-col items-center gap-3 transition-shadow duration-200 hover:shadow-lg hover:border-primary/30 cursor-pointer" onClick={() => setOpenMotivo(true)}>
          <FileWarning className="h-10 w-10 text-primary" />
          <h3 className="text-sm font-semibold">Motivos</h3>
          <p className="text-xs text-muted-foreground">{motivos.items.length} cadastrados</p>
          <Button size="sm" className="transition-colors duration-200">Gerenciar</Button>
        </Card>
        <Card className="p-6 flex flex-col items-center gap-3 transition-shadow duration-200 hover:shadow-lg hover:border-primary/30 cursor-pointer" onClick={() => setOpenEquipe(true)}>
          <Users className="h-10 w-10 text-primary" />
          <h3 className="text-sm font-semibold">Equipes</h3>
          <p className="text-xs text-muted-foreground">{equipes.items.length} cadastradas</p>
          <Button size="sm" className="transition-colors duration-200">Gerenciar</Button>
        </Card>
      </div>
      <CadastroModal title="Transportadoras" items={transportadoras.items} onAdd={transportadoras.add} onRemove={transportadoras.remove} open={openTransp} onOpenChange={setOpenTransp} />
      <CadastroModal title="Motivos" items={motivos.items} onAdd={motivos.add} onRemove={motivos.remove} open={openMotivo} onOpenChange={setOpenMotivo} />
      <CadastroModal title="Equipes" items={equipes.items} onAdd={equipes.add} onRemove={equipes.remove} open={openEquipe} onOpenChange={setOpenEquipe} />
    </div>
  );
}
