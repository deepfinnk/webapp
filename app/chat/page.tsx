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

interface Message {
  id: number
  text: string
  isUser: boolean
  points?: string[] // For bullet points in a plan
  isPlan?: boolean // Flag to render as a plan with buttons
  isConfirmed?: boolean // Flag to indicate if a plan has been confirmed
}

// Utility function to format time in a consistent way between server and client
const formatTimeString = (dateStr: string) => {
  try {
    // Extract hours and minutes in a consistent format
    const date = new Date(dateStr);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
    
    return `${displayHours}:${minutes} ${ampm}`;
  } catch (e) {
    return 'Invalid date';
  }
};

export default function Chat() {
  const [message, setMessage] = useState("")
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false)
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([])
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([
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
  
  // Helper function to format dates in a consistent way for server and client
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      // Use a fixed reference date for comparison to ensure consistency
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      // Check if the date is today
      if (itemDate.getTime() === today.getTime()) {
        return 'Today';
      }
      
      // Check if the date is yesterday
      if (itemDate.getTime() === yesterday.getTime()) {
        return 'Yesterday';
      }
      
      // For other dates, use a fixed format string rather than localeString
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[date.getMonth()];
      const day = date.getDate();
      const year = date.getFullYear() !== now.getFullYear() ? ` ${date.getFullYear()}` : '';
      
      return `${month} ${day}${year}`;
    } catch (e) {
      return 'Unknown date';
    }
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

  // Add handlers for plan confirmation/cancellation
  const handleConfirmPlan = () => {
    // Update the last message to mark it as confirmed but keep the plan UI
    setMessages(prev => {
      const updatedMessages = [...prev];
      const lastMessage = {...updatedMessages[updatedMessages.length - 1]};
      
      if (lastMessage.isPlan) {
        // Mark as confirmed but keep the plan format
        lastMessage.isConfirmed = true;
        updatedMessages[updatedMessages.length - 1] = lastMessage;
      }
      
      return updatedMessages;
    });
  };
  
  const handleCancelPlan = () => {
    // Remove the plan message entirely
    setMessages(prev => {
      const updatedMessages = [...prev];
      const lastMessage = updatedMessages[updatedMessages.length - 1];
      
      if (lastMessage.isPlan) {
        // Replace with a cancellation message
        updatedMessages[updatedMessages.length - 1] = {
          ...lastMessage,
          isPlan: false,
          points: undefined,
          text: "Plan cancelled. How else can I assist you?"
        };
      }
      
      return updatedMessages;
    });
  };

  const handleSend = async () => {
    if (message.trim()) {
      // Generate a unique timestamp-based ID for the user message
      const messageId = Date.now();
      const userMessage = { id: messageId, text: message, isUser: true };
      
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
        console.log("API response:", data);

        // Handle the response data based on its structure
        // Generate a unique timestamp-based ID for the assistant response
        const responseId = Date.now() + 100; // Add offset to ensure uniqueness from user message
        
        let finnResponse: Partial<Message> = { 
          id: responseId, 
          isUser: false,
          text: "Sorry, I didn't get a valid answer."
        };

        console.log("Processing response with data:", data);
        
        try {
          // First, check if the response directly contains points
          if (data.result && data.result.points && Array.isArray(data.result.points) && data.result.points.length > 0) {
            // Direct bullet points in the response
            const points = data.result.points;
            const formattedText = points.join('\n\n'); // Join points with newlines for display in text property
            
            console.log("Found direct points in result:", points);
            
            finnResponse = {
              id: responseId,
              text: formattedText,
              isUser: false,
              isPlan: true,
              points: points
            };
          } 
          // Check if result is a stringified JSON that might contain points
          else if (typeof data.result === 'string' && 
              (data.result.includes('"points"') || data.result.includes("'points'")) && 
              (data.result.startsWith('{') || data.result.startsWith('['))) {
            
            console.log("Result appears to be stringified JSON with points:", data.result.substring(0, 100));
            
            const resultObj = JSON.parse(data.result);
            
            if (resultObj.points && Array.isArray(resultObj.points) && resultObj.points.length > 0) {
              // It's a plan with bullet points
              const points = resultObj.points;
              const formattedText = points.join('\n\n');
              
              console.log("Parsed points from stringified JSON:", points);
              
              finnResponse = {
                id: responseId,
                text: formattedText,
                isUser: false,
                isPlan: true,
                points: points
              };
            } else {
              // It's JSON but doesn't have valid points
              finnResponse.text = data.result;
            }
          } else if (data.result) {
            // Regular text response
            let rawResponse = typeof data.result === 'string' ? 
              data.result : 
              JSON.stringify(data.result);
              
            // Strip the prefix if it exists
            const prefix = "Solution: ";
            if (typeof rawResponse === 'string' && rawResponse.startsWith(prefix)) {
              rawResponse = rawResponse.substring(prefix.length);
            }
            
            finnResponse.text = rawResponse;
          }
        } catch (e) {
          console.error("Error processing response:", e);
          if (data.result) {
            finnResponse.text = String(data.result);
          }
        }

        setMessages((prev) => [...prev, finnResponse as Message]);

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
    // Parse the result to check if it contains bullet points
    let responseMessage: Message = {
      id: 3,
      text: '',
      isUser: false
    };
    
    try {
      // Check if result is a JSON string that might contain points
      if (typeof historyItem.result === 'string' && 
          (historyItem.result.includes('"points"') || historyItem.result.includes("'points'")) && 
          (historyItem.result.startsWith('{') || historyItem.result.startsWith('['))) {
        
        const resultObj = JSON.parse(historyItem.result);
        
        if (resultObj.points && Array.isArray(resultObj.points) && resultObj.points.length > 0) {
          // It's a plan with bullet points
          responseMessage = {
            id: 3,
            text: resultObj.points.join('\n\n'),
            isUser: false,
            isPlan: true,
            points: resultObj.points
          };
        } else {
          responseMessage.text = historyItem.result;
        }
      } else if (typeof historyItem.result === 'object' && historyItem.result !== null) {
        // If result is already an object (not a string)
        const resultObj = historyItem.result as any;
        
        if (resultObj.points && Array.isArray(resultObj.points) && resultObj.points.length > 0) {
          // It's a plan with bullet points
          responseMessage = {
            id: 3,
            text: resultObj.points.join('\n\n'),
            isUser: false,
            isPlan: true,
            points: resultObj.points
          };
        } else {
          responseMessage.text = JSON.stringify(resultObj);
        }
      } else {
        // Regular text response
        responseMessage.text = String(historyItem.result);
      }
    } catch (e) {
      // If parsing fails, just use the result as plain text
      console.error('Error parsing history result:', e);
      responseMessage.text = String(historyItem.result);
    }
    
    // Generate a unique timestamp-based ID for the message set
    const baseId = Date.now();
    
    setMessages([
      {
        id: baseId, // Use the base ID for the first message
        text: "Hi, I am Finn your Personal Assistant and Financial Consultant.",
        isUser: false,
      },
      {
        id: baseId + 1, // Increment for each message
        text: historyItem.prompt,
        isUser: true,
      },
      {
        ...responseMessage,
        id: baseId + 2 // Ensure the response has a unique ID too
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

      <div className="flex-1 overflow-y-auto p-4">
        {/* DeepFinnk header now inside scrollable area */}
        <div className="flex items-center justify-center py-6 mb-6">
          <div className="flex flex-col items-center">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center">
                <div className="w-[90%] h-[90%] relative">
                  <Image src="/images/finn-emoji.png" alt="Finn emoji" fill className="object-contain" />
                </div>
              </div>
            </div>
            <div className="mt-2 text-white">
              <div className="text-xl font-bold">
                Deep<span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-pink-500">Finn</span>k
              </div>
              <div className="text-center">0.5</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${
              msg.isUser
                ? "bg-blue-primary rounded-xl p-4 ml-auto max-w-[80%]"
                : msg.isPlan 
                  ? "bg-gray-900 rounded-xl p-4 max-w-[90%]" 
                  : "bg-gray-800 rounded-xl p-4 max-w-[80%]"
            }`}
            style={
              !msg.isUser && msg.isPlan
                ? {
                    border: "2px solid",
                    borderImage: "linear-gradient(45deg, #ff0000, #ff7700, #ffff00, #00ff00, #0000ff, #8b00ff) 1",
                    boxShadow: "0 0 10px rgba(150, 150, 150, 0.2)"
                  }
                : {}
            }
          >
            <div className="flex-1">
              {/* Use ReactMarkdown for assistant messages, plain <p> for user */}
              {msg.isUser ? (
                <p>{msg.text}</p>
              ) : msg.isPlan ? (
                // Plan with bullet points and buttons
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-3">Your Financial Plan:</h3>
                  <ul className="space-y-3">
                    {msg.points?.map((point, index) => (
                      <li key={index} className="flex">
                        <span className="mr-2 text-gray-400">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex gap-3 mt-4 pt-3 border-t border-gray-700">
                    <button 
                      onClick={msg.isConfirmed ? undefined : handleCancelPlan} 
                      className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      {msg.isConfirmed ? 'Edit' : 'Cancel'}
                    </button>
                    {msg.isConfirmed ? (
                      <button 
                        className="flex-1 py-2 px-4 bg-green-600 rounded-lg font-medium transition-colors flex items-center justify-center"
                        disabled
                      >
                        <span className="mr-1">✓</span> Confirmed
                      </button>
                    ) : (
                      <button 
                        onClick={handleConfirmPlan}
                        className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-medium transition-colors"
                      >
                        Confirm Plan
                      </button>
                    )}
                  </div>
                </div>
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
                      // Use our custom time formatter for consistency between server and client
                      const timeString = formatTimeString(item.created_at);
                      
                      // Check if the result contains a plan with bullet points
                      let hasPlan = false;
                      try {
                        if (typeof item.result === 'string') {
                          if (item.result.includes('"points"') && (item.result.startsWith('{') || item.result.startsWith('['))) {
                            const resultObj = JSON.parse(item.result);
                            hasPlan = resultObj.points && Array.isArray(resultObj.points) && resultObj.points.length > 0;
                          }
                        } else if (typeof item.result === 'object' && item.result !== null) {
                          const resultObj = item.result as any;
                          hasPlan = resultObj.points && Array.isArray(resultObj.points) && resultObj.points.length > 0;
                        }
                      } catch (e) {
                        // Ignore parsing errors
                      }
                      
                      return (
                        <button
                          key={index}
                          onClick={() => loadChatFromHistory(item)}
                          className="w-full text-left p-4 border-b border-gray-800 hover:bg-gray-900 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span 
                              className="font-medium text-sm text-gray-400"
                              suppressHydrationWarning={true}
                            >
                              {timeString}
                            </span>
                            <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                          </div>
                          <p className="text-white truncate font-medium flex items-center">
                            {item.prompt}
                            {hasPlan && (
                              <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-blue-600 to-purple-600 text-xs rounded-full font-bold">
                                Plan
                              </span>
                            )}
                          </p>
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
