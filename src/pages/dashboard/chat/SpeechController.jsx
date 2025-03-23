import React, { useCallback, useEffect, useRef, useState } from "react";
import { CircleStop, Volume2 } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";

const SpeechController = ({ text, messageId }) => {
  const { selectedVoice, activeSpeechId, setActiveSpeechId  } = useChatStore()
  const [speechState, setSpeechState] = useState("stopped");
  const utteranceRef = useRef(null);

  useEffect(() => {
    if (activeSpeechId !== messageId && speechState !== "stopped") {
      setSpeechState("stopped")
    }
  }, [activeSpeechId, messageId, speechState])

  const handleSpeak = useCallback(() => {
    if ("speechSynthesis" in window) {
      if (speechState === "stopped") {

        window.speechSynthesis.cancel()
        setActiveSpeechId(messageId)
        
        utteranceRef.current = new SpeechSynthesisUtterance(text);
        utteranceRef.current.onend = () => {
          setSpeechState("stopped")
          setActiveSpeechId(null)
        };
        // utteranceRef.current.voice = window.speechSynthesis.getVoices()[6];
        if (selectedVoice) {
          const allVoices = window.speechSynthesis.getVoices();
          const PickedVoice = allVoices.find((voice) => voice.name === selectedVoice.name)
          utteranceRef.current.voice = PickedVoice
        }


        window.speechSynthesis.speak(utteranceRef.current);
        setSpeechState("playing");
      } else if (speechState === "playing") {
        window.speechSynthesis.pause();
        setSpeechState("paused");
      } else if (speechState === "paused") {
        window.speechSynthesis.resume();
        setSpeechState("playing");
      }
    } else {
      console.error("Text-to-speech not supported in this browser.");
    }
  }, [text, speechState, selectedVoice, messageId, setActiveSpeechId]);

  const stopSpeech = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeechState("stopped");
      setActiveSpeechId(null)
    }
  }, [setActiveSpeechId]);

  return (
    <button
      onClick={speechState === "stopped" ? handleSpeak : stopSpeech}
      className="p-1 rounded-md hover:bg-gray-700/20 transition-colors"
      aria-label={speechState === "stopped" ? "Speak message" : "Stop speech"}
    >
      {speechState === "stopped" ? (
        <Volume2 className="h-4 w-4 text-gray-400" />
      ) : (
        <CircleStop className="h-4 w-4 text-[#9181F4]" />
      )}
    </button>
  );
};

export default SpeechController;
