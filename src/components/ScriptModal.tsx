import type { Activation } from "@/types/activation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

function generateScript(a: Activation) {
  return `SM: ${a.sm}
Transportador: ${a.transportador}
Cavalo: ${a.cavalo}
Carreta: ${a.carreta}
Lat / long: ${a.latLong}
Armado? ${a.armado}
Motivo do acionamento: ${a.motivo}
Autorizado por quem? ${a.autorizadoPor}
Breve resumo: ${a.resumo}`;
}

export function ScriptModal({ activation, open, onOpenChange }: { activation: Activation | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  if (!activation) return null;
  const script = generateScript(activation);

  const copy = () => {
    navigator.clipboard.writeText(script);
    toast.success("Script copiado!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Script — SM {activation.sm}</DialogTitle>
        </DialogHeader>
        <pre className="p-3 rounded-md bg-muted text-xs font-mono text-foreground whitespace-pre-wrap border border-border">
          {script}
        </pre>
        <Button size="sm" onClick={copy} className="w-full">
          <Copy className="h-3.5 w-3.5 mr-1" /> Copiar Script
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export { generateScript };
