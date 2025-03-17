import { useRef, useState, useCallback } from "react"

export function useDragAndDrop({ onFileDrop }) {
    const [isDragging, setIsDragging] = useState(false)
    const dragCounter = useRef(0)

    const handleDrag = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
    }, [])

    const handleDragIn = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        dragCounter.current++
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true)
        }
    }, [])

    const handleDragOut = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        dragCounter.current--
        if (dragCounter.current === 0) {
            setIsDragging(false)
        }
    }, [])

    const handleDrop = useCallback(
        (e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsDragging(false)
            dragCounter.current = 0

            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                onFileDrop(e.dataTransfer.files[0])
                e.dataTransfer.clearData()
            }
        },
        [onFileDrop],
    )

    return {
        isDragging,
        dragHandlers: {
            onDragEnter: handleDragIn,
            onDragLeave: handleDragOut,
            onDragOver: handleDrag,
            onDrop: handleDrop,
        },
    }
}

