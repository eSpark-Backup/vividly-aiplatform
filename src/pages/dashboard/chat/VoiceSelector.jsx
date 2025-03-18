import React from "react"
import { useState, useEffect, useRef } from "react"
import { AudioLines } from "lucide-react"
import { cn } from "@/lib/utils"


const VoiceSelector = ({ onVoiceSelect, selectedVoice, disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [voices, setVoices] = useState([])
    const popupRef = useRef(null)

    useEffect(() => {
        const getVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices()
            if (availableVoices.length > 0) {
                setVoices(availableVoices)


                if (!selectedVoice && availableVoices.length > 0) {
                    const defaultVoice = availableVoices.find((voice) => voice.default) || availableVoices[0]
                    onVoiceSelect(defaultVoice)
                }
            }
        }

        getVoices()

        if (typeof window !== "undefined" && window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = getVoices
        }

        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            if (typeof window !== "undefined" && window.speechSynthesis) {
                window.speechSynthesis.onvoiceschanged = null
            }
        }
    }, [onVoiceSelect, selectedVoice])

    const togglePopup = () => {
        if (!disabled) {
            setIsOpen(!isOpen)
        }
    }

    const handleVoiceSelect = (voice) => {
        onVoiceSelect(voice)
        setIsOpen(false)
    }

    return (
        <div className="relative">
            <button
                type="button"
                onClick={togglePopup}
                disabled={disabled}
                className={`p-3 rounded-lg mr-2 bg-[#1A1D21] text-gray-400 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label="Select voice"
            >
                <AudioLines className="h-4 w-4" />
            </button>

            {isOpen && (
                <div
                    ref={popupRef}
                    className="absolute bottom-full mb-2 left-0 bg-[#1A1D21] dark:bg-black border border-gray-700 rounded-lg shadow-lg z-50 w-64 max-h-80 overflow-y-auto"
                >
                    <div className="p-2 border-b border-gray-700">
                        <h3 className="text-sm font-medium text-gray-300">Select a voice</h3>
                    </div>
                    <div className="p-1">
                        {voices.length > 0 ? (
                            voices.map((voice, index) => (
                                <button
                                    key={`${voice.name}-${index}`}
                                    onClick={() => handleVoiceSelect(voice)}
                                    className={cn(
                                        "w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-700 transition-colors",
                                        selectedVoice?.name === voice.name ? "bg-[#9C67F4] text-white" : "text-gray-300",
                                    )}
                                >
                                    <div className="font-medium">{voice.name}</div>
                                    <div className="text-xs opacity-70">{voice.lang}</div>
                                </button>
                            ))
                        ) : (
                            <div className="p-3 text-sm text-gray-400">No voices available</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default VoiceSelector

