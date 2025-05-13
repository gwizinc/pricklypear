import { useState, useEffect } from "react";
import { getConnections } from "@/services/connections";
import type { Connection } from "@/types/connection";
import type { User } from "@supabase/supabase-js";

export const useConnections = (user: User | null) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadConnections = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const acceptedConnections = await getConnections();
      setConnections(acceptedConnections.filter(conn => conn.status === 'accepted'));
    } catch (error) {
      console.error("Error loading connections:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    connections,
    isLoading,
    loadConnections
  };
};
