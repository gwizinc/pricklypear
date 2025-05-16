import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getConnections, type Connection } from "@/services/users/userService";
import { addParticipantsToThread } from "@/services/threadService";

interface ConnectionItem {
  id: string;
  username: string;
}

interface AddParticipantsDialogProps {
  threadId: string;
  currentParticipantNames: string[];
  /** Disable selection when thread already has messages */
  disabled: boolean;
  onAdded?: (newNames: string[]) => void;
}

const AddParticipantsDialog = ({
  threadId,
  currentParticipantNames,
  disabled,
  onAdded,
}: AddParticipantsDialogProps) => {
  const [open, setOpen] = React.useState(false);

  const [connections, setConnections] = React.useState<ConnectionItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [isAdding, setIsAdding] = React.useState(false);

  // Load connections whenever the dialog opens (unless disabled)
  React.useEffect(() => {
    if (!open || disabled) return;

    const loadConnections = async () => {
      setIsLoading(true);
      try {
        const all = await getConnections();
        const accepted = all.filter(
          (c: Connection) =>
            c.status === "accepted" &&
            c.otherUserId &&
            !currentParticipantNames.includes(c.username),
        );

        setConnections(
          accepted.map((c) => ({
            id: c.otherUserId as string,
            username: c.username,
          })),
        );
      } catch (err) {
        console.error("Error loading connections:", err);
        toast({
          title: "Error",
          description: "Failed to load your connections.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadConnections();
  }, [open, disabled, currentParticipantNames]);

  /* Clear selections + list when dialog closes */
  React.useEffect(() => {
    if (open) return;
    setSelectedIds(new Set());
    setConnections([]);
  }, [open]);

  const toggleUser = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAdd = async () => {
    if (selectedIds.size === 0) return;

    setIsAdding(true);
    const ok = await addParticipantsToThread(threadId, [...selectedIds]);
    setIsAdding(false);

    if (!ok) {
      toast({
        title: "Error",
        description: "Failed to add participants.",
        variant: "destructive",
      });
      return;
    }

    const addedNames = connections
      .filter((c) => selectedIds.has(c.id))
      .map((c) => c.username);

    toast({ title: "Participants added." });
    onAdded?.(addedNames);

    /* reset & close */
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="border"
          aria-label="Add participant"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        {disabled ? (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Add Participants</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Participants can only be added to new threads without messages.
            </p>
            <DialogFooter>
              <Button onClick={() => setOpen(false)}>Close</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Add Participants</DialogTitle>
              <DialogDescription>
                Select people from your accepted connections.
              </DialogDescription>
            </DialogHeader>

            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-2">
                {connections.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <Checkbox
                      aria-label={`select ${c.username}`}
                      checked={selectedIds.has(c.id)}
                      onCheckedChange={() => toggleUser(c.id)}
                    />
                    {c.username}
                  </label>
                ))}

                {connections.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No connections
                  </p>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                disabled={selectedIds.size === 0 || isAdding}
                onClick={handleAdd}
              >
                {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddParticipantsDialog;
