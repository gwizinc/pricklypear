import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Mail } from "lucide-react";

interface InviteConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (email: string) => void;
  isInviting: boolean;
}

const InviteConnectionDialog: React.FC<InviteConnectionDialogProps> = ({
  open,
  onOpenChange,
  onInvite,
  isInviting,
}) => {
  const [email, setEmail] = useState("");

  const handleInvite = () => {
    onInvite(email);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              if (e.key === "Enter" && !isInviting && email.trim()) {
                handleInvite();
              }
            }}
          />
          <Button onClick={handleInvite} disabled={!email.trim() || isInviting}>
            {isInviting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          Enter the email of the person you would like to add as a connection.
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteConnectionDialog;
