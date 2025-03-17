import { X } from "lucide-react"


const SelectedImagePreview = ({ image, isUploading, onCancel }) => {
  return (
    <div className="relative mb-2 inline-block">
      <div className="relative max-w-[150px] max-h-[150px] rounded-lg overflow-hidden border border-gray-700 group">
        <img src={image.preview || "/placeholder.svg"} alt="Selected" className="w-full h-full object-cover" />
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
          </div>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-1 right-1 bg-black/70 rounded-full p-1 text-white hover:bg-black transition-opacity"
        >
          <X className="h-3 w-3" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 bg-black/70 py-1 px-2 text-xs text-white truncate opacity-0 group-hover:opacity-100 transition-opacity">
          {image.file.name}
        </div>
      </div>
    </div>
  )
}

export default SelectedImagePreview

