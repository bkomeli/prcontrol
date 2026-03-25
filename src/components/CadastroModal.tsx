import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface CadastroModalProps {
  title: string;
  items: { id: string; nome: string }[];
  onAdd: (nome: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CadastroModal({ title, items, onAdd, onRemove, open, onOpenChange }: CadastroModalProps) {
  const [nome, setNome] = useState("");

  const handleAdd = async () => {
    if (!nome.trim()) return;
    await onAdd(nome);
    setNome("");
    toast.success(`${nome.trim().toUpperCase()} adicionado!`);
  };

  const handleRemove = async (id: string, itemNome: string) => {
    await onRemove(id);
    toast.info(`${itemNome} removido`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2">
          <Input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Novo item..."
            className="h-9 text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button size="sm" onClick={handleAdd} className="h-9">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="max-h-[300px]">
          <div className="space-y-1">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-muted/50 text-sm">
                <span>{item.nome}</span>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => handleRemove(item.id, item.nome)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
