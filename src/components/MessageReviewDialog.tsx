
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface MessageReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalMessage: string;
  kindMessage: string;
  onAccept: (message: string) => void;
  isLoading: boolean;
}

const MessageReviewDialog = ({
  open,
  onOpenChange,
  originalMessage,
  kindMessage,
  onAccept,
  isLoading,
}: MessageReviewDialogProps) => {
  const [editedMessage, setEditedMessage] = React.useState(kindMessage);
  const { toast } = useToast();

  React.useEffect(() => {
    setEditedMessage(kindMessage);
  }, [kindMessage]);

  const handleAccept = () => {
    if (editedMessage.trim()) {
      onAccept(editedMessage);
      onOpenChange(false);
      toast({
        title: "Message sent",
        description: "Your message has been reviewed and sent",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Review your message</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Original message:</p>
            <div className="bg-muted p-3 rounded-md text-sm">{originalMessage}</div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">AI suggested rephrasing:</p>
            <Textarea
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
              className="min-h-[100px]"
              placeholder="Edit the suggested message..."
            />
          </div>
        </div>
        <DialogFooter className="flex sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAccept}
            disabled={!editedMessage.trim() || isLoading}
          >
            {isLoading ? "Processing..." : "Accept & Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MessageReviewDialog;
