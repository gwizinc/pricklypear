import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2 } from "lucide-react";
import { DialogTrigger, Dialog } from "@/components/ui/dialog";

import {
  Connection,
  ConnectionStatus,
  getConnections,
  updateConnectionStatus,
  disableConnection,
  inviteByEmail,
} from "@/services/users/userService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

// Import refactored components
import PendingConnectionsList from "@/components/connections/PendingConnectionsList";
import OutgoingConnectionsList from "@/components/connections/OutgoingConnectionsList";
import AcceptedConnectionsList from "@/components/connections/AcceptedConnectionsList";
import DisabledConnectionsList from "@/components/connections/DisabledConnectionsList";
import InviteConnectionDialog from "@/components/connections/InviteConnectionDialog";

const Connections = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadConnections();
  }, [user]);

  const loadConnections = async () => {
    setIsLoading(true);
    try {
      const fetchedConnections = await getConnections();
      setConnections(fetchedConnections);
    } catch (error) {
      console.error("Error loading connections:", error);
      toast({
        title: "Error",
        description: "Failed to load connections",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (email: string) => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsInviting(true);
    try {
      const response = await inviteByEmail(email);

      if (response.success) {
        setIsDialogOpen(false);
        loadConnections();

        toast({
          title: "Invitation sent",
          description: `You've sent a connection invitation to ${email}`,
        });
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error inviting connection:", error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleUpdateStatus = async (
    connectionId: string,
    status: ConnectionStatus,
  ) => {
    try {
      await updateConnectionStatus(connectionId, status);
      loadConnections();

      toast({
        title:
          status === "accepted" ? "Connection accepted" : "Connection declined",
      });
    } catch (error) {
      console.error("Error updating connection:", error);
      toast({
        title: "Error",
        description: "Failed to update connection",
        variant: "destructive",
      });
    }
  };

  const handleDisableConnection = async (connectionId: string) => {
    try {
      await disableConnection(connectionId);
      loadConnections();

      toast({
        title: "Connection disabled",
        description: "This connection has been disabled",
      });
    } catch (error) {
      console.error("Error disabling connection:", error);
      toast({
        title: "Error",
        description: "Failed to disable connection",
        variant: "destructive",
      });
    }
  };

  // Filter connections by status and relation to current user
  const pendingIncomingConnections = connections.filter(
    (c) => c.status === "pending" && !c.isUserSender,
  );

  const pendingOutgoingConnections = connections.filter(
    (c) => c.status === "pending" && c.isUserSender,
  );

  const acceptedConnections = connections.filter(
    (c) => c.status === "accepted",
  );

  const disabledConnections = connections.filter(
    (c) => c.status === "disabled",
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center">Connections</h1>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Connection
            </Button>
          </DialogTrigger>
          <InviteConnectionDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onInvite={handleInvite}
            isInviting={isInviting}
          />
        </Dialog>
      </div>

      <PendingConnectionsList
        connections={pendingIncomingConnections}
        onUpdateStatus={handleUpdateStatus}
      />

      <AcceptedConnectionsList
        connections={acceptedConnections}
        onDisable={handleDisableConnection}
        onOpenInviteDialog={() => setIsDialogOpen(true)}
      />

      <OutgoingConnectionsList connections={pendingOutgoingConnections} />

      <DisabledConnectionsList
        connections={disabledConnections}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};

export default Connections;
