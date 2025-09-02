"use client";

import { useState } from "react";

interface ColorCardProps {
  color: string;
  cardHeader: string;
  cardDescription: string;
  backContent?: React.ReactNode;
}

export default function ColorCard({
  color,
  cardHeader,
  cardDescription,
  backContent,
}: ColorCardProps) {
  const [hidden, setHidden] = useState(false);
  return (
    <div
      className="*:w-[22vmax] *:aspect-square *:flex *:flex-col *:p-6 *:rounded-sm *:cursor-pointer"
      onClick={() => setHidden((v) => (v ? v : true))}
    >
      {!hidden && (
        <div
          className={`justify-end
        ${color}/30 hover:${color}
        text-white font-extrabold  shadow-xl
        transition-colors duration-300 ease-in-out
      `}
        >
          <h1 className="text-3xl text-white">{cardHeader}</h1>
          <p className="text-xl">{cardDescription}</p>
        </div>
      )}
      {hidden && <div className="border-2 border-dashed">{backContent}</div>}
    </div>
  );
}
