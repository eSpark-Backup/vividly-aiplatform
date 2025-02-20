"use client"

import { useChatStore } from "@/store/useChatStore"
import { useEffect, useRef, useState, useCallback } from "react"
import { useToast } from "./use-toast"

export function useWebSocket(url) {
  const socket = useRef(null)
  const { conversations, setConversations } = useChatStore()
  const { toast } = useToast()
  const [messages, setMessages] = useState([])
  const reconnectAttempts = useRef(0)

  const [isConnected, setIsConnected] = useState(false)
  const [partialMessage, setPartialMessage] = useState(null)
  const [error, setError] = useState(null)
  const [isConversationLoading, setIsConversationLoading] = useState(false)
  const [isPartialMessageLoading, setIsPartialMessageLoading] = useState(false)

  const maxReconnectAttempts = 3

  const showToast = useCallback(
    (title, description, type) => {
      toast({ title, description, type })
    },
    [toast],
  )

  const generateId = useCallback(() => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, [])

  const sendSocketCommand = useCallback(
    (message) => {
      if (!socket.current) {
        showToast("Error", "Not connected to server", "error")
        return
      }

      if (socket.current.readyState === WebSocket.OPEN) {
        try {
          socket.current.send(JSON.stringify(message))
        } catch (err) {
          console.error("Error sending message:", err)
          showToast("Error", "Failed to send message", "error")
        }
      } else {
        showToast("Error", "Not connected to server", "error")
      }
    },
    [showToast],
  )

  const connect = useCallback(() => {
    if (!url) {
      setIsConnected(false)
      setError(null)
      return
    }

    try {
      const wsUrl = new URL(url)
      if (!wsUrl.protocol.match(/^wss?:$/)) {
        throw new Error("Invalid WebSocket protocol. Use ws:// or wss://")
      }

      if (socket.current?.readyState === WebSocket.OPEN) {
        console.log("WebSocket is already connected")
        return
      }

      socket.current = new WebSocket(url)

      socket.current.onopen = () => {
        console.log("Connected to chat server")
        setIsConnected(true)
        setError(null)
        reconnectAttempts.current = 0

        if (conversations.length === 0) {
          setIsConversationLoading(true)
          sendSocketCommand({ type: "get_conversations" })
        }
      }

      socket.current.onclose = (event) => {
        console.log("Disconnected from chat server", event)
        setIsConnected(false)

        if (!event.wasClean && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000)
          console.log(`Attempting to reconnect in ${delay}ms...`)
          setTimeout(connect, delay)
        }
      }

      socket.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          switch (data.type) {
            case "chat_stream":
              handleChatStream(data)
              break
            case "history":
              setMessages(data.messages || [])
              break
            case "conversations":
              handleConversations(data)
              break
            case "conversation_deleted":
              handleConversationDeleted(data)
              break
            case "conversation_renamed":
              handleConversationRenamed()
              break
            case "error":
              setError(data.message || "An error occurred on the server")
              break
            default:
              console.warn("Unknown message type:", data.type)
              break
          }
        } catch (err) {
          console.error("Error parsing message:", err)
          setError("Failed to parse message from server")
        }
      }

      socket.current.onerror = (event) => {
        console.error("WebSocket error:", event)
        setError("Connection error. Please check your internet connection and try again.")
      }
    } catch (err) {
      console.error("Failed to establish WebSocket connection:", err)
      setError(err instanceof Error ? err.message : "Failed to connect to chat server")
    }
  }, [url, conversations.length, sendSocketCommand])

  const handleChatStream = useCallback(
    (data) => {
      setPartialMessage((prev) => {
        const newContent = (prev?.content || "") + data.chunk

        if (data.done) {
          setMessages((prevMsgs) => [
            ...prevMsgs,
            {
              id: data.id || generateId(),
              role: "assistant",
              content: newContent,
              created_at: new Date().toISOString(),
            },
          ])

          setIsPartialMessageLoading(false)
          sendSocketCommand({ type: "get_conversations" })
          return null
        }

        return {
          id: data.id || generateId(),
          role: "assistant",
          content: newContent,
          timestamp: new Date().toISOString(),
        }
      })
    },
    [generateId, sendSocketCommand],
  )

  const handleConversations = useCallback(
    (data) => {
      setIsConversationLoading(false)
      setConversations(data.conversations || [])
    },
    [setConversations],
  )

  const handleConversationDeleted = useCallback(
    (data) => {
      if (data.success) {
        showToast("Success", "Conversation deleted successfully", "success")
        sendSocketCommand({ type: "get_conversations" })
      } else {
        showToast("Error", "Failed to delete conversation", "error")
      }
    },
    [showToast, sendSocketCommand],
  )

  const handleConversationRenamed = useCallback(() => {
    sendSocketCommand({ type: "get_conversations" })
  }, [sendSocketCommand])

  useEffect(() => {
    if (url) {
      connect()
    } else if (socket.current) {
      socket.current.close()
    }

    return () => {
      if (socket.current) {
        socket.current.close()
      }
    }
  }, [connect, url])


  //Application side code
  const sendMessage = useCallback(
    (data) => {
      const message = {
        type: "chat",
        content: data.content,
        ...(data.conversationId && { conversationId: data.conversationId }),
      }

      setIsPartialMessageLoading(true)
      sendSocketCommand(message)

      if (data.conversationId) {
        getChatHistory({ conversationId: data.conversationId })
      }
    },
    [sendSocketCommand],
  )

  const renameConversation = useCallback(
    (content) => {
      const { conversationId, title } = content
      const message = {
        type: "rename_conversation",
        conversationId,
        title,
      }
      sendSocketCommand(message)
    },
    [sendSocketCommand],
  )

  const deleteConversation = useCallback(
    (content) => {
      const { conversationId } = content
      const message = {
        type: "delete_conversation",
        conversationId,
      }
      sendSocketCommand(message)
    },
    [sendSocketCommand],
  )

  const getChatHistory = useCallback(
    (content) => {
      const message = {
        type: "get_history",
        conversationId: content.conversationId,
      }
      sendSocketCommand(message)
    },
    [sendSocketCommand],
  )

  return {
    isConnected,
    partialMessage,
    messages,
    error,
    sendMessage,
    getChatHistory,
    deleteConversation,
    renameConversation,
    isConversationLoading,
    isPartialMessageLoading,
    socket,
  }
}

