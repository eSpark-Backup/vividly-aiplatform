import "regenerator-runtime/runtime"
import { cn } from "@/lib/utils"
import React, { useEffect, useRef, useState } from "react"
import { Image, Mic, MicOff, Send, Square, Upload, X } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition"
import { MAX_FILE_SIZE, MODES } from "@/constant"
import { useChatStore } from "@/store/useChatStore"
import { useWebSocketContext } from "@/services/WebSocketProvider"
import SelectedImagePreview from "./SelectedImagePreview"
import { useDragAndDrop } from "@/hooks/UseDragAndDrop"
import { useImageUpload } from "@/hooks/useImageUpload"



const ChatInput = React.memo(
  ({ input, setInput, handleSubmit, isConnected, isPartialMessageLoading, textareaRef, disabled = false }) => {

    const { mode, setMode } = useChatStore()
    const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition()
    const { uploadImage } = useWebSocketContext()


    const isImageMode = MODES.CHAT_WITH_IMAGE === mode

    const fileInputRef = useRef(null)

    const { selectedImage, isUploading, userUploadedImage, validateAndProcessFile, cancelImage } = useImageUpload({
      maxSize: MAX_FILE_SIZE,
      allowedTypes: ["image/"],
      uploadFunction: (file) => uploadImage(file),
      onSuccess: () => {
        setMode(MODES.CHAT_WITH_IMAGE_ANALYSIS)
      },
      onError: () => {
        setMode(MODES.CHAT)
      }
    })

    const toggleRecording = () => {

      if (listening) {
        SpeechRecognition.stopListening()
      } else {
        resetTranscript()
        SpeechRecognition.startListening({ continuous: true })
      }
    }

    const stopRecording = () => {
      if (listening) {
        SpeechRecognition.stopListening()
      }
    }

    const onEnter = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        if (!isPartialMessageLoading) {
          stopRecording()
          handleSubmit(e)
        }
      }
    }

    const handleChatModes = () => {
      isImageMode ? setMode(MODES.CHAT) : setMode(MODES.CHAT_WITH_IMAGE)
    }


    const handleFileSelect = (e) => {
      const file = e.target.files[0]
      if (file) {
        validateAndProcessFile(file)
      }
    }


    const triggerFileInput = () => {
      fileInputRef.current.click()
    }

    const { isDragging, dragHandlers } = useDragAndDrop({
      onFileDrop: validateAndProcessFile,
    })

    useEffect(() => {
      return () => {
        if (listening) {
          SpeechRecognition.stopListening()
        }
      }
    }, [listening])

    useEffect(() => {
      setInput(transcript)
    }, [transcript])

    return (
      <div className="fixed bottom-0 left-0 right-0 dark:bg-[#14171A] bg-[#E8E9E9] p-4 md:left-72">
        <div className="max-w-5xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className={cn("flex items-center relative dark:bg-black border border-[#9C67F4] rounded-2xl sm:p-6 p-4 sm:gap-[38px] shadow-[0px_12.62px_15.78px_-9.47px_#B6F09C0A,0px_39.44px_78.89px_-18.93px_#B6F09C1F,0px_0px_0px_4.89px_#B6F09C1F]", isDragging && "border-primary border-dashed")}
            {...dragHandlers}
          >
            <div className="absolute inset-0 border-1 rounded-2xl -z-10" />

            {selectedImage && (
              <SelectedImagePreview image={selectedImage} isUploading={isUploading} onCancel={cancelImage} />
            )}

            <div className="flex items-center w-full">
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />

              {browserSupportsSpeechRecognition && (
                <button
                  type="button"
                  onClick={toggleRecording}
                  disabled={disabled || !isConnected}
                  className={`p-3 rounded-full mr-2 transition-colors ${listening ? "bg-red-500 text-white animate-pulse" : "bg-[#1A1D21] text-gray-400 rounded-lg hover:text-gray-300"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  aria-label={listening ? "Stop recording" : "Start voice recording"}
                >
                  {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              )}

              <button
                type="button"
                onClick={triggerFileInput}
                disabled={disabled || !isConnected || isUploading}
                className="p-3 rounded-lg mr-2 bg-[#1A1D21] text-gray-400 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Upload image"
              >
                <Upload className="h-4 w-4" />
              </button>

              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onEnter}
                placeholder="Send a message..."
                className="flex-1 bg-transparent dark:text-gray-200 px-3 py-2 focus:outline-none placeholder:text-gray-600 min-h-[40px] max-h-[200px] resize-none"
              />


              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleChatModes}
                  disabled={!isConnected || isPartialMessageLoading || listening || userUploadedImage}
                  className="p-3 text-gray-400 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg bg-[#1A1D21]"
                >
                  <Image
                    className={cn(`h-4 w-4`, isImageMode && "text-[#9C67F4]")} />
                </button>

                <button
                  type="submit"
                  disabled={!isConnected || !input.trim() || isPartialMessageLoading || listening}
                  className="p-3 text-gray-400 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg bg-[#1A1D21]"
                >
                  {!isPartialMessageLoading ? <Send className="h-4 w-4" /> : <Square className="h-5 w-5 animate-spin" />}
                </button>
              </div>
            </div>

            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl pointer-events-none">
                <div className="bg-black/70 text-white px-4 py-2 rounded-lg">Drop image here</div>
              </div>
            )}
          </form>
        </div>
      </div>
    )
  }
)

export default ChatInput