import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, X, Plus, Moon, Sun, Save, Users } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import EditorToolbar from "@/components/EditorToolbar";
import Comment from "@/components/Comment";
import UserPresence, { UserCursor } from "@/components/UserPresence";
import ChatPanel from "@/components/ChatPanel";

// =========== Mock Data =========== //
const activeUsers = [
  { id: "1", name: "John Doe", color: "#4285F4" },
  { id: "2", name: "Jane Smith", color: "#EA4335" },
];

const initialComments = [
  {
    id: "1",
    author: "John Doe",
    content: "We should expand on this section.",
    createdAt: new Date(2023, 5, 20, 14, 30),
    replies: [],
  },
  {
    id: "2",
    author: "Jane Smith",
    content: "Great point! I'll add more details.",
    createdAt: new Date(2023, 5, 20, 15, 45),
    replies: [
      {
        id: "2-1",
        author: "John Doe",
        content: "Thanks! Let me know if you need any help.",
        createdAt: new Date(2023, 5, 20, 16, 0),
      }
    ],
  },
];

// =========== Types =========== //
interface Page {
  id: string;
  content: string;
}

interface CommentType { // Renamed to avoid conflict
  id: string;
  author: string;
  content: string;
  createdAt: Date;
  replies?: CommentType[];
}

interface UserCursorData {
  id: string;
  name: string;
  color: string;
  position: { x: number; y: number };
}

