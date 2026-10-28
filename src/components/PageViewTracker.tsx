import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axiosClient from "@/api/axiosClient";

export default function PageViewTracker() {
  const location = useLocation();
  const lastKey = useRef("");
  useEffect(() => {
    if (lastKey.current === location.key) return;
    lastKey.current = location.key;
    if (
      /^\/(admin|reset-password|profile|login)(\/|$)/i.test(location.pathname)
    )
      return;
    try {
      if (
        navigator.doNotTrack === "1" ||
        localStorage.getItem("A509_ANALYTICS_OPTOUT") === "1"
      )
        return;
      let visitorId = localStorage.getItem("A509_VISITOR");
      if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem("A509_VISITOR", visitorId);
      }
      const now = Date.now();
      const saved = JSON.parse(
        sessionStorage.getItem("A509_VISIT_SESSION") || "null",
      );
      const sessionId =
        saved && now - saved.time < 30 * 60000 ? saved.id : crypto.randomUUID();
      sessionStorage.setItem(
        "A509_VISIT_SESSION",
        JSON.stringify({ id: sessionId, time: now }),
      );
      void axiosClient
        .post("/api/analytics/pageviews", {
          eventId: crypto.randomUUID(),
          visitorId,
          sessionId,
          path: location.pathname,
          referrer: document.referrer ? new URL(document.referrer).origin : "",
        })
        .catch(() => {
          /* Recording never interrupts browsing. */
        });
    } catch {
      /* Respect blocked storage / unavailable crypto. */
    }
  }, [location.key, location.pathname]);
  return null;
}
