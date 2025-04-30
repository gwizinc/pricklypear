
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  UserPlus, 
  Users, 
  Loader2, 
  Mail, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  UserCheck
} from "lucide-react";
import { 
  Connection, 
  ConnectionStatus, 
  getConnections, 
  updateConnectionStatus,
  deleteConnection,
  inviteByEmail
} from "@/services/connectionService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Connections = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
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

  const handleInvite = async () => {
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
      const newConnection = await inviteByEmail(email);
      
      if (newConnection) {
        setEmail("");
        setIsDialogOpen(false);
        loadConnections();
        
        toast({
          title: "Invitation sent",
          description: `You've sent a connection invitation to ${email}`,
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

  const handleUpdateStatus = async (connectionId: string, status: ConnectionStatus) => {
    try {
      await updateConnectionStatus(connectionId, status);
      loadConnections();
      
      toast({
        title: status === 'accepted' ? "Connection accepted" : "Connection declined",
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

  const handleDeleteConnection = async (connectionId: string) => {
    try {
      await deleteConnection(connectionId);
      loadConnections();
      
      toast({
        title: "Connection removed",
        description: "The connection has been removed",
      });
    } catch (error) {
      console.error("Error deleting connection:", error);
      toast({
        title: "Error",
        description: "Failed to remove connection",
        variant: "destructive",
      });
    }
  };

  // Filter connections by status and relation to current user
  const pendingIncomingConnections = connections.filter(
    c => c.status === 'pending' && c.connected_user_id === user?.id
  );
  
  const pendingOutgoingConnections = connections.filter(
    c => c.status === 'pending' && c.connected_user_id !== user?.id
  );
  
  const acceptedConnections = connections.filter(c => c.status === 'accepted');

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
        <h1 className="text-3xl font-bold flex items-center">
          <Users className="mr-2" /> Connections
        </h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Connection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite via Email</DialogTitle>
            </DialogHeader>
            
            <div className="flex items-center gap-2 mt-2">
              <Input
                placeholder="Enter email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isInviting) {
                    handleInvite();
                  }
                }}
              />
              <Button 
                onClick={handleInvite}
                disabled={!email.trim() || isInviting}
              >
                {isInviting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Enter your friend's email address to send them a connection invitation.
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Pending Incoming Connection Requests */}
      {pendingIncomingConnections.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            Connection Requests
            <Badge variant="outline" className="ml-2">
              {pendingIncomingConnections.length}
            </Badge>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {pendingIncomingConnections.map((connection) => (
              <Card key={connection.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{connection.username}</span>
                    <Badge>Pending</Badge>
                  </CardTitle>
                </CardHeader>
                <CardFooter className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus(connection.id, 'declined')}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus(connection.id, 'accepted')}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
      
      {/* Accepted Connections */}
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        Your Connections
        <Badge variant="outline" className="ml-2">
          {acceptedConnections.length}
        </Badge>
      </h2>
      
      {acceptedConnections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {acceptedConnections.map((connection) => (
            <Card key={connection.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{connection.username}</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="secondary" className="cursor-default">
                          <UserCheck className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Connected since {new Date(connection.updated_at).toLocaleDateString()}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardFooter className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteConnection(connection.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border border-dashed rounded-lg">
          <p className="text-muted-foreground">
            You don't have any connections yet
          </p>
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(true)}
            className="mt-4"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Connection
          </Button>
        </div>
      )}
      
      {/* Pending Outgoing Connection Requests */}
      {pendingOutgoingConnections.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            Sent Requests
            <Badge variant="outline" className="ml-2">
              {pendingOutgoingConnections.length}
            </Badge>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingOutgoingConnections.map((connection) => (
              <Card key={connection.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{connection.username}</span>
                    <Badge variant="secondary">Waiting</Badge>
                  </CardTitle>
                </CardHeader>
                <CardFooter className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteConnection(connection.id)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Connections;
