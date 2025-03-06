"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Plus, Search, FileText, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Template data with updated neutral colors
const templateDocuments = [
  {
    id: "t1",
    title: "Blank document",
    subtitle: "Start fresh",
    
    icon: "✏️",
  },
  {
    id: "t2",
    title: "Resume",
    subtitle: "Professional template",
   
    icon: "📄",
  },
  {
    id: "t3",
    title: "Business Proposal",
    subtitle: "Modern design",
 
    icon: "💼",
  },
  {
    id: "t4",
    title: "Newsletter",
    subtitle: "Creative layout",
   
    icon: "📰",
  },
  {
    id: "t5",
    title: "Report",
    subtitle: "Corporate style",
   
    icon: "📊",
  },
  {
    id: "t6",
    title: "Portfolio",
    subtitle: "Showcase your work",
    
    icon: "🎨",
  },
]

const Index = () => {
  const navigate = useNavigate()
  const [documents, setDocuments] = useState([])

  const handleCreateDocument = () => {
    const newId = Date.now().toString()
    const newDocument = {
      id: newId,
      title: "Untitled document",
      lastModified: new Date(),
      owner: "me",
    }

    setDocuments([newDocument, ...documents])
    navigate(`/editor/${newId}`)
  }

  const handleTemplateClick = (id: string) => {
    const newId = Date.now().toString()
    const newDocument = {
      id: newId,
      title: "Untitled document",
      lastModified: new Date(),
      owner: "me",
    }

    setDocuments([newDocument, ...documents])
    navigate(`/editor/${newId}`)
  }

  return (
    // Clean, subtle background
    <div className="min-h-screen flex bg-neutral-50 text-neutral-800">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-neutral-100 flex flex-col shadow-sm">
        <div className="p-6 flex items-center">
          <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center mr-3">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-neutral-900">Docify</span>
        </div>

        <div className="px-4 py-6">
          {/* New Document Button */}
          <Button
            className="w-full bg-neutral-900 text-white hover:bg-neutral-800 mb-6 rounded-lg font-medium text-sm py-5"
            onClick={handleCreateDocument}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Document
          </Button>

          <nav>
            <ul className="space-y-1">
              {["Templates", "Recent", "Shared with me", "Favorites", "Trash"].map((item) => (
                <li key={item}>
                  <a href="#" className="flex items-center px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg">
                    {item}
                    {item === "Templates" && <ChevronRight className="h-4 w-4 ml-auto text-neutral-400" />}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-neutral-100">
          <div className="flex items-center p-2 hover:bg-neutral-100 rounded-lg cursor-pointer">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-neutral-900 text-white">A</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-900">Ankith M</p>
              <p className="text-xs text-neutral-500">Pro Account</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-neutral-100 bg-white shadow-sm flex items-center px-6">
          <div className="relative flex-grow max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-neutral-400" />
            </div>
            <Input
              type="text"
              placeholder="Search documents..."
              className="pl-10 py-2 w-full bg-white border-neutral-200 text-neutral-800 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center ml-4 space-x-1">
            {["All", "Docs", "Images", "Videos"].map((filter) => (
              <Button
                key={filter}
                variant="ghost"
                className="text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg px-3 py-1 text-sm"
              >
                {filter}
              </Button>
            ))}
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 overflow-auto p-8">
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-neutral-900 mb-3">Start Creating</h1>
            <p className="text-neutral-600">Select a template or start from scratch</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {templateDocuments.map((template) => (
              <div key={template.id} className="cursor-pointer group" onClick={() => handleTemplateClick(template.id)}>
                <div className="relative rounded-xl overflow-hidden bg-white border border-neutral-200 hover:border-neutral-300 transition-all duration-300 shadow-sm hover:shadow-md">
                  <div className="p-6 flex items-start justify-between">
                    <div>
                      <div
                        className={`w-12 h-12 ${template.color} rounded-lg flex items-center justify-center text-2xl mb-4`}
                      >
                        {template.icon}
                      </div>
                      <h3 className="text-xl font-semibold mb-1 text-neutral-800">{template.title}</h3>
                      <p className="text-neutral-600">{template.subtitle}</p>
                    </div>
                    <Button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-neutral-900 text-white hover:bg-neutral-800 rounded-lg">
                      Use
                    </Button>
                  </div>
                  <div className={`h-1 w-full ${template.color}`} />
                </div>
              </div>
            ))}
          </div>

          {documents.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-900">Recent Documents</h2>
                <Button variant="ghost" className="text-neutral-600 hover:text-neutral-900">
                  View all
                </Button>
              </div>
              {/* Recent documents grid would go here */}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Index

