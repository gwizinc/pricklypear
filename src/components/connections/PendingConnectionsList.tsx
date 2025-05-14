import React from "react";
import { Badge } from "@/components/ui/badge";
import { Connection, ConnectionStatus } from "@/services/users/userService.js";
import ConnectionCard from "./ConnectionCard";

interface PendingConnectionsListProps {
  connections: Connection[];
  onUpdateStatus: (connectionId: string, status: ConnectionStatus) => void;
}

const PendingConnectionsList: React.FC<PendingConnectionsListProps> = ({
  connections,
  onUpdateStatus,
}) => {
  if (connections.length === 0) return null;

  return (
    <>
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        Connection Requests
        <Badge variant="outline" className="ml-2">
          {connections.length}
        </Badge>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {connections.map((connection) => (
          <ConnectionCard
            key={connection.id}
            connection={connection}
            onUpdateStatus={onUpdateStatus}
            variant="pending-incoming"
          />
        ))}
      </div>
    </>
  );
};

export default PendingConnectionsList;
