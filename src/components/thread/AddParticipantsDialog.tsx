import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useConnections } from "@/hooks/useConnections";
import { addParticipants } from "@/services/threadService";
import type { Thread } from "@/types/thread";

interface AddParticipantsDialogProps {
  thread: Thread;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddParticipantsDialog = ({
  thread,
  open,
  onOpenChange,
}: AddParticipantsDialogProps) => {
  const { user } = useAuth();
  const { connections, isLoading, loadConnections } = useConnections(user);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      loadConnections();
      setSelectedIds([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on open change
  }, [open]);

  const availableConnections = connections.filter(
    (c) =>
      !thread.participants?.includes(c.username) && c.otherUserId !== user?.id,
  );

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleAdd = async () => {
    if (selectedIds.length === 0) return;
    setIsSubmitting(true);
    await addParticipants(thread.id, selectedIds);
    setIsSubmitting(false);
    onOpenChange(false);
    // For now, refresh the page so the participant list is up-to-date.
    // In the future we can expose setThread from the state hook for smarter updates.
    window.location.reload();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add participants</DialogTitle>
          <DialogDescription>
            Select the contacts you’d like to add to this conversation. You can
            choose more than one.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : availableConnections.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No additional contacts available to add.
          </p>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-3 py-2">
            {availableConnections.map((conn) => (
              <label
                key={conn.otherUserId}
                className="flex items-center gap-3 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 border-muted-foreground rounded-sm"
                  checked={selectedIds.includes(conn.otherUserId)}
                  onChange={() => toggleSelection(conn.otherUserId)}
                />
                <span className="text-sm">{conn.username}</span>
              </label>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={selectedIds.length === 0 || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding…
              </>
            ) : (
              "Add"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddParticipantsDialog;
