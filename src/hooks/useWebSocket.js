import { useChatStore } from "@/store/useChatStore"
import { useEffect, useRef, useState, useCallback } from "react"
import { useToast } from "./use-toast"
import { useNavigate } from "react-router-dom"
import { MESSAGES_PER_PAGE } from "@/constant"

export function useWebSocket(url) {
  const socket = useRef(null)
  const { conversations, setConversations } = useChatStore()
  const { toast } = useToast()
  const navigate = useNavigate()
  const reconnectAttempts = useRef(0)

  const [messages, setMessages] = useState([])
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const [humanizedContent, setHumanizedContent] = useState("")
  const [customHumanizeContent, setCustomHumanizeContent] = useState("")
  const [AItoHumanizeInput, setAItoHumanizeInput] = useState("")
  const [suggestedQuestions, setSuggestedQuestions] = useState([])
  const [specficMessageHumanizeHistory, setSpecificMessageHumanizeHistory] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [partialMessage, setPartialMessage] = useState(null)
  const [error, setError] = useState(null)
  const [isHumanizeLoading, setIsHumanizeLoading] = useState(false)
  const [isConversationLoading, setIsConversationLoading] = useState(false)
  const [isPartialMessageLoading, setIsPartialMessageLoading] = useState(false)
  const [isSpecificMessageHistoryLoading, setIsSpecificMessageHistoryLoading] = useState(false)

  const maxReconnectAttempts = 3

  const showToast = useCallback(
    (title, description, type) => {
      toast({ title, description, type: type })
    },
    [toast],
  )

  // UTILS
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
        // showToast("Error", "Not connected to server", "error")
      }
    },
    [showToast],
  )

  // CONNECTION
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
            case "image_analysis_complete":
              handleImageAnalysisChat(data)
              break
            case "history":
              handleHistory(data)
              break
            case "conversations":
              handleConversations(data)
              break
            case "conversation_deleted":
              handleConversationDeleted(data)
              break
            case "conversation_created":
              navigate(`/home?cat=chat&cid=${data.conversation_id}`);
              break
            case "conversation_renamed":
              handleConversationRenamed()
              break
            case "humanize_complete":
              handleHumanizeComplete(data)
              break
            case "text_humanize_complete":
              handleCustomHumanizeComplete(data)
              break
            case "get_humanized_messages":
              handleGetHumanizedMessages(data)
              break
            case "error":
              showToast("Error", data.error, "error")
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


  // UTILS
  const extractQuestionsAndCleanMessage = useCallback((content) => {
    const questionRegex = /\n\*\*Q\d+:\*\*\s*(.+?)(?=\n\*\*Q\d+:\*\*|\n\n|$)/gs
    const questions = []
    let cleanedContent = content

    let match
    while ((match = questionRegex.exec(content)) !== null) {
      questions.push(match[1].trim())
    }

    if (questions.length > 0) {
      const questionsSection = content.match(/\n\*\*Q1:\*\*[\s\S]+$/)?.[0] || ""
      cleanedContent = content.replace(questionsSection, "").trim()
    }

    return { questions, cleanedContent }
  }, [])


  // ALL SERVICE HANDLERS
  const handleChatStream = useCallback(
    (data) => {
      setPartialMessage((prev) => {
        const newContent = (prev?.content || "") + data.chunk

        if (data.done) {
          const { questions, cleanedContent } = extractQuestionsAndCleanMessage(newContent)

          setMessages((prevMsgs) => [
            ...prevMsgs,
            {
              id: data.id || generateId(),
              role: "assistant",
              content: cleanedContent,
              created_at: new Date().toISOString(),
              conversation_id: data.conversationId || null,
            },
          ])

          setSuggestedQuestions(questions)
          setIsPartialMessageLoading(false)
          sendSocketCommand({ type: "get_conversations" })
          sendSocketCommand({ type: "get_history", conversationId: data.conversation_id })
          return null
        }

        return {
          id: data.id || generateId(),
          role: "assistant",
          content: newContent,
          timestamp: new Date().toISOString(),
          conversation_id: data.conversationId || null,
        }
      })
    },
    [generateId, sendSocketCommand, extractQuestionsAndCleanMessage],
  )

  const handleImageAnalysisChat = useCallback(
    (data) => {

      const { questions, cleanedContent } = extractQuestionsAndCleanMessage(data.content)

      setMessages((prevMsgs) => [
        ...prevMsgs,
        {
          id: data.id || generateId(),
          role: "assistant",
          content: cleanedContent,
          created_at: new Date().toISOString(),
          conversation_id: data.conversationId || null,
        },
      ])

      setSuggestedQuestions(questions)
      setIsPartialMessageLoading(false)
      sendSocketCommand({ type: "get_conversations" })
      // sendSocketCommand({ type: "get_history", conversationId: data.conversation_id })
      return null
    },
    [generateId, sendSocketCommand, extractQuestionsAndCleanMessage],
  )

  const handleHistory = useCallback(
    (data) => {
      const cleanedMessages = (data.messages || []).map((message) => {
        if (message.role === "assistant") {
          const { cleanedContent } = extractQuestionsAndCleanMessage(message.content)
          return { ...message, content: cleanedContent }
        }
        return message
      })

      const receivedCount = cleanedMessages.length
      const requestedLimit = MESSAGES_PER_PAGE
      const noMoreMessages = receivedCount < requestedLimit

      if (data.messages[0] && data.messages[0].offset > 0) {
        setMessages((prevMessages) => {
          const existingIds = new Set(prevMessages.map((msg) => msg.id))
          const uniqueNewMessages = cleanedMessages.filter((msg) => !existingIds.has(msg.id))

          if (uniqueNewMessages.length === 0 || noMoreMessages) {
            setHasMoreMessages(false)
          } else if (noMoreMessages) {
            setHasMoreMessages(false)
          }

          // Prepend unique new messages to the existing messages
          return [...uniqueNewMessages, ...prevMessages]
        })
      } else {
        // Initial load, just set the messages
        setMessages(cleanedMessages)

        if (noMoreMessages) {
          setHasMoreMessages(false)
        }
        setTimeout(() => {
          setInitialLoadComplete(true)
        }, 300)
      }

      if (data.messages && data.messages.length > 0) {
        const lastMessage = data.messages[data.messages.length - 1]
        if (lastMessage.role === "assistant") {
          const { questions } = extractQuestionsAndCleanMessage(lastMessage.content)
          setSuggestedQuestions(questions)
        }
      }

      navigate(`/home?cat=chat&cid=${data.conversationId}`)
    },
    [extractQuestionsAndCleanMessage, navigate, setSuggestedQuestions],
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
        showToast("success", "Conversation deleted successfully", "success")
        sendSocketCommand({ type: "get_conversations" })
        clearMessages()
        navigate("/home?cat=chat")
      } else {
        showToast("Error", "Failed to delete conversation", "destructive")
      }
    },
    [showToast, sendSocketCommand],
  )

  const handleConversationRenamed = useCallback(() => {
    sendSocketCommand({ type: "get_conversations" })
  }, [sendSocketCommand])


  const handleHumanizeComplete = useCallback((data) => {
    setIsHumanizeLoading(false)
    setHumanizedContent(data.humanized_text)
  })

  const handleCustomHumanizeComplete = useCallback((data) => {
    setIsHumanizeLoading(false)
    setCustomHumanizeContent(data.humanized_text)
  })

  const handleGetHumanizedMessages = useCallback((data) => {
    setIsSpecificMessageHistoryLoading(false)
    setSpecificMessageHumanizeHistory(data.messages)
  })

  //COMMNADS FROM USER

  const sendMessage = useCallback(
    (mode, data) => {

      const newMessage = {
        id: generateId(),
        role: "user",
        content: data.content,
        created_at: new Date().toISOString(),
        conversation_id: data.conversationId || data.conversation_id || null,
        ...(data.userUploadedImage && {images: [data.userUploadedImage]}),
      }

      // Add user message to the messages state immediately
      setMessages(prevMessages => [...prevMessages, newMessage])

      const message = {
        type: mode,
        content: data.content,
        ...(data.conversationId && { conversationId: data.conversationId }),
        ...(data.userUploadedImage && { imageId: data.userUploadedImage.image_id }),
      }

      setIsPartialMessageLoading(true)
      sendSocketCommand(message)

    },
    [sendSocketCommand, generateId],
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
        offset: content.offset || 0,
        limit: content.limit || MESSAGES_PER_PAGE,
      }
      sendSocketCommand(message)
    },
    [sendSocketCommand],
  )

  const clearMessages = useCallback(() => {
    setMessages([])
    setSuggestedQuestions([])
  }, [])


  const sendHumanizeCommand = useCallback(
    (content) => {
      const message = {
        type: "humanize",
        message_id: content.message_id,
      }

      setIsHumanizeLoading(true)
      sendSocketCommand(message)
    },
    [sendSocketCommand],
  )

  const sendReHumanizeCommand = useCallback(
    (content) => {
      const message = {
        type: "humanize",
        message_id: content.message_id,
        re_humanize: true
      }

      setIsHumanizeLoading(true)
      sendSocketCommand(message)
    },
    [sendSocketCommand],
  )

  const getSpecificMessageHumanizeHistory = useCallback(
    (content) => {
      const message = {
        type: "get_humanized_messages",
        message_id: content.message_id,
      }

      setIsSpecificMessageHistoryLoading(true)
      sendSocketCommand(message)
    },
    [sendSocketCommand],
  )

  const sendCustomHumanizeCommand = useCallback(
    (content) => {
      const message = {
        type: "humanize",
        text: content.text,
        re_humanize: false
      }

      setIsHumanizeLoading(true)
      sendSocketCommand(message)
    },
    [sendSocketCommand],
  )

  //Image Uploading
  function uploadImage(file) {
    return new Promise((resolve, reject) => {
      const messageHandler = (event) => {
        try {
          const response = JSON.parse(event.data)
          if (response.type === "error") {
            socket.current.removeEventListener("message", messageHandler)
            reject(new Error(response.error))
            return
          }
          if (response.type === "image_uploaded") {
            socket.current.removeEventListener("message", messageHandler)
            resolve(response)
            return
          }
        } catch (error) {
          console.error("Error parsing response:", error)
          socket.current.removeEventListener("message", messageHandler)
          reject(new Error("Invalid server response format"))
        }
      }

      if (socket.current.readyState !== WebSocket.OPEN) {
        return reject(new Error("WebSocket is not connected"))
      }

      socket.current.addEventListener("message", messageHandler)

      // Read the file as ArrayBuffer
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          socket.current.send(e.target.result)
        } catch (error) {
          socket.current.removeEventListener("message", messageHandler)
          reject(error)
        }
      }

      reader.onerror = (error) => {
        socket.current.removeEventListener("message", messageHandler)
        reject(error)
      }

      // Read the file as binary data
      reader.readAsArrayBuffer(file)
    })
  }


  // STARTING CONNECTION
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



  return {
    isConnected,
    partialMessage,
    messages,
    error,
    sendMessage,
    clearMessages,
    getChatHistory,
    deleteConversation,
    renameConversation,
    isConversationLoading,
    isPartialMessageLoading,
    suggestedQuestions,
    setSuggestedQuestions,
    sendHumanizeCommand,
    sendReHumanizeCommand,
    isHumanizeLoading,
    humanizedContent,
    customHumanizeContent,
    setHumanizedContent,
    isSpecificMessageHistoryLoading,
    specficMessageHumanizeHistory,
    getSpecificMessageHumanizeHistory,
    sendCustomHumanizeCommand,
    AItoHumanizeInput,
    setAItoHumanizeInput,
    uploadImage,
    socket,
    hasMoreMessages,
    setHasMoreMessages,
    initialLoadComplete,
    setInitialLoadComplete,
  }
}

