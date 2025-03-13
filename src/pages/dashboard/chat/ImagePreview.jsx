import { useState } from "react"
import { X } from "lucide-react"

export default function ImagePreview({ src, alt }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className="relative group cursor-pointer" onClick={() => setIsOpen(true)}>
        <img
          src={src || "/placeholder.svg"}
          alt={alt}
          className="max-w-full max-h-[300px] mt-2 rounded-lg object-contain transition-all duration-200 group-hover:brightness-90"
        />
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/100 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <button
              className="absolute -top-10 right-0 bg-white/10 rounded-full p-2 text-white hover:bg-white/20 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(false)
              }}
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={src || "/placeholder.svg"}
              alt={alt}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  )
}

