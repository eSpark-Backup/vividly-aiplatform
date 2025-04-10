import { Mic, X } from "lucide-react";
import { cn } from "@/lib/utils";
import VoiceAnimation from "./VoiceAnimation";
import { useEffect, useRef, useState } from "react";
import { SILENCE_DURATION } from "@/constant";

export default function VoiceModal({
  isListening,
  isPlaying,
  transcript,
  onClose,
  onSpeechEnd,
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const silenceTimer = useRef(null);

  useEffect(() => {
    if (isListening && transcript.trim()) {
      setIsSpeaking(true);

      if (silenceTimer.current) {
        clearTimeout(silenceTimer.current);
      }

      // Set a new silence timer
      silenceTimer.current = setTimeout(() => {
        setIsSpeaking(false);

        if (transcript.trim() && onSpeechEnd) {
          onSpeechEnd(transcript);
        }
      }, SILENCE_DURATION);
    }
  }, [transcript, isListening, onSpeechEnd]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (silenceTimer.current) {
        clearTimeout(silenceTimer.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col items-center">
      <div className="w-full max-w-2xl px-6 flex flex-col items-center justify-center h-full relative">
        <div className="mb-10 relative">
          <VoiceAnimation
            isPlaying={isPlaying}
            isListening={isListening}
            size={240}
          />
        </div>

        {/* Speech status indicator */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full bg-black/40 text-white text-sm">
          {isSpeaking && isListening && "Listening..."}
          {!isListening && !isPlaying && "Waiting for Response..."}
        </div>

        {/* Transcript display */}
        <div className="min-h-24 mb-10 text-center">
          <p className="text-white text-xl font-medium">
            {transcript}
            {isListening &&
              !transcript &&
              !isPlaying &&
              "Speak now...   I'm listening"}
            {isPlaying && "Vividly Speaking..."}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 w-full fixed bottom-16 left-0 right-0">
          {/* <button
            className={cn(
              "p-6 rounded-full transition-all",
              isListening
                ? "bg-red-500 text-white"
                : "bg-purple-600 text-white hover:bg-purple-700"
            )}
          >
            <Mic className="h-8 w-8" />
          </button> */}

          {/* Cancel button */}
          <button
            onClick={onClose}
            className="p-6 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-all"
            aria-label="Cancel voice input"
          >
            <X className="h-8 w-8" />
          </button>
        </div>
      </div>
    </div>
  );
}
