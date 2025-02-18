import { useState, useRef, useEffect } from "react"
import { Send } from "lucide-react"
import { useSocketIO } from "@/hooks/use-socket"

export default function Chat() {
    const [input, setInput] = useState("")
    const messagesEndRef = useRef(null)
    const { messages, sendMessage, isConnected, error } = useSocketIO(import.meta.env.VITE_SOCKET_URL)

    const [chatMessages, setChatMessages] = useState([
        { id: "1", role: "assistant", content: "Hello! How can I assist you today?", timestamp: "2023-06-10T10:00:00Z" },
        { id: "2", role: "user", content: "I have a question about React hooks.", timestamp: "2023-06-10T10:01:00Z" },
        {
            id: "3",
            role: "assistant",
            content: "Sure, I'd be happy to help with React hooks. What specific question do you have?",
            timestamp: "2023-06-10T10:02:00Z",
        },
        { id: "4", role: "user", content: "Can you explain the useEffect hook?", timestamp: "2023-06-10T10:03:00Z" },
        {
            id: "5",
            role: "assistant",
            content: "Certainly! The useEffect hook in React is used for side effects in function components. It serves a similar purpose to lifecycle methods in class components.",
            timestamp: "2023-06-10T10:04:00Z",
        },
        { id: "6", role: "user", content: "What kind of side effects can useEffect handle?", timestamp: "2023-06-10T10:05:00Z" },
        {
            id: "7",
            role: "assistant",
            content: "useEffect is used for data fetching, subscriptions, manually changing the DOM, timers, and more. It allows you to run side effects in functional components efficiently.",
            timestamp: "2023-06-10T10:06:00Z",
        },
        { id: "8", role: "user", content: "How do I clean up side effects in useEffect?", timestamp: "2023-06-10T10:07:00Z" },
        {
            id: "9",
            role: "assistant",
            content: "Great question! To clean up side effects, return a cleanup function inside useEffect. This is useful for unsubscribing from APIs, clearing timers, etc.",
            timestamp: "2023-06-10T10:08:00Z",
        },
        { id: "10", role: "user", content: "Can I use multiple useEffect hooks in a single component?", timestamp: "2023-06-10T10:09:00Z" },
    ])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [chatMessages, messages])

    const handleSubmit = (e) => {
        e.preventDefault()
        // if (!input.trim() || !isConnected) return

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

    return (
        <div className="min-h-[calc(100vh-280px)] flex items-center">
            <div className="w-full px-4 sm:px-6 py-5 pt-0">
                {error && <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg">{error}</div>}

                <div className="flex-1 w-full max-w-5xl mx-auto">
                    <div className="space-y-6 pb-10 h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 pr-10">
                        <div className="text-center text-sm text-gray-500 my-4">Today</div>

                        {[...chatMessages, ...messages].map((message) => (
                            <div key={message.id} className="flex items-start gap-3">
                                <div className={`flex-1 ${message.role === "user" ? "text-right" : ""}`}>
                                    <div
                                        className={`inline-block rounded-lg px-4 py-3 max-w-[85%] ${message.role === "user"
                                            ? "dark:gradient-glass-effect bg-black text-gray-200"
                                            : "bg-[#1A1A1A] text-gray-200"
                                            }`}
                                    >
                                        {message.content}
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
                            className="flex items-center relative dark:bg-black border border-[#9C67F4] rounded-2xl sm:p-6 p-4 sm:gap-[38px] shadow-[0px_12.62px_15.78px_-9.47px_#B6F09C0A,0px_39.44px_78.89px_-18.93px_#B6F09C1F,0px_0px_0px_4.89px_#B6F09C1F]">
                            <div className="absolute inset-0 border-1 rounded-2xl -z-10" />

                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Send a message..."
                                className="flex-1 bg-transparent dark:text-gray-200 px-3 py-2 focus:outline-none placeholder:text-gray-600"
                            />
                            <button
                                type="submit"
                                // disabled={!isConnected || !input.trim()}
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
