"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface UserPresenceProps {
  name: string
  color: string
}

export const UserCursor: React.FC<{
  name: string
  color: string
  position: { x: number; y: number }
}> = ({ name, color, position }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="absolute z-50 pointer-events-none transition-all duration-300 ease-out"
            style={{
              left: position.x,
              top: position.y,
              transform: "translate(-50%, -50%)",
            }}
          >
            <svg
              width="24"
              height="36"
              viewBox="0 0 24 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-md"
            >
              <path
                d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.0664062 17.3976V0.375L5.65376 12.3673Z"
                fill={color}
              />
            </svg>
            <div
              className="absolute top-0 left-0 -mt-7 -ml-1 px-2 py-1 rounded-md text-xs text-white whitespace-nowrap"
              style={{ backgroundColor: color }}
            >
              {name}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{name} is editing</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

const UserPresence: React.FC<UserPresenceProps> = ({ name, color }) => {
  const [isActive, setIsActive] = useState(true)

  // Simulate random activity status changes
  useEffect(() => {
    const interval = setInterval(() => {
      setIsActive(Math.random() > 0.3)
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/10 transition-colors duration-200">
      <div className="relative">
        <Avatar className="h-8 w-8 border-2" style={{ borderColor: color }}>
          <AvatarImage src={`https://avatar.vercel.sh/${name}.png`} alt={name} />
          <AvatarFallback style={{ backgroundColor: color }}>{getInitials(name)}</AvatarFallback>
        </Avatar>
        <span
          className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ${isActive ? "bg-green-500" : "bg-amber-500"} ring-2 ring-white dark:ring-gray-800`}
        />
      </div>
      <span className="text-sm font-medium">{name}</span>
    </div>
  )
}

export default UserPresence

