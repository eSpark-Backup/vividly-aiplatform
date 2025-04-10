import { useState, useRef, useCallback } from "react"

export function useQueueAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioQueue = useRef([])
  const currentAudio = useRef(null)
  const isProcessing = useRef(false)

  const clearQueue = useCallback(() => {
    audioQueue.current = []
    if (currentAudio.current) {
      currentAudio.current.pause()
      currentAudio.current = null
    }
    setIsPlaying(false)
    isProcessing.current = false
  }, [])

  const processQueue = useCallback(() => {
    // If already processing or no items in queue, return
    if (isProcessing.current || audioQueue.current.length === 0) {
      if (audioQueue.current.length === 0) {
        setIsPlaying(false)
      }
      return
    }

    isProcessing.current = true
    setIsPlaying(true)

    const nextChunk = audioQueue.current.shift()

    try {
      // Convert base64 audio data to Blob
      const audioData = atob(nextChunk.audio_data)
      const arrayBuffer = new ArrayBuffer(audioData.length)
      const view = new Uint8Array(arrayBuffer)

      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i) & 0xff
      }

      const blob = new Blob([arrayBuffer], { type: "audio/mpeg" })
      const audioUrl = URL.createObjectURL(blob)

      // Create audio element
      const audioElement = new Audio(audioUrl)
      currentAudio.current = audioElement

      // Set up event listeners
      audioElement.addEventListener("ended", () => {
        URL.revokeObjectURL(audioUrl)
        currentAudio.current = null
        isProcessing.current = false

        // Process next item in queue after a small delay
        setTimeout(() => {
          processQueue()
        }, 50)
      })

      audioElement.addEventListener("error", () => {
        console.error("Error playing audio chunk")
        URL.revokeObjectURL(audioUrl)
        currentAudio.current = null
        isProcessing.current = false

        // Try next audio after a delay
        setTimeout(() => {
          processQueue()
        }, 100)
      })

      // Play the audio when it's ready
      audioElement.addEventListener(
        "canplaythrough",
        () => {
          const playPromise = audioElement.play()

          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.error("Failed to play audio:", error)
              URL.revokeObjectURL(audioUrl)
              currentAudio.current = null
              isProcessing.current = false

              // Try next audio after a delay
              setTimeout(() => {
                processQueue()
              }, 100)
            })
          }
        },
        { once: true },
      )
    } catch (error) {
      console.error("Error processing audio chunk:", error)
      isProcessing.current = false

      // Try next audio after a delay
      setTimeout(() => {
        processQueue()
      }, 100)
    }
  }, [])

  const addToQueue = useCallback(
    (audioChunk) => {
      audioQueue.current.push(audioChunk)
      // console.log(`Added audio chunk to queue. Queue length: ${audioQueue.current.length}`)

      // If not currently processing, start processing the queue
      if (!isProcessing.current) {
        processQueue()
      }
    },
    [processQueue],
  )

  return {
    isPlaying,
    addToQueue,
    clearQueue,
  }
}
