import { useRef, useEffect } from "react"
import cn from "classnames"

export default function VoiceAnimation({ isListening, isPlaying = false, size = 240 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions with device pixel ratio for sharpness
    const dpr = window.devicePixelRatio || 1
    const canvasSize = size * dpr
    canvas.width = canvasSize
    canvas.height = canvasSize
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    let animationFrame
    let time = 0
    const particles = []

    // Create particles for talking animation
    if (isPlaying) {
      for (let i = 0; i < 20; i++) {
        particles.push({
          x: Math.random() * canvasSize,
          y: Math.random() * canvasSize,
          size: Math.random() * 4 + 2,
          speedX: Math.random() * 2 - 1,
          speedY: Math.random() * 2 - 1,
          opacity: Math.random() * 0.5 + 0.3,
        })
      }
    }

    const render = () => {
      time += isPlaying ? 0.05 : 0.02

      // Clear canvas
      ctx.clearRect(0, 0, canvasSize, canvasSize)

      const centerX = canvasSize / (2 * dpr)
      const centerY = canvasSize / (2 * dpr)
      const radius = size * 0.42

      // Create gradient
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY + 20, // Offset to make bottom more blue
        radius * 0.2,
        centerX,
        centerY,
        radius,
      )

      if (isPlaying) {
        // Much more vibrant colors when talking
        gradient.addColorStop(0, `rgba(255, 230, 255, ${0.9 + Math.sin(time * 3) * 0.1})`)
        gradient.addColorStop(0.5, `rgba(210, 150, 255, ${0.8 + Math.sin(time * 2) * 0.1})`)
        gradient.addColorStop(1, `rgba(150, 50, 255, ${0.7 + Math.sin(time) * 0.1})`)
      } else {
        // Original colors
        gradient.addColorStop(0, "rgba(235, 200, 255, 0.9)")
        gradient.addColorStop(0.5, "rgba(180, 140, 255, 0.8)")
        gradient.addColorStop(1, "rgba(100, 0, 200, 0.6)")
      }

      ctx.fillStyle = gradient

      ctx.beginPath()

      // Create wavy circle with dramatically different behavior when playing
      for (let angle = 0; angle < Math.PI * 2; angle += 0.01) {
        let waveAmplitude, waveFrequency, waviness

        if (isPlaying) {
          // DRAMATICALLY more dynamic when talking
          waveAmplitude = 12 + Math.sin(time * 3) * 8

          // Add voice-like patterns with multiple frequencies
          waveFrequency = 12

          // Complex wave pattern for talking
          waviness = Math.sin(angle * waveFrequency + time * 5) * waveAmplitude
          waviness += Math.sin(angle * 8 + time * 7) * (waveAmplitude * 0.5)
          waviness += Math.sin(angle * 20 + time * 10) * (waveAmplitude * 0.3)

          // Add random spikes for speech effect
          if (Math.random() > 0.85) {
            waviness *= 1.5
          }
        } else if (isListening) {
          // Regular listening animation
          waveAmplitude = 3 + Math.sin(time * 2) * 2
          waveFrequency = 6
          waviness = Math.sin(angle * waveFrequency + time) * waveAmplitude
        } else {
          // Static state
          waveAmplitude = 0
          waveFrequency = 6
          waviness = 0
        }

        const radiusWithWave = radius + waviness
        const x = centerX + Math.cos(angle) * radiusWithWave
        const y = centerY + Math.sin(angle) * radiusWithWave

        if (angle === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }

      ctx.closePath()
      ctx.fill()

      // Add glow effect
      ctx.shadowColor = isPlaying
        ? `rgba(150, 100, 255, ${0.7 + Math.sin(time * 3) * 0.3})`
        : "rgba(100, 180, 255, 0.6)"
      ctx.shadowBlur = isPlaying ? 30 : 20
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      // Pulse effect
      const pulseScale = isPlaying
        ? 1 + Math.sin(time * 3) * 0.08 + Math.sin(time * 7) * 0.04
        : isListening
          ? 1 + Math.sin(time) * 0.03
          : 1

      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.scale(pulseScale, pulseScale)
      ctx.translate(-centerX, -centerY)

      // Draw another softer circle for the glow
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius * 0.95, 0, Math.PI * 2)
      ctx.fillStyle = isPlaying ? `rgba(200, 150, 255, ${0.4 + Math.sin(time * 2) * 0.2})` : "rgba(180, 220, 255, 0.3)"
      ctx.fill()

      // Draw particles when talking
      if (isPlaying) {
        particles.forEach((particle, index) => {
          // Update particle position
          particle.x += particle.speedX
          particle.y += particle.speedY

          // Reset particles that go off-screen
          if (particle.x < 0 || particle.x > canvasSize || particle.y < 0 || particle.y > canvasSize) {
            particles[index] = {
              x: centerX + (Math.random() * radius * 2 - radius),
              y: centerY + (Math.random() * radius * 2 - radius),
              size: Math.random() * 4 + 2,
              speedX: Math.random() * 4 - 2,
              speedY: Math.random() * 4 - 2,
              opacity: Math.random() * 0.5 + 0.3,
            }
          }

          // Draw particle
          ctx.beginPath()
          ctx.arc(particle.x / dpr, particle.y / dpr, particle.size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`
          ctx.fill()
        })

        // Draw sound wave rings
        if (Math.random() > 0.7) {
          ctx.beginPath()
          const ringRadius = radius * (0.5 + Math.random() * 0.5)
          ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`
          ctx.lineWidth = 2
          ctx.stroke()
        }
      }

      ctx.restore()

      animationFrame = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [isListening, isPlaying, size])

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "rounded-full transition-opacity duration-300",
        isPlaying ? "opacity-100" : isListening ? "opacity-100" : "opacity-70",
      )}
      width={size}
      height={size}
    />
  )
}
