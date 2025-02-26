import React from "react" 
import ReactMarkdown from "react-markdown"
import HumanizeDrawer from "./HumanizeDrawer"

const MessageBubble = React.memo(({ message }) => (
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
      {message.role === "assistant" && <HumanizeDrawer message={message} />}
    </div>
  </div>
))

export default MessageBubble