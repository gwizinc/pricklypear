
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Connection, ConnectionStatus } from "@/services/connectionService";
import ConnectionCard from "./ConnectionCard";

interface DisabledConnectionsListProps {
  connections: Connection[];
  onUpdateStatus: (connectionId: string, status: ConnectionStatus) => void;
  onDelete: (connectionId: string) => void;
}

const DisabledConnectionsList: React.FC<DisabledConnectionsListProps> = ({
  connections,
  onUpdateStatus,
  onDelete,
}) => {
  if (connections.length === 0) return null;

  return (
    <>
      <h2 className="text-xl font-semibold my-4 flex items-center">
        Disabled Connections
        <Badge variant="outline" className="ml-2">
          {connections.length}
        </Badge>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {connections.map((connection) => (
          <ConnectionCard
            key={connection.id}
            connection={connection}
            onUpdateStatus={onUpdateStatus}
            onDelete={onDelete}
            variant="disabled"
          />
        ))}
      </div>
    </>
  );
};

export default DisabledConnectionsList;
