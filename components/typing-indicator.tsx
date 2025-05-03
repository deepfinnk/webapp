"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface TypingIndicatorProps {
  isVisible: boolean
}

export default function TypingIndicator({ isVisible }: TypingIndicatorProps) {
  const [message, setMessage] = useState("")

  const messages = [
    "I'm listening...",
    "Tell me more! 😊",
    "I'm here to help!",
    "What's on your mind?",
    "I'm all ears! 🌟",
  ]

  useEffect(() => {
    if (!isVisible) return

    setMessage(messages[Math.floor(Math.random() * messages.length)])

    const interval = setInterval(() => {
      setMessage(messages[Math.floor(Math.random() * messages.length)])
    }, 3000)

    return () => clearInterval(interval)
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div
      className="bg-gray-800 rounded-xl p-4 max-w-[80%] flex items-center gap-3"
      style={{
        borderLeft: "4px solid",
        borderRight: "4px solid",
        borderImage: "linear-gradient(to bottom, #9932CC, #FF6600) 1",
      }}
    >
      <div className="relative w-8 h-8">
        <Image src="/images/finn-emoji.png" alt="Finn emoji" fill className="object-contain" />
      </div>
      <p>{message}</p>
    </div>
  )
}
