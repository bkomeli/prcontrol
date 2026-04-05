import { useState } from "react";
import { NewActivationForm } from "@/components/NewActivationForm";
import { NewEscoltaForm } from "@/components/NewEscoltaForm";
import { ActivationQueue } from "@/components/ActivationQueue";
import { Button } from "@/components/ui/button";
import { Zap, ShieldCheck } from "lucide-react";

const Index = () => {
  const [mode, setMode] = useState<"acionamento" | "escolta">("acionamento");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 h-[calc(100vh-3.5rem)] animate-fade-in">
      <div className="overflow-auto">
        <div className="flex gap-2 mb-4">
          <Button
            size="sm"
            variant={mode === "acionamento" ? "default" : "outline"}
            onClick={() => setMode("acionamento")}
          >
            <Zap className="h-3.5 w-3.5 mr-1" /> Novo Acionamento
          </Button>
          <Button
            size="sm"
            variant={mode === "escolta" ? "default" : "outline"}
            onClick={() => setMode("escolta")}
          >
            <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Nova Escolta
          </Button>
        </div>
        {mode === "acionamento" ? <NewActivationForm /> : <NewEscoltaForm />}
      </div>
      <div className="overflow-hidden flex flex-col">
        <ActivationQueue />
      </div>
    </div>
  );
};

export default Index;
