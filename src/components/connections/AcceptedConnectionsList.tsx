
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus } from "lucide-react";
import { Connection } from "@/services/connectionService";
import ConnectionCard from "./ConnectionCard";

interface AcceptedConnectionsListProps {
  connections: Connection[];
  onDisable: (connectionId: string) => void;
  onDelete: (connectionId: string) => void;
  onOpenInviteDialog: () => void;
}

const AcceptedConnectionsList: React.FC<AcceptedConnectionsListProps> = ({
  connections,
  onDisable,
  onDelete,
  onOpenInviteDialog,
}) => {
  return (
    <>
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        Your Connections
        <Badge variant="outline" className="ml-2">
          {connections.length}
        </Badge>
      </h2>

      {connections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {connections.map((connection) => (
            <ConnectionCard
              key={connection.id}
              connection={connection}
              onDisable={onDisable}
              onDelete={onDelete}
              variant="accepted"
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border border-dashed rounded-lg">
          <p className="text-muted-foreground">
            You don't have any connections yet
          </p>
          <Button
            variant="outline"
            onClick={onOpenInviteDialog}
            className="mt-4"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Connection
          </Button>
        </div>
      )}
    </>
  );
};

export default AcceptedConnectionsList;
