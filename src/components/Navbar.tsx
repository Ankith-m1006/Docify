"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Bell,
  Clock,
  Settings,
  Users,
  Video,
  Menu,
  FileText,
  Share,
  Save,
  Mail,
  LinkIcon,
  Lock,
  UserPlus,
  CheckCircle2,
  MoreHorizontal,
} from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

interface NavbarProps {
  title: string
  isEditor?: boolean
  documentId?: string
  onTitleChange?: (title: string) => void
  onSave?: () => void
  isSaving?: boolean
}

const Navbar: React.FC<NavbarProps> = ({
  title,
  isEditor = false,
  documentId = "",
  onTitleChange,
  onSave,
  isSaving = false,
}) => {
  const [documentTitle, setDocumentTitle] = useState(title)
  const [isEditing, setIsEditing] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [collaborators, setCollaborators] = useState([
    { id: "1", name: "Alex Johnson", avatar: "A", color: "bg-blue-500" },
    { id: "2", name: "Taylor Smith", avatar: "T", color: "bg-green-500" },
    { id: "3", name: "Jamie Wilson", avatar: "J", color: "bg-purple-500" },
  ])
  const [showCollaborators, setShowCollaborators] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    if (!isSaving && isEditor) {
      setLastSaved(new Date().toLocaleTimeString())
    }
  }, [isSaving, isEditor])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocumentTitle(e.target.value)
  }

  const handleTitleBlur = () => {
    finishEditing()
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      finishEditing()
    } else if (e.key === "Escape") {
      setDocumentTitle(title) // Reset to original
      setIsEditing(false)
    }
  }

  const finishEditing = () => {
    setIsEditing(false)
    if (onTitleChange && documentTitle.trim() !== "") {
      onTitleChange(documentTitle)
    } else {
      setDocumentTitle(title) // Reset if empty
    }
  }

  const handleVideoCall = () => {
    const roomName = `doc-${documentId}`
    window.open(`https://meet.jit.si/${roomName}`, "_blank")
  }

  const handleSave = () => {
    if (onSave) {
      onSave()
    }
  }

  const copyShareLink = () => {
    navigator.clipboard.writeText(`https://docs.example.com/d/${documentId}`).then(() => {
      // Show a toast or notification
      const notification = document.createElement("div")
      notification.className =
        "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 animate-in fade-in slide-in-from-top-5 duration-300"
      notification.textContent = "Link copied to clipboard!"
      document.body.appendChild(notification)
      setTimeout(() => {
        notification.classList.add("animate-out", "fade-out", "slide-out-to-top-5")
        notification.addEventListener("animationend", () => {
          notification.remove()
        })
      }, 3000)
    })
  }

  return (
    <div className="sticky top-0 h-14 border-b border-border flex items-center px-4 bg-background/95 backdrop-blur supports-backdrop-blur:bg-background/60 z-40 transition-all duration-300">
      <div className="flex items-center gap-2 flex-1">
        {!isEditor && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Main menu</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <Link to="/" className="flex items-center gap-2 no-underline group">
          <div className="h-9 w-9 rounded-lg overflow-hidden flex items-center justify-center bg-primary text-primary-foreground shadow-sm group-hover:shadow-md transition-all duration-300">
            <FileText className="w-5 h-5" />
          </div>
          {!isEditor && (
            <span className="font-medium text-lg group-hover:text-primary transition-colors duration-200">Docs</span>
          )}
        </Link>

        {isEditor && (
          <div className="flex items-center ml-4">
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={documentTitle}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                className="px-2 py-1 text-lg font-medium border-b-2 border-primary outline-none bg-transparent w-64 animate-in fade-in zoom-in-95 duration-200"
              />
            ) : (
              <h1
                onClick={() => setIsEditing(true)}
                className="text-lg font-medium px-2 py-1 hover:bg-accent/50 rounded cursor-text transition-colors duration-200 max-w-md truncate"
              >
                {documentTitle}
              </h1>
            )}

            {/* Last saved indicator */}
            {lastSaved && (
              <div className="ml-4 text-sm text-muted-foreground flex items-center">
                {isSaving ? (
                  <div className="flex items-center">
                    <Save className="h-3 w-3 mr-1 animate-pulse" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                    <span>Saved at {lastSaved}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        {isEditor && (
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
                  >
                    <Clock className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Version history</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
                  >
                    <Bell className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Notifications</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200",
                      showCollaborators && "bg-accent text-accent-foreground",
                    )}
                    onClick={() => setShowCollaborators(!showCollaborators)}
                  >
                    <Users className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 bg-primary text-[10px] text-primary-foreground w-4 h-4 flex items-center justify-center rounded-full">
                      {collaborators.length}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Collaborators</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Collaborators popup */}
            {showCollaborators && (
              <div className="absolute top-14 right-32 w-64 bg-background border border-border rounded-lg shadow-lg p-3 z-50 animate-in fade-in slide-in-from-top-5 duration-200">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Collaborators</h3>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowCollaborators(false)}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {collaborators.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 p-1.5 hover:bg-accent rounded-md transition-colors"
                    >
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className={user.color}>{user.avatar}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{user.name}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                  Add people
                </Button>
              </div>
            )}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
                    onClick={handleVideoCall}
                  >
                    <Video className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Start video call</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="h-6 w-px bg-border mx-1"></div>
          </>
        )}

        {isEditor && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4 transition-all duration-300 shadow-sm hover:shadow-md">
                <Share className="h-4 w-4 mr-1.5" />
                Share
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="p-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1 mb-1">
                  <Lock className="h-3 w-3" />
                  <span>Only people with access can see this document</span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={copyShareLink}>
                <LinkIcon className="h-4 w-4 mr-2" />
                Copy link
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="h-4 w-4 mr-2" />
                Email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserPlus className="h-4 w-4 mr-2" />
                Manage access
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 ml-1"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-9 w-9 ml-1 cursor-pointer border-2 border-transparent hover:border-primary/20 transition-all duration-200">
              <AvatarImage src="" alt="User" />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">A</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center justify-start p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium">Alex Johnson</p>
                <p className="text-sm text-muted-foreground">alex@example.com</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default Navbar

