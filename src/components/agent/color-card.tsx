"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

interface ColorCardProps {
  color: keyof typeof BG;
  cardHeader: string;
  cardDescription: string;
  backContent?: React.ReactNode;
}

const BG = {
  red: "sm:bg-red-500/30 bg-red-500 hover:bg-red-500",
  blue: "sm:bg-blue-600/30 bg-blue-600 hover:bg-blue-600",
  yellow: "sm:bg-yellow-300/30 bg-yellow-300 hover:bg-yellow-300",
} as const;

export default function ColorCard({
  color,
  cardHeader,
  cardDescription,
  backContent,
}: ColorCardProps) {
  const [hidden, setHidden] = useState(false);
  return (
    <div
      className="*:w-[70vw] sm:*:w-[22vmax] *:aspect-square *:flex *:flex-col *:p-6 *:rounded-sm *:cursor-pointer"
      onClick={() => setHidden((v) => (v ? v : true))}
    >
      {!hidden && (
        <div
          className={cn(
            "justify-end text-white font-extrabold transition-colors duration-300 ease-in-out",
            BG[color]
          )}
        >
          <h1 className="text-3xl text-white">{cardHeader}</h1>
          <p className="text-xl">{cardDescription}</p>
        </div>
      )}
      {hidden && <div className="border-2 border-dashed">{backContent}</div>}
    </div>
  );
}
