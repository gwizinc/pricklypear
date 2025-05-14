import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { X } from "lucide-react";
import { useSearchThread } from "@/contexts/search-thread-context.js";
import SearchThreadMessages from "./search-thread-messages.js";
import SearchThreadComposer from "./search-thread-composer.js";

const SearchThreadPanel = () => {
  const { thread, closeThread } = useSearchThread();
  return (
    <Drawer
      open={Boolean(thread)}
      onOpenChange={(open) => !open && closeThread()}
    >
      <DrawerContent className="h-[80vh]">
        <DrawerHeader className="flex items-center justify-between border-b">
          <DrawerTitle className="flex-1 text-start">Search</DrawerTitle>
          <DrawerClose
            asChild
            className="absolute right-4 top-4 text-muted-foreground"
          >
            <button aria-label="Close">
              <X size={18} />
            </button>
          </DrawerClose>
        </DrawerHeader>
        {thread && (
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              <SearchThreadMessages messages={thread.messages} />
            </div>
            <div className="border-t p-4">
              <SearchThreadComposer />
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default SearchThreadPanel;
