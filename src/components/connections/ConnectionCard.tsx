
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TooltipProvider, 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent 
} from "@/components/ui/tooltip";
import { 
  CheckCircle2, 
  XCircle, 
  UserCheck,
  EyeOff
} from "lucide-react";
import { Connection } from "@/services/connectionService";
import DisableConnectionDialog from "./DisableConnectionDialog";

interface ConnectionCardProps {
  connection: Connection;
  onUpdateStatus?: (connectionId: string, status: "accepted" | "declined" | "disabled" | "pending") => void;
  onDisable?: (connectionId: string) => void;
  variant: "pending-incoming" | "pending-outgoing" | "accepted" | "disabled";
}

const ConnectionCard: React.FC<ConnectionCardProps> = ({
  connection,
  onUpdateStatus,
  onDisable,
  variant,
}) => {
  const [isDisableDialogOpen, setIsDisableDialogOpen] = useState(false);

  const handleDisableConfirmed = () => {
    onDisable?.(connection.id);
    setIsDisableDialogOpen(false);
  };

  const renderBadge = () => {
    switch (variant) {
      case "pending-incoming":
        return <Badge>Pending</Badge>;
      case "pending-outgoing":
        return <Badge variant="secondary">Waiting</Badge>;
      case "accepted":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="cursor-default">
                  <UserCheck className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Connected since {new Date(connection.updatedAt).toLocaleDateString()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case "disabled":
        return <Badge variant="outline">Disabled</Badge>;
      default:
        return null;
    }
  };

  const renderActions = () => {
    switch (variant) {
      case "pending-incoming":
        return (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateStatus?.(connection.id, 'declined')}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Decline
            </Button>
            <Button
              size="sm"
              onClick={() => onUpdateStatus?.(connection.id, 'accepted')}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Accept
            </Button>
          </>
        );
      case "pending-outgoing":
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateStatus?.(connection.id, 'declined')}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        );
      case "accepted":
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDisableDialogOpen(true)}
          >
            <EyeOff className="h-4 w-4 mr-1" />
            Disable
          </Button>
        );
      case "disabled":
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateStatus?.(connection.id, 'accepted')}
          >
            <UserCheck className="h-4 w-4 mr-1" />
            Enable
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card className={variant === "disabled" ? "opacity-60" : ""}>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{connection.username}</span>
            {renderBadge()}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex justify-end gap-2">
          {renderActions()}
        </CardFooter>
      </Card>

      <DisableConnectionDialog
        open={isDisableDialogOpen}
        onOpenChange={setIsDisableDialogOpen}
        onConfirm={handleDisableConfirmed}
        connectionName={connection.username}
      />
    </>
  );
};

export default ConnectionCard;
