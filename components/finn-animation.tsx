"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"

interface FinnAnimationProps {
  isVisible: boolean
  label?: string
}

export default function FinnAnimation({ isVisible, label = "Thinking" }: FinnAnimationProps) {
  const [dots, setDots] = useState(".")
  const animationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isVisible) return

    // Animate the dots
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : prev + "."))
    }, 500)

    return () => {
      clearInterval(dotsInterval)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* Main animation container */}
      <div className="relative w-24 h-24" ref={animationRef}>
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-blue-500 via-green-500 via-yellow-500 to-orange-500 opacity-50 blur-md animate-pulse"></div>

        {/* Rainbow ring */}
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-blue-500 via-green-500 via-yellow-500 to-orange-500 animate-spin"
          style={{ animationDuration: "8s" }}
        ></div>

        {/* Inner black circle */}
        <div className="absolute inset-2 bg-black rounded-full flex items-center justify-center">
          {/* Finn emoji with subtle bounce animation */}
          <div className="relative w-16 h-16 animate-bounce-subtle overflow-hidden rounded-full flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[90%] h-[90%] relative">
                <Image 
                  src="/images/finn-emoji.png" 
                  alt="Finn emoji" 
                  fill 
                  className="object-cover"  // Ensures proper cropping while maintaining the aspect ratio
                  style={{ marginLeft: "-2.5px" }} // Adjusted position to move Finn image slightly to the left
                />
              </div>
            </div>
          </div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                backgroundColor: [
                  "#9932CC", // Purple
                  "#0078D7", // Blue
                  "#22c55e", // Green
                  "#eab308", // Yellow
                  "#FF6600", // Orange
                  "#ec4899", // Pink
                ][i % 6],
                top: `${Math.sin((Date.now() / 1000 + i) * 0.5) * 60 + 50}%`,
                left: `${Math.cos((Date.now() / 1000 + i) * 0.5) * 60 + 50}%`,
                opacity: 0.8,
                filter: "blur(1px)",
                animation: `float-${i % 6} ${3 + (i % 3)}s infinite ease-in-out`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Thinking text with dots */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center justify-center bg-gray-800 rounded-full px-4 py-2">
          <span className="text-white">{label}{dots}</span>
        </div>
      </div>
    </div>
  )
}
