import { useState } from "react"
import { X } from "lucide-react"

export default function ImagePreview({ src, thumbnail, type, alt }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  return (
    <>
      <div className="relative group cursor-pointer" onClick={() => setIsOpen(true)}>
        <img
          src={`data:${type};base64,${thumbnail}`}
          alt={alt}
          className="max-w-full max-h-[300px] mt-2 rounded-lg object-contain transition-all duration-200 group-hover:brightness-90"
        />
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/100 p-4"
          onClick={() => setIsOpen(false)}
        >
          {/* Fixed position close button that doesn't depend on image container */}
          <button
            className="fixed top-4 right-4 bg-white/10 rounded-full p-2 text-white hover:bg-white/20 transition-colors z-[60]"
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(false)
            }}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            </div>
          )}

          <div className="relative max-w-[90vw] max-h-[90vh] min-h-[200px] min-w-[200px] flex items-center justify-center">
            <img
              src={src || "/placeholder.svg"}
              alt={alt}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onLoad={() => setIsLoading(false)}
            />
          </div>
        </div>
      )}
    </>
  )
}

