import React, { useState, useRef, useEffect, useCallback } from "react"
import { useWebSocketContext } from "@/services/WebSocketProvider"
import { useSearchParams } from "react-router-dom"
import MessageBubble from "./MessageBubble"
import SuggestedQuestions from "./SuggestedQuestions"
import ChatInput from "./ChatInput"
import { useChatStore } from "@/store/useChatStore"
import { MODES } from "@/constant"

export default function Chat() {
  const {
    messages,
    partialMessage,
    sendMessage,
    isConnected,
    error,
    isPartialMessageLoading,
    getChatHistory,
    suggestedQuestions,
    setSuggestedQuestions,
  } = useWebSocketContext()

  const { userUploadedImage, setUserUploadedImage, setSelectedImage, mode, setMode } = useChatStore()
  const [searchParams] = useSearchParams()
  const conversationId = searchParams.get("cid")
  const [input, setInput] = useState("")
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const handleSubmit = useCallback(
    (e) => {
      e?.preventDefault()
      if (!input.trim() || !isConnected) return

      const data = { content: input.trim(), conversationId, userUploadedImage }
      sendMessage(mode, data)
      console.log("Form Data:", data, mode);
      
      setInput("")
      setSelectedImage(null)
      setUserUploadedImage(null)
      setMode(MODES.CHAT)
      setSuggestedQuestions([])


      scrollToBottom()
    },
    [input, isConnected, sendMessage, conversationId, setSuggestedQuestions],
  )

  const handleSuggestedQuestionClick = useCallback(
    (question) => {
      const data = { content: question, conversationId }
      sendMessage(mode, data)
      setSuggestedQuestions([])
    },
    [sendMessage, conversationId, setSuggestedQuestions],
  )

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: "smooth", 
        block: "end" 
      })
    }, 100) 
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [scrollToBottom, messages, partialMessage, isPartialMessageLoading])

  useEffect(() => {
    if (conversationId && isConnected) {
      const timeout = setTimeout(() => {
        getChatHistory({ conversationId })
      }, 1000)

      return () => clearTimeout(timeout)
    }
  }, [isConnected, conversationId, getChatHistory])

  const allMessages = [...messages, ...(partialMessage ? [partialMessage] : [])]

  return (
    <div className="min-h-[calc(100vh-280px)] flex items-center">
      <div className="w-full px-4 sm:px-6 py-5 pt-0">
        {error && <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg">{error}</div>}

        <div className="flex-1 w-full max-w-5xl mx-auto">
          <div className="space-y-6 pb-10 h-[400px] sm:h-[550px] 2xl:h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 pr-10">

            {allMessages.map((message, index) => (
              <MessageBubble key={message.id || `message-${index}`} message={message} />
            ))}

            <SuggestedQuestions
              questions={suggestedQuestions}
              partialMessage={partialMessage}
              onQuestionClick={handleSuggestedQuestionClick}
            />

            <div ref={messagesEndRef} className="h-[20px]" />
          </div>
        </div>

        <ChatInput
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          isConnected={isConnected}
          isPartialMessageLoading={isPartialMessageLoading}
          textareaRef={textareaRef}
        />
      </div>
    </div>
  )
}









