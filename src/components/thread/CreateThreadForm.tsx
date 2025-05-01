
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Connection } from "@/types/connection";

interface CreateThreadFormProps {
  newThreadTitle: string;
  setNewThreadTitle: (title: string) => void;
  selectedContact: string;
  setSelectedContact: (contact: string) => void;
  connections: Connection[];
  isLoadingContacts: boolean;
  isCreating: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

const CreateThreadForm = ({
  newThreadTitle,
  setNewThreadTitle,
  selectedContact,
  setSelectedContact,
  connections,
  isLoadingContacts,
  isCreating,
  onSubmit,
  onCancel
}: CreateThreadFormProps) => {
  return (
    <div className="space-y-4 mt-2">
      <Input
        placeholder="Thread title"
        value={newThreadTitle}
        onChange={(e) => setNewThreadTitle(e.target.value)}
      />
      
      <div>
        <label className="text-sm font-medium mb-1 block">
          Select Contact
        </label>
        
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
            <Button 
              variant="link" 
              size="sm" 
              asChild 
              className="mt-1"
            >
              <Link to="/connections">Go to Connections</Link>
            </Button>
          </div>
        ) : (
          <Select value={selectedContact} onValueChange={setSelectedContact}>
            <SelectTrigger>
              <SelectValue placeholder="Select a contact" />
            </SelectTrigger>
            <SelectContent>
              {connections.map((connection) => (
                <SelectItem key={connection.otherUserId} value={connection.username}>
                  {connection.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
        <Button variant="outline" onClick={onCancel} disabled={isCreating}>
          Cancel
        </Button>
        <Button 
          onClick={onSubmit} 
          disabled={!newThreadTitle.trim() || !selectedContact || isCreating}
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
