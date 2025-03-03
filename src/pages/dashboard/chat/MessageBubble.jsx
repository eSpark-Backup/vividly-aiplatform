import React, { useState } from "react"
import { Copy, Check } from "lucide-react"
import ReactMarkdown from "react-markdown"
import HumanizeDrawer from "./HumanizeDrawer"
import HumanizeHistoryDrawer from "./HumanizeHistoryDrawer"

const MessageBubble = React.memo(({ message }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex items-start gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`inline-block rounded-lg px-4 py-3 max-w-[85%] ${message.role === "user"
          ? "dark:gradient-glass-effect bg-black text-gray-200"
          : "dark:bg-[#1A1A1A] dark:text-gray-200 border border-[#1A1A1A] text-gray-800"
          }`}
      >
        <ReactMarkdown
          components={{
            pre: ({ node, ...props }) => (
              <div className="overflow-auto w-full my-2 dark:bg-white/10 bg-black/45 p-2 rounded-lg">
                <pre {...props} />
              </div>
            ),
            code: ({ node, ...props }) => <code className="bg-black/10 rounded-lg p-1" {...props} />,
          }}
          className="text-sm overflow-hidden leading-7"
        >
          {message.content}
        </ReactMarkdown>
        <div className="flex flex-col">

          {message.role === "assistant" && (
            <div className="flex">
              <HumanizeDrawer message={message} />
              <HumanizeHistoryDrawer message={message} />
            </div>
          )}

          <div className="flex mt-2">
            <button
              onClick={handleCopy}
              className="p-1 rounded-md hover:bg-gray-700/20 transition-colors"
              aria-label={copied ? "Copied" : "Copy message"}
            >
              {copied ? <Check className="h-4 w-4 text-[#9181F4]" /> : <Copy className="h-4 w-4 text-gray-400" />}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
})

export default MessageBubble