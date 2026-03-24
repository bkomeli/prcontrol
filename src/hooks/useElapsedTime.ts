import { useState, useEffect } from "react";

export function useElapsedTime(isoDate: string) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, Date.now() - new Date(isoDate).getTime());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setElapsed(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [isoDate]);

  return elapsed;
}
