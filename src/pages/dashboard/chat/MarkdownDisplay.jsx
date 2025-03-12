import ReactMarkdown from "react-markdown"
import CopyButton from "./CopyButton"
import SpeechController from "./SpeechController"

export default function MarkdownDisplay({ content, index = 0 }) {
  return (
    <div key={index} className="relative">
      <div className="w-full h-60 mb-4 dark:bg-white/10 bg-black/45 text-white pr-10 overflow-auto p-4 rounded-lg">
        <ReactMarkdown
          components={{
            pre: ({ node, ...props }) => (
              <div className="overflow-auto w-full my-2 dark:bg-white/10 bg-black/45 p-2 rounded-lg">
                <pre className="whitespace-pre-wrap" {...props} />
              </div>
            ),
            code: ({ node, ...props }) => <code className="bg-black/10 rounded-lg p-1" {...props} />,
            p: ({ node, ...props }) => <p className="whitespace-pre-wrap mb-4" {...props} />,
          }}
          className="text-sm"
        >
          {content}
        </ReactMarkdown>
      </div>

      <div className="absolute top-2 right-2 flex flex-col gap-2">
        <CopyButton text={content} />
        <SpeechController text={content} />
      </div>
    </div>
  )
}

