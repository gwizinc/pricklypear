import { THREAD_TOPIC_INFO, type ThreadTopic } from "@/constants/thread-topics";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { Connection } from "@/types/connection";

interface CreateThreadFormProps {
  newThreadTitle: string;
  setNewThreadTitle: (title: string) => void;
  selectedContactId: string;
  setSelectedContactId: (contactId: string) => void;
  selectedTopic?: ThreadTopic;
  setSelectedTopic?: (topic: ThreadTopic) => void;
  connections: Connection[];
  isLoadingContacts: boolean;
  isCreating: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

const CreateThreadForm = ({
  newThreadTitle,
  setNewThreadTitle,
  selectedContactId,
  setSelectedContactId,
  selectedTopic = "other",
  setSelectedTopic,
  connections,
  isLoadingContacts,
  isCreating,
  onSubmit,
  onCancel,
}: CreateThreadFormProps) => {
  const topicInfo = THREAD_TOPIC_INFO;

  return (
    <div className="space-y-4 mt-2">
      <Input
        placeholder="Thread title"
        value={newThreadTitle}
        onChange={(e) => setNewThreadTitle(e.target.value)}
        maxLength={50} /* DD-55: hard stop at 50 chars */
      />

      <div>
        <label className="text-sm font-medium mb-1 block">Select Contact</label>

        {isLoadingContacts ? (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
            <span className="text-sm">Loading contacts...</span>
          </div>
        ) : connections.length === 0 ? (
          <div className="text-center py-2 border border-dashed rounded-md">
            <p className="text-sm text-muted-foreground">
              No contacts available. Add contacts first.
            </p>
            <Button variant="link" size="sm" asChild className="mt-1">
              <Link to="/connections">Go to Connections</Link>
            </Button>
          </div>
        ) : (
          <Select
            value={selectedContactId}
            onValueChange={setSelectedContactId}
          >
            <SelectTrigger className="normal-case">
              <SelectValue placeholder="Select a contact" />
            </SelectTrigger>
            <SelectContent>
              {connections.map((connection) => (
                <SelectItem
                  key={connection.otherUserId}
                  value={connection.otherUserId}
                  className="normal-case"
                >
                  {connection.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {setSelectedTopic && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Thread Topic</Label>
          <RadioGroup
            value={selectedTopic}
            onValueChange={(value) =>
              setSelectedTopic(
                value as
                  | "travel"
                  | "parenting_time"
                  | "health"
                  | "education"
                  | "activity"
                  | "legal"
                  | "expense"
                  | "other",
              )
            }
            className="grid grid-cols-2 gap-2"
          >
            {Object.entries(topicInfo).map(([value, info]) => (
              <div key={value} className="flex items-center space-x-2">
                <RadioGroupItem value={value} id={`topic-${value}`} />
                <Label htmlFor={`topic-${value}`} className="text-sm">
                  {info.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
        <Button variant="outline" onClick={onCancel} disabled={isCreating}>
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!newThreadTitle.trim() || !selectedContactId || isCreating}
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create"
          )}
        </Button>
      </div>
    </div>
  );
};

export default CreateThreadForm;
