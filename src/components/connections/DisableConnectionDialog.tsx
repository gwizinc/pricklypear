import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EyeOff } from "lucide-react";

interface DisableConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  connectionName: string;
}

const DisableConnectionDialog: React.FC<DisableConnectionDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  connectionName,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <EyeOff className="h-5 w-5" />
            Disable Connection
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to disable your connection with{" "}
            <strong>{connectionName}</strong>? They will no longer see your
            profile or be able to message you until this connection is enabled
            again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Disable Connection
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DisableConnectionDialog;
