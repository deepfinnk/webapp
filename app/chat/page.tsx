"use client"

import { ArrowLeft, Share, Menu, Paperclip, ArrowUp } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import FinnAnimation from "@/components/finn-animation"
import ReactMarkdown from 'react-markdown'

export default function Chat() {
  const [message, setMessage] = useState("")
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi, I am Finn your Personal Assistant and Financial Consultant.",
      isUser: false,
    },
  ])

  // Sample responses from Finn
  const finnResponses = [
    "I've analyzed your spending patterns and noticed you could save more by reducing restaurant expenses.",
    "Based on your current balance, I recommend setting aside €200 for your emergency fund this month.",
    "Your investment portfolio is performing well! Would you like me to show you some new opportunities?",
    "I've found a way to help you save on your monthly subscriptions. Would you like to know more?",
    "Your savings are growing steadily! You're 65% of the way to your vacation goal.",
    "I noticed an unusual transaction yesterday. Would you like me to look into it?",
    "Great news! You've spent less on groceries this month compared to last month.",
    "I've prepared a budget plan for your upcoming trip. Would you like to see it?",
  ]

  const handleSend = async () => {
    if (message.trim()) {
      const userMessage = { id: messages.length + 1, text: message, isUser: true };
      // Add user message immediately
      setMessages((prev) => [...prev, userMessage]);
      const currentMessage = message; // Store message before clearing
      setMessage("");

      // Show animation
      setIsWaitingForResponse(true);

      try {
        // Call the internal Next.js API route
        const response = await fetch('/api/chat', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ task: currentMessage }),
        });

        setIsWaitingForResponse(false);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: response.statusText })); 
          console.error("API Error:", response.status, errorData.error);
          setMessages((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              text: `Sorry, I encountered an error: ${errorData.error || 'Unknown error'}`, 
              isUser: false 
            }
          ]);
          return;
        }

        const data = await response.json();
        // Extract the 'answer' field from the API response
        let rawResponse = data.answer || "Sorry, I didn't get a valid answer."; 

        // Strip the prefix if it exists
        const prefix = "Solution: ";
        if (typeof rawResponse === 'string' && rawResponse.startsWith(prefix)) {
          rawResponse = rawResponse.substring(prefix.length);
        }
        
        const finnResponse = rawResponse;

        setMessages((prev) => [
          ...prev,
          { id: prev.length + 1, text: finnResponse, isUser: false },
        ]);

      } catch (error) {
        setIsWaitingForResponse(false);
        console.error("Failed to send message:", error);
        let errorMessage = "Sorry, I couldn't connect to the service.";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        setMessages((prev) => [
          ...prev,
          { id: prev.length + 1, text: errorMessage, isUser: false },
        ]);
      }
    }
  }

  return (
    <div className="flex flex-col h-screen bg-black">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <Link href="/">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="flex gap-4">
          <Share className="w-6 h-6" />
          <Menu className="w-6 h-6" />
        </div>
      </div>

      <div className="flex items-center justify-center py-6">
        <div className="flex flex-col items-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center">
              <div className="w-[90%] h-[90%] relative">
                <Image src="/images/finn-emoji.png" alt="Finn emoji" fill className="object-contain" />
              </div>
            </div>
          </div>
          <div className="mt-2 text-white">
            <div className="text-xl font-bold">DeepFinnk</div>
            <div className="text-center">0.5</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${
              msg.isUser
                ? "bg-blue-primary rounded-xl p-4 ml-auto max-w-[80%]"
                : "bg-gray-800 rounded-xl p-4 max-w-[80%]"
            }`}
            style={
              !msg.isUser
                ? {
                    borderLeft: "4px solid",
                    borderRight: "4px solid",
                    borderImage: "linear-gradient(to bottom, #9932CC, #FF6600) 1",
                  }
                : {}
            }
          >
            <div className="flex-1">
              {/* Use ReactMarkdown for assistant messages, plain <p> for user */}
              {msg.isUser ? (
                <p>{msg.text}</p>
              ) : (
                // Wrap ReactMarkdown in a div and apply prose styles there
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown>
                    {msg.text}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Show the animation only when waiting for response */}
        <FinnAnimation isVisible={isWaitingForResponse} />
      </div>

      <div className="p-4 border-t border-gray-800 flex items-center gap-2">
        <Paperclip className="w-6 h-6" />
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend()
            }
          }}
          placeholder="Type a message..."
          className="flex-1 bg-gray-800 rounded-full py-2 px-4 focus:outline-none"
        />
        <button
          onClick={handleSend}
          className="w-12 h-12 bg-blue-primary rounded-full flex items-center justify-center"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}
