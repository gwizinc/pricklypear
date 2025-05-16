import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Plus, Mic } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ThreadMessageComposerProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  isSending: boolean;
  isThreadClosed: boolean;
  onSendMessage: () => void;
}

/**
 * Web-speech related helpers and type-safe feature-detection
 */
type SpeechRecognitionConstructor = new () => SpeechRecognition;

declare global {
  // Safari & some Chromium builds expose only webkitSpeechRecognition
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const getSpeechRecognitionCtor = ():
  | SpeechRecognitionConstructor
  | undefined =>
  typeof window === "undefined"
    ? undefined
    : ((window.SpeechRecognition as SpeechRecognitionConstructor | undefined) ??
      window.webkitSpeechRecognition);

/**
 * ThreadMessageComposer enhances the basic composer with microphone dictation.
 * Dictation is only enabled if:
 *   • The browser exposes the Web Speech API
 *   • The thread is not closed
 */
export default function ThreadMessageComposer(
  props: ThreadMessageComposerProps,
) {
  const {
    newMessage,
    setNewMessage,
    isSending,
    isThreadClosed,
    onSendMessage,
  } = props;

  const [isDictating, setIsDictating] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const initialTextRef = useRef<string>("");

  const SpeechRecognitionCtor = getSpeechRecognitionCtor();
  const isSpeechSupported = Boolean(SpeechRecognitionCtor);

  /**
   * Safely stops an active recognition session (if any) and
   * returns whether there actually was one to stop.
   */
  const stopRecognition = useCallback((): boolean => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      recognitionRef.current = null;
      return true;
    }
    return false;
  }, []);

  /**
   * Handle microphone button click:
   *  – If dictating → stop
   *  – Else, request mic permission then start recognition
   */
  const handleMicClick = async () => {
    if (!isSpeechSupported) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    if (isDictating) {
      stopRecognition();
      setIsDictating(false);
      return;
    }

    try {
      // Request permission early to surface any errors before starting recognition.
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      toast.error("Microphone permission denied");
      return;
    }

    const recognition = new SpeechRecognitionCtor!(); // ctor existence guaranteed by earlier guard
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        interimTranscript += event.results[i][0].transcript;
      }
      setNewMessage(initialTextRef.current + interimTranscript);
    };

    recognition.onerror = () => {
      toast.error("Speech recognition error");
      stopRecognition();
      setIsDictating(false);
    };

    recognition.onend = () => {
      // When the user stops speaking or microphone permission changes
      setIsDictating(false);
      stopRecognition();
    };

    initialTextRef.current = newMessage;
    recognition.start();
    setIsDictating(true);
  };

  /**
   * Cmd/Ctrl + Enter sends the message.
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (newMessage.trim() && !isSending && !isThreadClosed) {
        onSendMessage();
      }
    }
  };

  /**
   * Cleanup on unmount
   */
  useEffect(
    () => () => {
      stopRecognition();
    },
    [stopRecognition],
  );

  /**
   * Automatically stop recognition when thread is closed.
   */
  useEffect(() => {
    if (isThreadClosed) {
      stopRecognition();
      setIsDictating(false);
    }
  }, [isThreadClosed, stopRecognition]);

  return (
    <div className="relative bg-white dark:bg-transparent border rounded-md">
      {/* Textarea + overlay mic icon */}
      <div className="relative">
        <Textarea
          placeholder={
            isThreadClosed ? "Thread is closed" : "Type your message..."
          }
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending || isThreadClosed}
          // caret-blue-600 while dictating for visual feedback
          className={`w-full min-h-[60px] max-h-[200px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent px-4 pt-4 ${
            isDictating ? "caret-blue-600" : ""
          }`}
          rows={1}
        />
        {isDictating && (
          <Mic className="absolute top-3 right-5 h-4 w-4 text-blue-600 pointer-events-none" />
        )}
      </div>

      {/* Action bar */}
      <div className="flex justify-between items-center px-4 pb-4">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            disabled={isThreadClosed}
          >
            <Plus className="h-4 w-4" />
          </Button>

          {isSpeechSupported && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMicClick}
              disabled={isThreadClosed}
              className={`shrink-0 ${
                isDictating ? "text-blue-600" : "text-muted-foreground"
              }`}
            >
              <Mic className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Button
          onClick={onSendMessage}
          disabled={!newMessage.trim() || isSending || isThreadClosed}
          size="icon"
          className="shrink-0"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
