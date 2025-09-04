"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { fetchOneAgent } from "../actions/agent-actions";

export type AgentProps = {
  id: string;
  name: string | null;
  instructions: string;
  voiceSampleInstructions: string | null;
  voiceId: string;
  voiceName: string | null;
  voiceSampleURL: string | null;
};

type AgentContextValue = {
  agent: AgentProps | null;
  refresh: (id: string) => Promise<AgentProps>;
};

const AgentContext = createContext<AgentContextValue | null>(null);

export function useAgent() {
  const ctx = useContext(AgentContext);
  if (ctx === null) {
    throw new Error("useAgent must be used within an <AgentProvider>");
  }
  return ctx.agent;
}

export function useAgentContext() {
  const ctx = useContext(AgentContext);
  if (ctx === null) {
    throw new Error("useAgent must be used within an <AgentProvider>");
  } else if (!ctx.agent) {
    throw new Error("Agent is not found in this scope. Ctx not defined.");
  }
  return ctx;
}

export function AgentProvider({
  children,
  agent: initAgent,
}: {
  children: ReactNode;
  agent: AgentProps;
}) {
  const [agent, setAgent] = useState<AgentProps | null>(initAgent);

  useEffect(() => {
    setAgent(initAgent);
  }, [initAgent]);

  const refresh = useCallback(async (id: string): Promise<AgentProps> => {
    const updatedAgent = await fetchOneAgent(id);
    setAgent(updatedAgent);
    return updatedAgent;
  }, []);

  return (
    <AgentContext.Provider value={{ agent, refresh }}>
      {children}
    </AgentContext.Provider>
  );
}
