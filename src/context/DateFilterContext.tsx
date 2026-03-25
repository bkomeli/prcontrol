import React, { createContext, useContext, useState } from "react";
import type { DateRange } from "react-day-picker";

interface DateFilterContextType {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

const DateFilterContext = createContext<DateFilterContextType | null>(null);

export function DateFilterProvider({ children }: { children: React.ReactNode }) {
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({ from: today, to: today });

  return (
    <DateFilterContext.Provider value={{ dateRange, setDateRange }}>
      {children}
    </DateFilterContext.Provider>
  );
}

export function useDateFilter() {
  const ctx = useContext(DateFilterContext);
  if (!ctx) throw new Error("useDateFilter must be used within DateFilterProvider");
  return ctx;
}
