import React from "react"
import ReactMarkdown from "react-markdown"
import HumanizeDrawer from "./HumanizeDrawer"
import HumanizeHistoryDrawer from "./HumanizeHistoryDrawer"
import SpeechController from "./SpeechController"
import CopyButton from "./CopyButton"
import ImagePreview from "./ImagePreview"

const MessageBubble = React.memo(({ message }) => {

  return (
    <div className={`flex items-start gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`inline-block rounded-lg px-4 py-3 sm:max-w-[85%] max-w-[100%] ${message.role === "user"
          ? "dark:gradient-glass-effect bg-black text-gray-200 !cursor-text"
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
            p: ({ node, ...props }) => <p className="whitespace-pre-wrap" {...props} />,
          }}
          className="text-sm overflow-hidden leading-7"
        >
          {message.content}
        </ReactMarkdown>

        <div>
          {message.images && message?.images[0]?.url
            &&
            <ImagePreview src={message.images[0].url || "/placeholder.svg"} thumbnail={message.images[0].thumbnail} type={message.images[0].type} alt={message.content} />
          }
        </div>

        <div className="flex flex-col">

          {message.role === "assistant" && (
            <>
              <div className="flex">
                <HumanizeDrawer message={message} />
                <HumanizeHistoryDrawer message={message} />
              </div>

              <div className="flex mt-2 gap-1">
                <CopyButton text={message.content} />
                <SpeechController text={message.content} messageId={message.id} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
})

export default MessageBubble