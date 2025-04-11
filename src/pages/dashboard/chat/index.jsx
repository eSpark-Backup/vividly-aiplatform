import React, { useState, useRef, useEffect, useCallback } from "react";
import { useWebSocketContext } from "@/services/WebSocketProvider";
import { useSearchParams } from "react-router-dom";
import MessageBubble from "./MessageBubble";
import SuggestedQuestions from "./SuggestedQuestions";
import ChatInput from "./ChatInput";
import { useChatStore } from "@/store/useChatStore";
import { MESSAGES_PER_PAGE, MODES } from "@/constant";
import { useInView } from "react-intersection-observer";

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
    hasMoreMessages,
    setHasMoreMessages,
    initialLoadComplete,
    setInitialLoadComplete,
  } = useWebSocketContext();

  const {
    userUploadedImage,
    setUserUploadedImage,
    setSelectedImage,
    mode,
    setMode,
  } = useChatStore();
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get("cid");
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const chatContainerRef = useRef(null);

  const [offset, setOffset] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true)

  const loadingOlderMessages = useRef(false)
  const loadMoreTimeoutRef = useRef(null)

  const { ref: topRef, inView: isTopVisible } = useInView({
    threshold: 0.1,
    rootMargin: "100px 0px 0px 0px",
  });

  const handleSubmit = useCallback(
    (e) => {
      e?.preventDefault();
      if (!input.trim() || !isConnected) return;

      const data = { content: input.trim(), conversationId, userUploadedImage };
      sendMessage(mode, data);

      setInput("");
      setSelectedImage(null);
      setUserUploadedImage(null);
      setMode(MODES.CHAT);
      setSuggestedQuestions([]);
      setShouldScrollToBottom(true);

      scrollToBottom();
    },
    [
      input,
      isConnected,
      sendMessage,
      conversationId,
      setSuggestedQuestions,
      mode,
      setMode,
      setSelectedImage,
      setUserUploadedImage,
      userUploadedImage,
    ]
  );

  const handleSuggestedQuestionClick = useCallback(
    (question) => {
      const data = { content: question, conversationId };
      sendMessage(mode, data);
      setSuggestedQuestions([]);
      setShouldScrollToBottom(true);
    },
    [sendMessage, conversationId, setSuggestedQuestions]
  );

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 100);
  }, []);

  const loadMoreMessages = useCallback(() => {
    if (!isConnected || isLoadingMore || !hasMoreMessages || !conversationId) {
      console.log("Cannot load more messages:", {
        isConnected,
        isLoadingMore,
        hasMoreMessages,
        conversationId,
      })
      return
    }

    setIsLoadingMore(true)
    loadingOlderMessages.current = true

    const nextOffset = offset + 5

    // Save current scroll position and height before loading more messages
    if (chatContainerRef.current) {
      const { scrollHeight, scrollTop } = chatContainerRef.current
      chatContainerRef.current.dataset.prevScrollHeight = scrollHeight
      chatContainerRef.current.dataset.prevScrollTop = scrollTop
    }

    getChatHistory({
      conversationId,
      offset: nextOffset,
      limit: MESSAGES_PER_PAGE,
    })

    setOffset(nextOffset)
  }, [isConnected, isLoadingMore, hasMoreMessages, conversationId, offset, getChatHistory])

  useEffect(() => {
    if (shouldScrollToBottom && !loadingOlderMessages.current) {
      scrollToBottom()
    }
  }, [scrollToBottom, messages, partialMessage, isPartialMessageLoading, shouldScrollToBottom])

  useEffect(() => {
    if (isLoadingMore && messages.length > 0) {
      setTimeout(() => {
        if (chatContainerRef.current) {
          const prevScrollHeight = Number.parseFloat(chatContainerRef.current.dataset.prevScrollHeight || 0)
          const prevScrollTop = Number.parseFloat(chatContainerRef.current.dataset.prevScrollTop || 0)
          const newScrollHeight = chatContainerRef.current.scrollHeight

          // Calculate the difference in height and adjust scroll position
          const heightDifference = newScrollHeight - prevScrollHeight
          if (heightDifference > 0) {
            chatContainerRef.current.scrollTop = prevScrollTop + heightDifference
          }

          setIsLoadingMore(false)
          // Reset the loading older messages flag after a delay
          setTimeout(() => {
            loadingOlderMessages.current = false
          }, 100)
        }
      }, 100)
    }
  }, [messages, isLoadingMore])

  useEffect(() => {
    if (conversationId && isConnected) {
      setOffset(0)
      setHasMoreMessages(true)
      setShouldScrollToBottom(true)
      setInitialLoadComplete(false)
      loadingOlderMessages.current = false

      const timeout = setTimeout(() => {
        getChatHistory({ conversationId, offset: 0, limit: MESSAGES_PER_PAGE })
      }, 300)

      return () => clearTimeout(timeout)
    }
  }, [isConnected, conversationId, getChatHistory, setInitialLoadComplete])

  useEffect(() => {
    if (isTopVisible && !isLoadingMore && hasMoreMessages && initialLoadComplete) {

      // Clear any existing timeout to prevent multiple calls
      if (loadMoreTimeoutRef.current) {
        clearTimeout(loadMoreTimeoutRef.current)
      }

      // Set a new timeout to debounce the loadMoreMessages call
      loadMoreTimeoutRef.current = setTimeout(() => {
        loadMoreMessages()
        loadMoreTimeoutRef.current = null
      }, 300)
    }

    return () => {
      if (loadMoreTimeoutRef.current) {
        clearTimeout(loadMoreTimeoutRef.current)
      }
    }
  }, [isTopVisible, isLoadingMore, hasMoreMessages, initialLoadComplete, loadMoreMessages])

  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target

    // If scrolled to bottom, enable auto-scrolling for new messages
    if (scrollHeight - scrollTop - clientHeight < 50) {
      setShouldScrollToBottom(true)
    } else {
      // If scrolled up, disable auto-scrolling
      setShouldScrollToBottom(false)
    }
  }, [])


  const allMessages = [
    ...messages,
    ...(partialMessage ? [partialMessage] : []),
  ];

  return (
    <div className="min-h-[calc(100vh-400px)] flex items-center">
      <div className="w-full px-4 sm:px-6 py-5 pt-0">
        {error && (
          <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex-1 w-full max-w-5xl mx-auto">
          <div
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="space-y-6 pb-10 h-[400px] sm:h-[480px] 3xl:h-[550px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 pr-10"
          >
            {isLoadingMore && (
              <div className="flex justify-center py-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
              </div>
            )}

            <div ref={topRef} className="h-[1px]" />

            {allMessages
              .filter((message) => message.content.trim() !== "")
              .map((message, index) => (
                <MessageBubble
                  key={message.id || `message-${index}`}
                  message={message}
                />
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
  );
}
