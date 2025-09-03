"use client";

import { createContext, ReactNode, useContext } from "react";

export type AgentProps = {
  id: string;
  name: string | null;
  instructions: string;
  voiceSampleInstructions: string | null;
  voiceId: string;
  voiceName: string | null;
  voiceSampleURL: string | null;
};

const AgentContext = createContext<AgentProps | null>(null);

export function useAgent() {
  const agent = useContext(AgentContext);
  if (agent === null) {
    throw new Error("useAgent must be used within an <AgentProvider>");
  }
  return agent;
}

export function AgentProvider({
  children,
  agent,
}: {
  children: ReactNode;
  agent: AgentProps;
}) {
  return (
    <AgentContext.Provider value={agent}>{children}</AgentContext.Provider>
  );
}
