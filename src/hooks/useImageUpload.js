import { useState } from "react"
import { useToast } from "./use-toast"
import { useChatStore } from "@/store/useChatStore"
import { MODES } from "@/constant"


export function useImageUpload({
  maxSize = 10 * 1024 * 1024, // 10MB default
  allowedTypes = ["image/"],
  uploadFunction,
  onSuccess,
  onError,
}) {
  const { toast } = useToast()
  const {userUploadedImage, setUserUploadedImage, selectedImage, setSelectedImage, setMode } = useChatStore()
  const [isUploading, setIsUploading] = useState(false)

  const validateAndProcessFile = async (file) => {
    // Check file type
    const isValidType = allowedTypes.some((type) =>
      type.endsWith("/") ? file.type.startsWith(type) : file.type === type,
    )

    if (!isValidType) {
      toast({
        title: "Invalid file type",
        description: `Please select a valid file type: ${allowedTypes.map((t) => t.replace("/", "")).join(", ")}`,
        variant: "destructive",
      })
      return
    }

    // Check file size
    if (file.size > maxSize) {
      const sizeInMB = maxSize / (1024 * 1024)
      toast({
        title: "File too large",
        description: `File must be less than ${sizeInMB}MB`,
        variant: "destructive",
      })
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setSelectedImage({
        preview: e.target.result,
        file: file,
      })
    }
    reader.readAsDataURL(file)

    // Upload image
    try {
      setIsUploading(true)
      const response = await uploadFunction(file)
      setUserUploadedImage(response)
      setIsUploading(false)

      if (onSuccess) {
        onSuccess(response)
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      })
      setIsUploading(false)
      setSelectedImage(null)

      if (onError) {
        onError(error instanceof Error ? error : new Error("Unknown error"))
      }
    }
  }

  const cancelImage = () => {
    setSelectedImage(null)
    setUserUploadedImage(null)
    setMode(MODES.CHAT)
  }

  return {
    selectedImage,
    isUploading,
    userUploadedImage,
    validateAndProcessFile,
    cancelImage,
    setSelectedImage,
  }
}

