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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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
    // Guard again inside the handler to satisfy TypeScript without assertions
    const SpeechCtor = SpeechRecognitionCtor;
    if (!SpeechCtor) {
      toast({
        title: "Speech recognition unsupported",
        description: "Your browser doesn’t support the Web Speech API.",
        variant: "destructive",
      });
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
      toast({
        title: "Microphone permission denied",
        description: "Please allow microphone access to enable dictation.",
        variant: "destructive",
      });
      return;
    }

    const recognition = new SpeechCtor();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    /**
     * Fired **after** the microphone is live. We update UI state here
     * so the blue caret / mic overlay only show once speech recognition
     * is truly running, then focus the textarea for a seamless experience.
     */
    recognition.onstart = () => {
      setIsDictating(true);
      textareaRef.current?.focus({ preventScroll: true });
    };

    /**
     * Accumulate transcripts intelligently:
     *  • Interim words are shown live but replaced on every tick
     *  • Finalised text is appended permanently (tracked in `initialTextRef`)
     */
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          // Persist the finished text so future interim words append to it
          initialTextRef.current =
            `${initialTextRef.current}${transcript.trim()} `.replace(
              /\s+/g,
              " ",
            );
        } else {
          interimTranscript += transcript;
        }
      }

      setNewMessage(`${initialTextRef.current}${interimTranscript}`);
    };

    /**
     * Ignore benign errors that Chromium emits while still operating.
     * Fatal errors stop recognition and notify the user.
     */
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "no-speech" || event.error === "aborted") {
        return;
      }
      toast({
        title: "Speech recognition error",
        description: "Something went wrong while transcribing your speech.",
        variant: "destructive",
      });
      stopRecognition();
      setIsDictating(false);
    };

    /**
     * When the user stops talking or the session naturally ends.
     */
    recognition.onend = () => {
      stopRecognition();
      setIsDictating(false);
    };

    initialTextRef.current = newMessage;
    recognition.start();
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
          ref={textareaRef}
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
