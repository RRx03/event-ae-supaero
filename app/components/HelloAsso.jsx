"use client";

import { useEffect } from "react";

export default function HelloAssoWidget() {
  useEffect(() => {
    const handler = (e) => {
      // sécuriser la source (HelloAsso)
      if (!String(e.origin).endsWith("helloasso.com")) return;

      const h = e?.data?.height;
      if (typeof h === "number") {
        const el = document.getElementById("haWidget");
        if (el) el.style.height = `${h}px`;
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <iframe
      id="haWidget"
      title="HelloAsso – Inscription"
      src="https://www.helloasso.com/associations/4l-trophy-isae-supaero/evenements/supavatar-test/widget"
      className="w-5/6 border-0"                 // Tailwind, pas besoin de frameBorder
      // allowTransparency={true}                 // <- optionnel/obsolète, supprime-le de préférence
      allow="payment *; clipboard-write"          // utile pour certains widgets
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      // sandbox peut être ajouté si nécessaire, à ajuster selon le widget
      // sandbox="allow-same-origin allow-forms allow-scripts allow-popups allow-popups-to-escape-sandbox"
      style={{ width: "100%", height: "0px" }}    // la hauteur sera ajustée par postMessage
    />
  );
}