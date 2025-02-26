import React, { useState, useRef, useEffect, useCallback } from "react"
import { useWebSocketContext } from "@/services/WebSocketProvider"
import { useSearchParams } from "react-router-dom"
import MessageBubble from "./MessageBubble"
import SuggestedQuestions from "./SuggestedQuestions"
import ChatInput from "./ChatInput"

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

  const [searchParams] = useSearchParams()
  const conversationId = searchParams.get("cid")

  const [input, setInput] = useState("")
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const handleSubmit = useCallback(
    (e) => {
      e?.preventDefault()
      if (!input.trim() || !isConnected) return

      sendMessage({ content: input.trim(), conversationId })
      setInput("")
      setSuggestedQuestions([])
    },
    [input, isConnected, sendMessage, conversationId, setSuggestedQuestions],
  )

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        if (!isPartialMessageLoading) handleSubmit()
      }
    },
    [handleSubmit, isPartialMessageLoading],
  )

  const handleSuggestedQuestionClick = useCallback(
    (question) => {
      sendMessage({ content: question, conversationId })
      setSuggestedQuestions([])
    },
    [sendMessage, conversationId, setSuggestedQuestions],
  )

  useEffect(() => {
    scrollToBottom()
  }, [scrollToBottom, messages, partialMessage])

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
            {/* <div className="text-center text-sm text-gray-500 my-4">Today</div> */}

            {allMessages.map((message, index) => (
              <MessageBubble key={message.id || `message-${index}`} message={message} />
            ))}

            <SuggestedQuestions
              questions={suggestedQuestions}
              partialMessage={partialMessage}
              onQuestionClick={handleSuggestedQuestionClick}
            />

            <div ref={messagesEndRef} />
          </div>
        </div>

        <ChatInput
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          handleKeyDown={handleKeyDown}
          isConnected={isConnected}
          isPartialMessageLoading={isPartialMessageLoading}
          textareaRef={textareaRef}
        />
      </div>
    </div>
  )
}









