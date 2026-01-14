"use client";

import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; // Assure-toi que le chemin est bon

const Avatar = localFont({
  src: "../fonts/Avatar.ttf",
  display: "swap",
});
const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [iframeHeight, setIframeHeight] = useState<number>(800);
  // État pour le compteur (initialisé à 0 en attendant le chargement)
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Gestion de l'iframe (ton code original)
  useEffect(() => {
    const handler = (e: MessageEvent<{ height?: number }>) => {
      if (!String(e.origin).endsWith("helloasso.com")) return;
      const h = e.data?.height;
      if (typeof h === "number") setIframeHeight(h);
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Gestion du Compteur Supabase (Chargement + Temps réel)
  useEffect(() => {
    // 1. Récupérer la valeur initiale
    const fetchCount = async () => {
      const { data, error } = await supabase
        .from("counters")
        .select("value")
        .eq("id", 1) // On cible toujours la ligne 1
        .single();

      if (data) {
        setCount(data.value);
        setIsLoading(false);
      }
    };

    fetchCount();

    // 2. S'abonner aux changements en direct
    const channel = supabase
      .channel("realtime-counter")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "counters",
          filter: "id=eq.1",
        },
        (payload) => {
          // Quand quelqu'un d'autre clique, on reçoit la nouvelle valeur ici
          setCount(payload.new.value);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fonction pour mettre à jour le compteur
  const updateCounter = async (increment: number) => {
    // Optimistic UI (optionnel : on met à jour l'écran tout de suite pour la fluidité)
    const newValue = count + increment;
    setCount(newValue);

    // Envoi à la base de données
    const { error } = await supabase
      .from("counters")
      .update({ value: newValue })
      .eq("id", 1);

    if (error) console.error("Erreur update", error);
  };

  return (
    <main className={`w-screen ${Avatar.className} relative z-10`}>
      <div className="relative z-10 flex flex-col items-center gap-6 pt-6 pb-24">
        <svg viewBox="0 0 1000 400" className="w-full h-auto md:w-1/2">
          <defs>
            <filter
              id="textShadow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="40"
                floodColor="#4de1ff"
                floodOpacity="0.9"
              />
            </filter>
          </defs>

          <text
            x="54%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize="130"
            fontWeight="800"
            fill="#b5f3ffff"
            filter="url(#textShadow)"
          >
            SUPAVATAR
          </text>
          <text
            x="50%"
            y="70%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize="35"
            fontWeight="800"
            fill="#b5f3ffff"
          >
            AE ISAE-SUPAERO
          </text>
        </svg>

        <div className="flex flex-col items-center gap-4">
          {/* BOUTON PLUS */}
          <div
            onClick={() => updateCounter(1)}
            className="cursor-pointer active:scale-95 transition-transform hover:opacity-80"
          >
            <svg
              viewBox="0 0 100 100"
              className={`w-30 h-30 ${inter.className}`}
            >
              <path
                d="M50 15 a35 35 0 0 1 0 70 a35 35 0 0 1 0 -70"
                fill="#b5f3ffff"
              />
              <text
                x="50%"
                y="51%"
                dominantBaseline="middle"
                textAnchor="middle"
                fontSize="40"
                fontWeight="800"
                fill="#1e1e1e"
                className="select-none"
              >
                +
              </text>
            </svg>
          </div>

          {/* AFFICHAGE DU COMPTEUR */}
          <svg viewBox="0 0 1000 400" className="w-full h-auto md:w-1/2">
            <text
              x="50%"
              y="70%"
              dominantBaseline="middle"
              textAnchor="middle"
              fontSize="290"
              fontWeight="800"
              fill="#b5f3ffff"
              className="transition-all duration-300"
            >
              {isLoading ? "..." : count}
            </text>
          </svg>

          {/* BOUTON MOINS */}
          <div
            onClick={() => updateCounter(-1)}
            className="cursor-pointer active:scale-95 transition-transform hover:opacity-80"
          >
            <svg
              viewBox="0 0 100 100"
              className={`w-30 h-30 ${inter.className}`}
            >
              <path
                d="M50 15 a35 35 0 0 1 0 70 a35 35 0 0 1 0 -70"
                fill="#b5f3ffff"
              />
              <text
                x="50%"
                y="51%"
                dominantBaseline="middle"
                textAnchor="middle"
                fontSize="40"
                fontWeight="800"
                fill="#1e1e1e"
                className="select-none"
              >
                -
              </text>
            </svg>
          </div>
        </div>
      </div>
    </main>
  );
}
