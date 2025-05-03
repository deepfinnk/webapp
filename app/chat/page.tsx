"use client"

import { ArrowLeft, Share, Menu, Paperclip, ArrowUp, X, ChevronRight, Edit } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import FinnAnimation from "@/components/finn-animation"
import ReactMarkdown from 'react-markdown'

// Define the interface for a chat history item
interface ChatHistoryItem {
  prompt: string
  result: string
  created_at: string
}

export default function Chat() {
  const [message, setMessage] = useState("")
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false)
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([])
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi, I am Finn your Personal Assistant and Financial Consultant.",
      isUser: false,
    },
  ])

  // Function to fetch chat history
  const fetchChatHistory = async () => {
    if (isHistoryLoading) return;
    
    setIsHistoryLoading(true);
    setHistoryError(null);
    
    try {
      const response = await fetch('/api/chat/history');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || 'Failed to fetch chat history');
      }
      
      const data = await response.json();
      
      // Debug logging to see the data structure
      console.log('Chat history API response:', data);
      
      // Handle different possible response formats
      let historyArray: ChatHistoryItem[] = [];
      
      if (data.history && Array.isArray(data.history)) {
        // If response has a history property containing the array
        historyArray = data.history;
      } else if (Array.isArray(data)) {
        // If response is directly an array
        historyArray = data;
      }
      
      // Verify each history item has the required fields
      const validHistoryItems = historyArray.filter(item => 
        item && typeof item === 'object' && 
        'prompt' in item && 
        'created_at' in item
      );
      
      console.log('Filtered history items:', validHistoryItems);
      
      // Sort by created_at in descending order (newest first)
      const sortedHistory = [...validHistoryItems].sort((a, b) => {
        const dateA = new Date(b.created_at).getTime();
        const dateB = new Date(a.created_at).getTime();
        return dateA - dateB;
      });
      
      setChatHistory(sortedHistory);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setHistoryError(error instanceof Error ? error.message : 'Failed to load chat history');
    } finally {
      setIsHistoryLoading(false);
    }
  };
  
  // Fetch chat history when the page loads
  useEffect(() => {
    fetchChatHistory();
  }, []);
  
  // Helper function to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if the date is today
    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    }
    
    // Check if the date is yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Otherwise, return the formatted date
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };
  
  // Function to start a new chat
  const startNewChat = () => {
    // Reset messages to only the welcome message
    setMessages([
      {
        id: 1,
        text: "Hi, I am Finn your Personal Assistant and Financial Consultant.",
        isUser: false,
      },
    ]);
    // Close the history panel
    setIsHistoryPanelOpen(false);
  }

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
          body: JSON.stringify({ prompt: currentMessage }),
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
        // Extract the 'result' field from the API response
        let rawResponse = data.result || "Sorry, I didn't get a valid answer."; 

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

        // Fetch updated chat history after successful query
        fetchChatHistory();

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

  // Function to load a chat from history
  const loadChatFromHistory = (historyItem: ChatHistoryItem) => {
    setMessages([
      {
        id: 1,
        text: "Hi, I am Finn your Personal Assistant and Financial Consultant.",
        isUser: false,
      },
      {
        id: 2,
        text: historyItem.prompt,
        isUser: true,
      },
      {
        id: 3,
        text: historyItem.result,
        isUser: false,
      }
    ]);
    setIsHistoryPanelOpen(false);
  };

  // Function to toggle the history panel
  const toggleHistoryPanel = () => {
    setIsHistoryPanelOpen(prev => !prev);
  };

  return (
    <div className="flex flex-col h-screen bg-black relative overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <Link href="/">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="flex gap-4">
          <Share className="w-6 h-6" />
          <button onClick={toggleHistoryPanel} aria-label="Open chat history">
            <Menu className="w-6 h-6" />
          </button>
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
      
      {/* Sliding Chat History Panel */}
      <div 
        className={`fixed inset-x-0 bottom-0 z-50 bg-black max-w-md mx-auto transform transition-transform duration-300 ease-in-out ${isHistoryPanelOpen ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ 
          height: '70vh',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          borderTop: '1px solid #333',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.5)' 
        }}
      >
        {/* Panel Header with Close Button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold">Chats</h2>
          <button onClick={() => setIsHistoryPanelOpen(false)} className="p-1 rounded-full hover:bg-gray-800">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* New Chat Button */}
        <div className="p-4 border-b border-gray-800">
          <button 
            onClick={startNewChat}
            className="flex items-center w-full p-3 rounded-xl bg-gray-900 hover:bg-gray-800 transition-colors"
          >
            <Edit className="w-5 h-5 mr-3 text-blue-400" />
            <span className="font-medium">New Chat</span>
            <ChevronRight className="ml-auto w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto">
          {isHistoryLoading ? (
            <div className="flex items-center justify-center h-20">
              <div className="text-gray-400">Loading chat history...</div>
            </div>
          ) : historyError ? (
            <div className="p-4 text-center text-red-500">
              <p>{historyError}</p>
              <button 
                onClick={fetchChatHistory}
                className="mt-2 text-blue-400 underline"
              >
                Try again
              </button>
            </div>
          ) : chatHistory.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <p>No previous chats found</p>
            </div>
          ) : (
            <div>
              {/* Group chats by date */}
              {(() => {
                const dateGroups: Record<string, ChatHistoryItem[]> = {};
                
                // Group items by date string
                chatHistory.forEach(item => {
                  const dateString = formatDate(item.created_at);
                  if (!dateGroups[dateString]) {
                    dateGroups[dateString] = [];
                  }
                  dateGroups[dateString].push(item);
                });
                
                // Render groups
                return Object.entries(dateGroups).map(([dateString, items]) => (
                  <div key={dateString}>
                    <div className="px-4 py-2 text-sm font-semibold text-gray-400 bg-gray-900">
                      {dateString}
                    </div>
                    {items.map((item, index) => {
                      // Format the time portion of the date
                      const timeString = new Date(item.created_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      });
                      
                      return (
                        <button
                          key={index}
                          onClick={() => loadChatFromHistory(item)}
                          className="w-full text-left p-4 border-b border-gray-800 hover:bg-gray-900 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm text-gray-400">{timeString}</span>
                            <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                          </div>
                          <p className="text-white truncate font-medium">{item.prompt}</p>
                        </button>
                      );
                    })}
                  </div>
                ));
              })()} 
            </div>
          )}
        </div>
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
