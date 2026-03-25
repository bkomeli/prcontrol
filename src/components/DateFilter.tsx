import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { DateRange } from "react-day-picker";

export function DateFilter({ range, onChange }: { range: DateRange; onChange: (r: DateRange) => void }) {
  const label = range.from && range.to
    ? `${format(range.from, "dd/MM/yyyy")} – ${format(range.to, "dd/MM/yyyy")}`
    : range.from
      ? format(range.from, "dd/MM/yyyy")
      : "Selecionar período";

  const reset = () => {
    const today = new Date();
    onChange({ from: today, to: today });
  };

  return (
    <div className="flex items-center gap-1">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 text-sm gap-2 transition-colors duration-200">
            <CalendarIcon className="h-4 w-4" />
            {label}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={range}
            onSelect={(r) => {
              if (r) onChange(r);
            }}
            numberOfMonths={2}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
          <div className="px-3 pb-3 flex justify-end">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={reset}>
              Resetar para hoje
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      {range.from && (
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground transition-colors" onClick={reset}>
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
