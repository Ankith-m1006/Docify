"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, MessageSquare, Reply } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface CommentProps {
  id: string
  author: string
  content: string
  createdAt: Date
  replies?: {
    id: string
    author: string
    content: string
    createdAt: Date
  }[]
  onResolve: (id: string) => void
  onAddReply: (id: string, content: string) => void
}

const Comment: React.FC<CommentProps> = ({ id, author, content, createdAt, replies = [], onResolve, onAddReply }) => {
  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [isExpanded, setIsExpanded] = useState(true)

  const handleSubmitReply = () => {
    if (replyContent.trim()) {
      onAddReply(id, replyContent)
      setReplyContent("")
      setIsReplying(false)
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
    <div className="border-b border-border last:border-0 p-4 transition-all duration-200 hover:bg-accent/10">
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={`https://avatar.vercel.sh/${author}.png`} alt={author} />
          <AvatarFallback className={getAvatarColor(author)}>{getInitials(author)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="font-medium text-sm">{author}</div>
            <div className="text-xs text-muted-foreground">{formatDistanceToNow(createdAt, { addSuffix: true })}</div>
          </div>

          <div className="mt-1 text-sm whitespace-pre-wrap break-words">{content}</div>

          <div className="mt-2 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setIsReplying(!isReplying)}
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onResolve(id)}
            >
              <Check className="h-3 w-3 mr-1" />
              Resolve
            </Button>

            {replies.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground ml-auto"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                {replies.length} {replies.length === 1 ? "reply" : "replies"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Reply form */}
      {isReplying && (
        <div className="mt-3 ml-11 animate-in fade-in slide-in-from-top-2 duration-200">
          <Textarea
            placeholder="Write a reply..."
            className="min-h-[80px] text-sm"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsReplying(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmitReply}>
              Reply
            </Button>
          </div>
        </div>
      )}

      {/* Replies */}
      {isExpanded && replies.length > 0 && (
        <div className="mt-3 ml-11 space-y-3 border-l-2 border-border pl-3">
          {replies.map((reply) => (
            <div key={reply.id} className="animate-in fade-in slide-in-from-left-1 duration-200">
              <div className="flex items-start gap-3">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={`https://avatar.vercel.sh/${reply.author}.png`} alt={reply.author} />
                  <AvatarFallback className={getAvatarColor(reply.author)}>{getInitials(reply.author)}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-xs">{reply.author}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(reply.createdAt, { addSuffix: true })}
                    </div>
                  </div>

                  <div className="mt-1 text-xs whitespace-pre-wrap break-words">{reply.content}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Comment

