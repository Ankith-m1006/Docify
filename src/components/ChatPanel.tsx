"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, Send, Paperclip, Image, Smile } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ChatPanelProps {
  isOpen: boolean
  onClose: () => void
}

interface Message {
  id: string
  sender: string
  content: string
  timestamp: Date
  isCurrentUser: boolean
}

const initialMessages: Message[] = [
  {
    id: "1",
    sender: "John Doe",
    content: "Hey team, I've updated the introduction section. Can you take a look?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isCurrentUser: false,
  },
  {
    id: "2",
    sender: "Jane Smith",
    content: "Looks good! I'll review it in detail later today.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    isCurrentUser: false,
  },
  {
    id: "3",
    sender: "You",
    content: "Thanks! I'm also working on the conclusion. Should be done by EOD.",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    isCurrentUser: true,
  },
]

const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change or panel opens
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen])

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return

    const message: Message = {
      id: Date.now().toString(),
      sender: "You",
      content: newMessage,
      timestamp: new Date(),
      isCurrentUser: true,
    }

    setMessages([...messages, message])
    setNewMessage("")

    // Simulate response after a delay
    if (Math.random() > 0.5) {
      setTimeout(
        () => {
          const response: Message = {
            id: (Date.now() + 1).toString(),
            sender: "Jane Smith",
            content: "Thanks for the update! Looking forward to seeing the final version.",
            timestamp: new Date(),
            isCurrentUser: false,
          }
          setMessages((prev) => [...prev, response])
        },
        3000 + Math.random() * 5000,
      )
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
    ]
    const index = name.length % colors.length
    return colors[index]
  }

  return (
    <div
      className={`chat-panel fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-lg border-l border-border z-50 flex flex-col transition-transform duration-300 ease-in-out transform ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="h-14 border-b border-border flex items-center justify-between px-4">
        <h2 className="font-medium">Team Chat</h2>
        <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isCurrentUser ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] ${
                message.isCurrentUser
                  ? "bg-primary text-primary-foreground rounded-tl-lg rounded-tr-sm rounded-bl-lg"
                  : "bg-accent text-accent-foreground rounded-tl-sm rounded-tr-lg rounded-br-lg"
              } p-3 shadow-sm`}
            >
              {!message.isCurrentUser && (
                <div className="flex items-center gap-2 mb-1">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={`https://avatar.vercel.sh/${message.sender}.png`} alt={message.sender} />
                    <AvatarFallback className={getAvatarColor(message.sender)}>
                      {getInitials(message.sender)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">{message.sender}</span>
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              <div
                className={`text-xs mt-1 ${
                  message.isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                }`}
              >
                {formatDistanceToNow(message.timestamp, { addSuffix: true })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 mb-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <Paperclip className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <Image className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <Smile className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            className="flex-1"
          />
          <Button size="icon" onClick={handleSendMessage} disabled={newMessage.trim() === ""}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ChatPanel

