"use client";

import { createContext, useContext, useState } from "react";
import type { ClientStatus, PartnerClient } from "@/lib/data";
import { MOCK_PARTNER_CLIENTS } from "@/lib/data";

interface PipelineContextValue {
  clients: PartnerClient[];
  addClient: (client: PartnerClient) => void;
  updateClientStatus: (clientId: string, status: ClientStatus, planId?: string) => void;
}

const PipelineContext = createContext<PipelineContextValue | null>(null);

export function PipelineProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<PartnerClient[]>(MOCK_PARTNER_CLIENTS);

  const addClient = (client: PartnerClient) =>
    setClients((prev) => [client, ...prev]);

  const updateClientStatus = (clientId: string, status: ClientStatus, planId?: string) =>
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId ? { ...c, status, ...(planId ? { planId } : {}) } : c
      )
    );

  return (
    <PipelineContext.Provider value={{ clients, addClient, updateClientStatus }}>
      {children}
    </PipelineContext.Provider>
  );
}

export function usePipeline() {
  const ctx = useContext(PipelineContext);
  if (!ctx) throw new Error("usePipeline must be used within PipelineProvider");
  return ctx;
}