const Editor: React.FC = () => {
  // =========== URL Params =========== //
  const { id } = useParams<{ id: string }>();

  // =========== Refs & State =========== //
  const editorRef = useRef<HTMLDivElement>(null);
  const contentObserverRef = useRef<MutationObserver | null>(null);
  const lastSavedRef = useRef<string>("");

  const [title, setTitle] = useState("Untitled document");
  const [comments, setComments] = useState<CommentType[]>(initialComments); // Using renamed type
  const [pages, setPages] = useState<Page[]>([
    {
      id: "1",
      content:
        "<p>Hello, this is a collaborative document editor.</p>" +
        "<p>You can edit this text, and it will be synchronized with other users in real-time.</p>" +
        "<p>Try selecting some text to add a comment, or see how other users' cursors move around the document.</p>" +
        "<p>This is just the beginning of what's possible with collaborative editing!</p>",
    },
  ]);

  // Panels & Bubbles
  const [isCommentPanelOpen, setIsCommentPanelOpen] = useState(false);
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);
  const [isUserListOpen, setIsUserListOpen] = useState(false);

  // Selection-based comment bubble
  const [selectionPosition, setSelectionPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [isSelectionActive, setIsSelectionActive] = useState(false);
  const [selectedText, setSelectedText] = useState("");

  // Mock presence / cursors
  const [userCursors, setUserCursors] = useState<UserCursorData[]>([]);

  // UI State
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // =========== Lifecycle & Effects =========== //

  // Initialize dark mode from user preference
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(prefersDark);
    
    if (prefersDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  /**
   * 1) handleContentOverflow(pageElement):
   *    Removes paragraphs from an overflowing page until it fits.
   *    Returns the removed paragraphs as a single HTML string for a new page.
   */
  const handleContentOverflow = useCallback((pageElement: HTMLElement): string => {
    const paragraphs = Array.from(pageElement.querySelectorAll("p"));
    const removedParagraphs: string[] = [];

    // While page overflows AND there's more than 1 paragraph to remove
    while (
      pageElement.scrollHeight > pageElement.clientHeight &&
      paragraphs.length > 1
    ) {
      const lastParagraph = paragraphs.pop();
      if (!lastParagraph) break;

      // Remove the paragraph from the DOM
      lastParagraph.remove();

      // Store it (unshift so the earliest removed is at the front)
      removedParagraphs.unshift(lastParagraph.outerHTML);
    }

    // The removed paragraphs become the content for the new page
    return removedParagraphs.join("");
  }, []);

  /**
   * 2) checkAllPagesForOverflow():
   *    Iterates through all existing .page-content elements.
   *    Splits out content into new pages as needed until none overflow.
   */
  const checkAllPagesForOverflow = useCallback(() => {
    // We'll update the pages array if new pages are created
    let newPages = [...pages];
    let hasNewPages = false;

    let pageElements = document.querySelectorAll(".page-content");
    for (let i = 0; i < pageElements.length; i++) {
      const pageElement = pageElements[i] as HTMLElement;

      // While this page is overflowing
      while (pageElement.scrollHeight > pageElement.clientHeight) {
        const newPageContent = handleContentOverflow(pageElement);

        // If no paragraphs were removed, break to avoid infinite loop
        if (!newPageContent) break;

        // Create a new page in state with the removed content
        const newPage = {
          id: Date.now().toString() + Math.random().toString().slice(2),
          content: newPageContent,
        };
        newPages.push(newPage);
        hasNewPages = true;

        // Because we've changed the content in the DOM, we re-check the same page
        // until it fits or no more paragraphs can be removed.
      }
    }

    // If we created new pages, update state
    if (hasNewPages) {
      setPages(newPages);
      toast("New page(s) created due to content overflow", {
        description: "Content has been moved to a new page",
        action: {
          label: "View",
          onClick: () => {
            const lastPage = document.querySelector(".page:last-child");
            lastPage?.scrollIntoView({ behavior: "smooth" });
          }
        }
      });
    }
  }, [pages, handleContentOverflow]);

  /**
   * 3) Setup MutationObserver:
   *    Observes each .page-content. On mutation, we run checkAllPagesForOverflow().
   */
  useEffect(() => {
    // Disconnect old observer if it exists
    if (contentObserverRef.current) {
      contentObserverRef.current.disconnect();
    }

    // Debounce the overflow check to avoid excessive processing
    let debounceTimeout: NodeJS.Timeout;
    
    contentObserverRef.current = new MutationObserver(() => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        checkAllPagesForOverflow();
      }, 500);
    });

    // Observe each .page-content
    document.querySelectorAll(".page-content").forEach((element) => {
      contentObserverRef.current?.observe(element, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    });

    return () => {
      contentObserverRef.current?.disconnect();
      clearTimeout(debounceTimeout);
    };
  }, [pages, checkAllPagesForOverflow]);

  /**
   * Simulate random cursor positions for active users.
   * Replace with real-time presence in production.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      if (!editorRef.current) return;
      
      const newCursors = activeUsers.map((user) => {
        // Create more realistic cursor movements
        const editorWidth = editorRef.current?.offsetWidth || 800;
        const editorHeight = editorRef.current?.offsetHeight || 600;
        
        // Get current page content area
        const currentPageEl = document.querySelector(`.page:nth-child(${currentPage + 1}) .page-content`);
        const pageRect = currentPageEl?.getBoundingClientRect();
        
        if (!pageRect) return {
          id: user.id,
          name: user.name,
          color: user.color,
          position: { x: 0, y: 0 }
        };
        
        return {
          id: user.id,
          name: user.name,
          color: user.color,
          position: {
            x: Math.max(pageRect.left, Math.min(pageRect.right, Math.random() * editorWidth)),
            y: Math.max(pageRect.top, Math.min(pageRect.bottom, Math.random() * editorHeight)),
          },
        };
      });
      
      setUserCursors(newCursors);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentPage]);

  /**
   * Handle selection changes for comment bubble.
   */
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (
        selection &&
        selection.rangeCount > 0 &&
        selection.toString().trim().length > 0
      ) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        if (editorRef.current) {
          const editorRect = editorRef.current.getBoundingClientRect();
          setSelectionPosition({
            top: rect.bottom - editorRect.top,
            left: rect.right - editorRect.left,
          });
          setIsSelectionActive(true);
          setSelectedText(selection.toString());
        }
      } else {
        setIsSelectionActive(false);
        setSelectedText("");
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  /**
   * Auto-save document every 30s
   */
  useEffect(() => {
    const interval = setInterval(() => {
      saveDocument();
    }, 30000);

    return () => clearInterval(interval);
  }, [pages, title]);

  /**
   * Keyboard shortcuts for common actions
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Save: Ctrl/Cmd + S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveDocument();
      }
      
      // Toggle comment panel: Ctrl/Cmd + Alt + C
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key === 'c') {
        e.preventDefault();
        toggleCommentPanel();
      }
      
      // Toggle chat panel: Ctrl/Cmd + Alt + M
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key === 'm') {
        e.preventDefault();
        toggleChatPanel();
      }
      
      // Add new page: Ctrl/Cmd + Alt + P
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key === 'p') {
        e.preventDefault();
        handleAddPage();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown as any);
    return () => window.removeEventListener('keydown', handleKeyDown as any);
  }, []);

  // =========== Handlers =========== //

  /** Updates the doc title and shows a toast. */
  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
    toast(`Document renamed to "${newTitle}"`);
  }, []);

  /** Adds a new comment at the current selection position. */
  const handleAddComment = () => {
    if (!selectionPosition || !selectedText) return;

    const newComment: CommentType = { // Type annotation added
      id: Date.now().toString(),
      author: "You",
      content: `Comment on: "${selectedText.substring(0, 50)}${selectedText.length > 50 ? '...' : ''}"`,
      createdAt: new Date(),
      replies: [],
    };

    setComments((prev) => [newComment, ...prev]);
    setIsCommentPanelOpen(true);
    setIsSelectionActive(false);

    toast("Comment added", {
      description: "Your comment has been added to the discussion",
    });
  };

  /** Resolves (removes) a comment by ID. */
  const handleResolveComment = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    toast("Comment resolved", {
      description: "The comment has been marked as resolved",
    });
  };

  /** Adds a reply to a comment */
  const handleAddReply = (commentId: string, replyContent: string) => {
    const newReply: CommentType = { // Type annotation added
      id: `${commentId}-${Date.now()}`,
      author: "You",
      content: replyContent,
      createdAt: new Date(),
    };
    
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply]
        };
      }
      return comment;
    }));
    
    toast("Reply added");
  };

  /** Manually adds a new blank page. */
  const handleAddPage = () => {
    const newPage = {
      id: Date.now().toString(),
      content: "<p>New page content...</p>",
    };

    setPages((prev) => [...prev, newPage]);
    toast("New page added", {
      description: "Page added at the end of the document",
    });

    // Scroll to the newly created page
    setTimeout(() => {
      const lastPage = document.querySelector(".page:last-child");
      lastPage?.scrollIntoView({ behavior: "smooth" });
      setCurrentPage(pages.length);
    }, 100);
  };

  /** Update the page's content in state after editing. */
  const handlePageContentChange = (pageId: string, newContent: string) => {
    setPages((prevPages) =>
      prevPages.map((page) =>
        page.id === pageId ? { ...page, content: newContent } : page
      )
    );
  };

  /** Toggles chat panel open/closed. */
  const toggleChatPanel = () => {
    setIsChatPanelOpen((prev) => !prev);
    if (isCommentPanelOpen && !isChatPanelOpen) {
      setIsCommentPanelOpen(false);
    }
  };

  /** Toggles comment panel open/closed. */
  const toggleCommentPanel = () => {
    setIsCommentPanelOpen((prev) => !prev);
    if (isChatPanelOpen && !isCommentPanelOpen) {
      setIsChatPanelOpen(false);
    }
  };

  /** Toggles user list panel open/closed. */
  const toggleUserListPanel = () => {
    setIsUserListOpen((prev) => !prev);
  };

  /** Applies a formatting command via document.execCommand (demo only). */
  const handleFormatCommand = (command: string, value?: any) => {
    document.execCommand(command, false, value);
    toast(`Applied ${command} formatting`);
  };

  /** Toggle dark mode */
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
    document.documentElement.classList.toggle("dark");
  };

  /** Save the document */
  const saveDocument = () => {
    // Get the current document content as a string
    const currentContent = JSON.stringify({ title, pages });
    
    // If content hasn't changed, don't save
    if (currentContent === lastSavedRef.current) return;
    
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      lastSavedRef.current = currentContent;
      setIsSaving(false);
      toast("Document saved", { 
        description: `Last saved at ${new Date().toLocaleTimeString()}`,
      });
    }, 800);
  };

  /** Handle page navigation */
  const navigateToPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < pages.length) {
      setCurrentPage(pageIndex);
      const pageElement = document.querySelector(`.page:nth-child(${pageIndex + 1})`);
      pageElement?.scrollIntoView({ behavior: "smooth" });
    }
  };

  /** Handle keyboard events in the editor */
  const handleEditorKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // Handle keyboard shortcuts for formatting
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b': // Bold
          e.preventDefault();
          handleFormatCommand('bold');
          break;
        case 'i': // Italic
          e.preventDefault();
          handleFormatCommand('italic');
          break;
        case 'u': // Underline
          e.preventDefault();
          handleFormatCommand('underline');
          break;
      }
    }
  };

  // Ruler ticks (horizontal & vertical)
  const horizontalTicks = [];
  for (let i = 1; i <= 7; i++) {
    horizontalTicks.push(
      <span
        key={i}
        className="ruler-tick horizontal-tick"
        style={{ left: `${i * 14.28}%` }}
      >
        {i}
      </span>
    );
  }

  const verticalTicks = [];
  for (let i = 1; i <= 11; i++) {
    verticalTicks.push(
      <span
        key={i}
        className="ruler-tick vertical-tick"
        style={{ top: `${i * 9}%` }}
      >
        {i}
      </span>
    );
  }

  // =========== Render =========== //
  return (
    <div className={cn(
      "h-screen flex flex-col overflow-hidden bg-background/50 transition-colors duration-300",
      isDarkMode ? "dark" : ""
    )}>
      {/* Top Navbar (Title, etc.) */}
      <Navbar 
        title={title} 
        isEditor={true} 
        onTitleChange={handleTitleChange} 
        documentId={id} 
        onSave={saveDocument}
        isSaving={isSaving}
      />

      {/* Editor Toolbar */}
      <EditorToolbar
        onFormatChange={handleFormatCommand}
        onAddPage={handleAddPage}
        onChatToggle={toggleChatPanel}
        isChatOpen={isChatPanelOpen}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        currentPage={currentPage + 1}
        totalPages={pages.length}
        onNavigateToPage={(index) => navigateToPage(index - 1)}
      />

      {/* Main Editor Area */}
      <div 
        className="flex-1 relative overflow-y-auto bg-background transition-colors duration-300" 
        ref={editorRef}
        onScroll={(e) => {
          // Update current page based on scroll position
          const pageElements = document.querySelectorAll('.page');
          const scrollTop = e.currentTarget.scrollTop;
          const viewportHeight = e.currentTarget.clientHeight;
          const viewportCenter = scrollTop + viewportHeight / 2;
          
          pageElements.forEach((page, index) => {
            const rect = page.getBoundingClientRect();
            const pageTop = rect.top + scrollTop - e.currentTarget.offsetTop;
            const pageBottom = pageTop + rect.height;
            
            if (pageTop <= viewportCenter && pageBottom >= viewportCenter) {
              setCurrentPage(index);
            }
          });
        }}
      >
        <div className="editor-content max-w-5xl mx-auto py-8">
          {pages.map((page, index) => (
            <div 
              key={page.id} 
              className={cn(
                "page relative bg-white dark:bg-gray-900 shadow-md rounded-sm mb-8 transition-all duration-300",
                "hover:shadow-lg focus-within:shadow-lg focus-within:ring-2 focus-within:ring-primary/20",
                index === currentPage && "ring-2 ring-primary/30"
              )}
            >
              {/* Ruler (optional) */}
              <div className="page-ruler-horizontal opacity-30 dark:opacity-20">{horizontalTicks}</div>
              <div className="page-ruler-vertical opacity-30 dark:opacity-20">{verticalTicks}</div>

              {/* Editable Page Content */}
              <div
                className="page-content prose dark:prose-invert max-w-none p-12 min-h-[842px] outline-none transition-colors duration-300"
                contentEditable
                suppressContentEditableWarning
                dangerouslySetInnerHTML={{ __html: page.content }}
                onBlur={(e) =>
                  handlePageContentChange(page.id, e.currentTarget.innerHTML)
                }
                onKeyDown={handleEditorKeyDown}
                onPaste={(e) => {
                  e.preventDefault();
                  const text = e.clipboardData.getData("text/plain");
                  // Convert multiline text to paragraphs
                  const formattedText = text
                    .split("\n")
                    .filter((line) => line.trim() !== "")
                    .map((line) => `<p>${line}</p>`)
                    .join("");
                  document.execCommand("insertHTML", false, formattedText);
                }}
              />
              <div className="page-number absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 dark:bg-gray-800/80 px-2 py-1 rounded">
                Page {index + 1} of {pages.length}
              </div>
            </div>
          ))}
        </div>

        {/* Selection-based comment bubble */}
        {isSelectionActive && selectionPosition && (
          <div
            className="comment-bubble absolute flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-md cursor-pointer transform hover:scale-110 transition-all duration-200 animate-fade-in z-50"
            style={{
              top: selectionPosition.top,
              left: selectionPosition.left,
            }}
            onClick={handleAddComment}
          >
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
        )}

        {/* Mock user cursors */}
        {userCursors.map((cursor) => (
          <UserCursor
            key={cursor.id}
            name={cursor.name}
            color={cursor.color}
            position={cursor.position}
          />
        ))}

        {/* Active user presence badges (top-right) */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200"
                  onClick={toggleUserListPanel}
                >
                  <Users className="h-4 w-4 text-primary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View active users</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {isUserListOpen && (
            <div className="user-list bg-white dark:bg-gray-800 rounded-md shadow-lg p-2 animate-in fade-in slide-in-from-right-5 duration-200">
              {activeUsers.map((user) => (
                <UserPresence key={user.id} name={user.name} color={user.color} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comment Panel (side drawer) */}
      <div className={cn(
        "comment-panel fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-lg border-l border-border z-50 transition-transform duration-300 ease-in-out transform",
        isCommentPanelOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="h-14 border-b border-border flex items-center justify-between px-4">
          <h2 className="font-medium">Comments</h2>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            onClick={() => setIsCommentPanelOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-3.5rem)]">
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="rounded-full bg-accent w-12 h-12 flex items-center justify-center mb-3">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No comments yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Select text to add a comment
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <Comment
                key={comment.id}
                id={comment.id}
                author={comment.author}
                content={comment.content}
                createdAt={comment.createdAt}
                replies={comment.replies}
                onResolve={handleResolveComment}
                onAddReply={handleAddReply}
              />
            ))
          )}
        </div>
      </div>

      {/* Chat Panel */}
      <ChatPanel isOpen={isChatPanelOpen} onClose={() => setIsChatPanelOpen(false)} />

      {/* Floating Action Buttons */}
      {!isCommentPanelOpen && !isChatPanelOpen && (
        <div className="fixed right-4 bottom-4 flex flex-col gap-3 z-10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full shadow-md bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-200"
                  onClick={toggleDarkMode}
                >
                  {isDarkMode ? (
                    <Sun className="h-5 w-5 text-amber-500" />
                  ) : (
                    <Moon className="h-5 w-5 text-indigo-500" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>{isDarkMode ? 'Light mode' : 'Dark mode'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full shadow-md bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-200"
                  onClick={saveDocument}
                  disabled={isSaving}
                >
                  <Save className={cn(
                    "h-5 w-5 text-primary",
                    isSaving && "animate-pulse"
                  )} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Save document (Ctrl+S)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full shadow-md bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-200"
                  onClick={toggleCommentPanel}
                >
                  <MessageSquare className="h-5 w-5 text-primary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Comments (Ctrl+Alt+C)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 hover:shadow-xl transition-all duration-300 ease-in-out"
                  onClick={toggleChatPanel}
                >
                  <MessageSquare className="h-5 w-5 text-primary-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Chat with collaborators (Ctrl+Alt+M)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full shadow-md bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-200"
                  onClick={handleAddPage}
                >
                  <Plus className="h-5 w-5 text-primary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Add new page (Ctrl+Alt+P)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Page navigation controls */}
      <div className="fixed left-4 bottom-4 flex gap-2 z-10">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200"
                onClick={() => navigateToPage(currentPage - 1)}
                disabled={currentPage === 0}
              >
                Previous
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Previous page</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <span className="flex items-center justify-center px-3 py-1 bg-white dark:bg-gray-800 rounded-md shadow-sm text-sm">
          {currentPage + 1} / {pages.length}
        </span>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200"
                onClick={() => navigateToPage(currentPage + 1)}
                disabled={currentPage === pages.length - 1}
              >
                Next
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Next page</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default Editor;
