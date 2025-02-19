import { useState, useRef, useEffect } from "react"
import { Send } from "lucide-react"
import { useWebSocket } from "@/hooks/use-socket"
import { useAuthStore } from "@/store/useAuthStore"
import ReactMarkdown from "react-markdown";

export default function Chat() {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef(null)
  const { refreshToken } = useAuthStore()

  const wsUrl = `wss://vividly-stg-api.esparkconsultants.com/chat?token=${encodeURIComponent(refreshToken)}`
  const { messages, partialMessage, sendMessage, isConnected, error } = useWebSocket(wsUrl)

  const [chatMessages, setChatMessages] = useState([])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages, messages, partialMessage])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim() || !isConnected) return

    const newMessage = {
      id: String(Date.now()),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    }

    setChatMessages((prevMessages) => [...prevMessages, newMessage])

    sendMessage(input)
    setInput("")
  }

  // Combine all messages for display and ensure they're in chronological order
  const allMessages = [
    ...chatMessages,
    ...messages,
    ...(partialMessage ? [{ ...partialMessage, timestamp: new Date().toISOString() }] : [])
  ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))


  return (
    <div className="min-h-[calc(100vh-280px)] flex items-center">
      <div className="w-full px-4 sm:px-6 py-5 pt-0">
        {error && <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg">{error}</div>}

        <div className="flex-1 w-full max-w-5xl mx-auto">
          <div className="space-y-6 pb-10 h-[400px] sm:h-[550px] 2xl:h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 pr-10">
            <div className="text-center text-sm text-gray-500 my-4">Today</div>

            {allMessages.map((message, index) => (
              <div key={message.id || `partial-${index}`} className="flex items-start gap-3">
                <div className={`flex-1 ${message.role === "user" ? "text-right" : ""}`}>
                  <div
                    className={`inline-block rounded-lg px-4 py-3 max-w-[85%] ${message.role === "user"
                        ? "dark:gradient-glass-effect bg-black text-gray-200"
                        : "dark:bg-[#1A1A1A] dark:text-gray-200 border border-[#1A1A1A] text-gray-800"
                      }`}
                  >
                    <ReactMarkdown
                      components={{
                        pre: ({ node, ...props }) => (
                          <div className="overflow-auto w-full my-2 bg-black/10 p-2 rounded-lg">
                            <pre {...props} />
                          </div>
                        ),
                        code: ({ node, ...props }) => (
                          <code className="bg-black/10 rounded-lg p-1" {...props} />
                        ),
                      }}
                      className="text-sm overflow-hidden leading-7"
                    >
                      {message.content }
                    </ReactMarkdown>

                    {message === partialMessage && <span className="inline-block animate-pulse">▋</span>}
                    

                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 dark:bg-[#14171A] bg-[#E8E9E9]  p-4 md:left-72">
          <div className="max-w-5xl mx-auto">
            <form
              onSubmit={handleSubmit}
              className="flex items-center relative dark:bg-black border border-[#9C67F4] rounded-2xl sm:p-6 p-4 sm:gap-[38px] shadow-[0px_12.62px_15.78px_-9.47px_#B6F09C0A,0px_39.44px_78.89px_-18.93px_#B6F09C1F,0px_0px_0px_4.89px_#B6F09C1F]"
            >
              <div className="absolute inset-0 border-1 rounded-2xl -z-10" />

              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Send a message..."
                className="flex-1 bg-transparent dark:text-gray-200 px-3 py-2 focus:outline-none placeholder:text-gray-600"
              />
              <button
                type="submit"
                disabled={!isConnected || !input.trim()}
                className="p-3 text-gray-400 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg bg-[#1A1D21]"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
