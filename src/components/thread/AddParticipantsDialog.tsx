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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { searchUsers } from "@/services/users/userService";
import { addParticipantsToThread } from "@/services/threadService";

interface UserSearchResult {
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
  const [query, setQuery] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const [results, setResults] = React.useState<UserSearchResult[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [isAdding, setIsAdding] = React.useState(false);

  /* debounced user search */
  React.useEffect(() => {
    if (!open || disabled) return;
    if (query.trim() === "") {
      setResults([]);
      return;
    }

    let active = true;
    setIsSearching(true);
    const t = setTimeout(() => {
      searchUsers(query).then((users) => {
        if (!active) return;
        setResults(
          users.filter((u) => !currentParticipantNames.includes(u.username)),
        );
        setIsSearching(false);
      });
    }, 300);

    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [query, open, disabled, currentParticipantNames]);

  const toggleUser = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
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

    const addedNames = results
      .filter((u) => selectedIds.has(u.id))
      .map((u) => u.username);

    toast({ title: "Participants added." });
    onAdded?.(addedNames);

    /* reset & close */
    setOpen(false);
    setQuery("");
    setResults([]);
    setSelectedIds(new Set());
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
                Search and select people to add to this thread.
              </DialogDescription>
            </DialogHeader>

            <Input
              placeholder="Search users…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            {isSearching ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-2">
                {results.map((u) => (
                  <label
                    key={u.id}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <Checkbox
                      checked={selectedIds.has(u.id)}
                      onCheckedChange={() => toggleUser(u.id)}
                    />
                    {u.username}
                  </label>
                ))}
                {query && results.length === 0 && (
                  <p className="text-sm text-muted-foreground">No users found</p>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                disabled={selectedIds.size === 0 || isAdding}
                onClick={handleAdd}
              >
                {isAdding && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
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
