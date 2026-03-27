import { useEffect, useRef, useMemo } from "react";
import { useActivations } from "@/context/ActivationContext";
import { toast } from "sonner";
import { AlertTriangle, MapPin, Clock, TrendingUp } from "lucide-react";

// Alert thresholds
const CONCENTRATION_THRESHOLD = 3;   // PRs in same city
const CONCENTRATION_HOURS = 2;        // within N hours
const DAILY_VOLUME_THRESHOLD = 5;     // PRs per city per day
const LONG_OPEN_HOURS = 4;            // hours before "long open" alert

function sendBrowserNotification(title: string, body: string) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body, icon: "/placeholder.svg" });
  }
}

export function AlertSystem() {
  const { activations } = useActivations();
  const lastCheckRef = useRef<string>("");

  // Get today's active (non-finished, non-cancelled) PRs
  const todayActive = useMemo(() => {
    const now = new Date();
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);
    return activations.filter((a) => {
      const d = new Date(a.criadoEm);
      return d >= dayStart && !["Finalizado", "Cancelado"].includes(a.status);
    });
  }, [activations]);

  useEffect(() => {
    const checkHash = JSON.stringify(todayActive.map((a) => `${a.id}-${a.status}`));
    if (checkHash === lastCheckRef.current) return;
    lastCheckRef.current = checkHash;

    const now = new Date();

    // 1. Sinistro alert
    todayActive.forEach((a) => {
      if (a.sinistro) {
        const key = `sinistro-${a.id}`;
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, "1");
          toast.error(`🚨 Sinistro: ${a.cavalo} em ${a.cidade || "local não identificado"}`, {
            duration: 10000,
            icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
          });
          sendBrowserNotification("🚨 SINISTRO", `${a.cavalo} - ${a.motivo} em ${a.cidade || "?"}`);
        }
      }
    });

    // 2. High concentration per city (N PRs within M hours)
    const recentWindow = new Date(now.getTime() - CONCENTRATION_HOURS * 60 * 60 * 1000);
    const recentByCity: Record<string, number> = {};
    todayActive.forEach((a) => {
      if (new Date(a.criadoEm) >= recentWindow && a.cidade) {
        recentByCity[a.cidade] = (recentByCity[a.cidade] || 0) + 1;
      }
    });
    Object.entries(recentByCity).forEach(([city, count]) => {
      if (count >= CONCENTRATION_THRESHOLD) {
        const key = `concentration-${city}-${now.getHours()}`;
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, "1");
          toast.warning(`📍 Alta incidência: ${count} PRs em ${city} nas últimas ${CONCENTRATION_HOURS}h`, {
            duration: 8000,
            icon: <MapPin className="h-4 w-4 text-orange-400" />,
          });
        }
      }
    });

    // 3. Daily volume per city
    const dailyByCity: Record<string, number> = {};
    todayActive.forEach((a) => {
      if (a.cidade) dailyByCity[a.cidade] = (dailyByCity[a.cidade] || 0) + 1;
    });
    Object.entries(dailyByCity).forEach(([city, count]) => {
      if (count >= DAILY_VOLUME_THRESHOLD) {
        const key = `volume-${city}-${now.toDateString()}`;
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, "1");
          toast.warning(`📊 Volume alto: ${count} PRs em ${city} hoje`, {
            duration: 8000,
            icon: <TrendingUp className="h-4 w-4 text-yellow-400" />,
          });
        }
      }
    });

    // 4. Long open PRs
    todayActive.forEach((a) => {
      const openHours = (now.getTime() - new Date(a.criadoEm).getTime()) / (1000 * 60 * 60);
      if (openHours >= LONG_OPEN_HOURS && a.status !== "Finalizado" && a.status !== "Cancelado") {
        const key = `longopen-${a.id}`;
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, "1");
          toast.info(`⏱ PR aberta há ${Math.floor(openHours)}h: ${a.cavalo} em ${a.cidade || "?"}`, {
            duration: 8000,
            icon: <Clock className="h-4 w-4 text-blue-400" />,
          });
        }
      }
    });
  }, [todayActive]);

  return null; // Invisible component, only runs alerts
}
