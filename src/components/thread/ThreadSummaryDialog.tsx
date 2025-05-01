
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ThreadSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: string;
  setSummary: (summary: string) => void;
  onSaveSummary: () => void;
}

const ThreadSummaryDialog = ({
  open,
  onOpenChange,
  summary,
  setSummary,
  onSaveSummary,
}: ThreadSummaryDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{summary ? "Edit Summary" : "Add Summary"}</DialogTitle>
        </DialogHeader>
        <Textarea
          placeholder="Write a summary of this thread..."
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={5}
          className="mt-2"
        />
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSaveSummary}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ThreadSummaryDialog;
