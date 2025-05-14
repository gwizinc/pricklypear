import React from "react";
import { Badge } from "@/components/ui/badge";
import { Connection } from "@/services/users/userService.js";
import ConnectionCard from "./ConnectionCard";

interface OutgoingConnectionsListProps {
  connections: Connection[];
}

const OutgoingConnectionsList: React.FC<OutgoingConnectionsListProps> = ({
  connections,
}) => {
  if (connections.length === 0) return null;

  return (
    <>
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        Sent Requests
        <Badge variant="outline" className="ml-2">
          {connections.length}
        </Badge>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {connections.map((connection) => (
          <ConnectionCard
            key={connection.id}
            connection={connection}
            variant="pending-outgoing"
          />
        ))}
      </div>
    </>
  );
};

export default OutgoingConnectionsList;
