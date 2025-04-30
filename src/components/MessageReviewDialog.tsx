
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
  const { toast } = useToast();

  const handleAccept = () => {
    if (kindMessage.trim()) {
      onAccept(kindMessage);
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
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <div className="bg-muted p-3 rounded-md text-sm">{kindMessage}</div>
            )}
          </div>
        </div>
        <DialogFooter className="flex sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Try Again
          </Button>
          <Button
            type="button"
            onClick={handleAccept}
            disabled={!kindMessage.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Accept & Send"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MessageReviewDialog;
