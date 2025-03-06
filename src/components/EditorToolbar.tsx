import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "./ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { cn } from "@/lib/utils";
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Calendar, CheckSquare, ChevronDown, Clipboard, Code, Copy, Edit3, FileDown, FileText, HelpCircle, Highlighter, History, ImageIcon, IndentDecrease, IndentIncrease, Italic, LinkIcon, List, ListOrdered, Maximize2, MessageSquare, Minimize2, Minus, Moon, Plus, Printer, Quote, Redo, Save, Scissors, Search, SeparatorHorizontal, Settings, Share2, Strikethrough, Subscript, Sun, Superscript, Table, Type, Underline, Undo } from 'lucide-react';

interface ToolbarProps {
  onFormatChange?: (format: string, value: any) => void;
  onAddPage?: () => void;
  onChatToggle?: () => void;
  isChatOpen?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onPrint?: () => void;
  onFindReplace?: (options: {
    find: string;
    replace?: string;
    matchCase?: boolean;
  }) => void;
}

const fontFamilies = [
  "Arial",
  "Calibri",
  "Cambria",
  "Comic Sans MS",
  "Courier New",
  "Georgia",
  "Helvetica",
  "Open Sans",
  "Roboto",
  "Times New Roman",
  "Trebuchet MS",
  "Verdana",
];

const fontSizes = [
  "8",
  "9",
  "10",
  "11",
  "12",
  "14",
  "16",
  "18",
  "20",
  "24",
  "30",
  "36",
  "48",
  "60",
  "72",
];

const colorPalette = [
  "#000000",
  "#434343",
  "#666666",
  "#999999",
  "#b7b7b7",
  "#cccccc",
  "#d9d9d9",
  "#efefef",
  "#f3f3f3",
  "#ffffff",
  "#980000",
  "#ff0000",
  "#ff9900",
  "#ffff00",
  "#00ff00",
  "#00ffff",
  "#4a86e8",
  "#0000ff",
  "#9900ff",
  "#ff00ff",
  "#e6b8af",
  "#f4cccc",
  "#fce5cd",
  "#fff2cc",
  "#d9ead3",
  "#d0e0e3",
  "#c9daf8",
  "#cfe2f3",
  "#d9d2e9",
  "#ead1dc",
];

const headingStyles = [
  { label: "Normal text", value: "p" },
  { label: "Heading 1", value: "h1" },
  { label: "Heading 2", value: "h2" },
  { label: "Heading 3", value: "h3" },
  { label: "Heading 4", value: "h4" },
  { label: "Heading 5", value: "h5" },
  { label: "Heading 6", value: "h6" },
];

const EditorToolbar = ({
  onFormatChange,
  onAddPage,
  onChatToggle,
  isChatOpen,
  onUndo,
  onRedo,
  onSave,
  onPrint,
  onFindReplace,
}: ToolbarProps) => {
  const [documentTitle, setDocumentTitle] = useState("Untitled Document");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState("11");
  const [headingStyle, setHeadingStyle] = useState("p");
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    subscript: false,
    superscript: false,
    alignLeft: true,
    alignCenter: false,
    alignRight: false,
    alignJustify: false,
  });
  const [currentTextColor, setCurrentTextColor] = useState("#000000");
  const [currentHighlightColor, setCurrentHighlightColor] = useState("#FFFF00");
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchCase, setMatchCase] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+S or Cmd+S
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        handleSave();
      }
      // Ctrl+Z or Cmd+Z
      if ((event.ctrlKey || event.metaKey) && event.key === "z") {
        event.preventDefault();
        onUndo?.();
      }
      // Ctrl+Y or Cmd+Y or Ctrl+Shift+Z
      if (
        (event.ctrlKey || event.metaKey) &&
        (event.key === "y" || (event.shiftKey && event.key === "z"))
      ) {
        event.preventDefault();
        onRedo?.();
      }
      // Ctrl+F or Cmd+F
      if ((event.ctrlKey || event.metaKey) && event.key === "f") {
        event.preventDefault();
        document.getElementById("find-dialog-trigger")?.click();
      }
      // Ctrl+P or Cmd+P
      if ((event.ctrlKey || event.metaKey) && event.key === "p") {
        event.preventDefault();
        handlePrint();
      }
      // Ctrl+B or Cmd+B
      if ((event.ctrlKey || event.metaKey) && event.key === "b") {
        event.preventDefault();
        toggleFormat("bold");
      }
      // Ctrl+I or Cmd+I
      if ((event.ctrlKey || event.metaKey) && event.key === "i") {
        event.preventDefault();
        toggleFormat("italic");
      }
      // Ctrl+U or Cmd+U
      if ((event.ctrlKey || event.metaKey) && event.key === "u") {
        event.preventDefault();
        toggleFormat("underline");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onUndo, onRedo]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFormat = (format: string) => {
    const newFormats = { ...activeFormats };

    // If alignment button is clicked, reset other align states
    if (
      format === "alignLeft" ||
      format === "alignCenter" ||
      format === "alignRight" ||
      format === "alignJustify"
    ) {
      newFormats.alignLeft = false;
      newFormats.alignCenter = false;
      newFormats.alignRight = false;
      newFormats.alignJustify = false;
    }

    newFormats[format] = !newFormats[format];
    setActiveFormats(newFormats);
    setIsSaved(false);

    // Map format names to document.execCommand equivalents
    const formatMap: Record<string, string> = {
      bold: "bold",
      italic: "italic",
      underline: "underline",
      strikethrough: "strikeThrough",
      subscript: "subscript",
      superscript: "superscript",
      alignLeft: "justifyLeft",
      alignCenter: "justifyCenter",
      alignRight: "justifyRight",
      alignJustify: "justifyFull",
    };

    if (onFormatChange && formatMap[format]) {
      onFormatChange(formatMap[format], true);
    }
  };

  const handleFontFamilyChange = (family: string) => {
    setFontFamily(family);
    setIsSaved(false);
    onFormatChange?.("fontName", family);
  };

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    setIsSaved(false);
    onFormatChange?.("fontSize", size);
  };

  const handleFontSizeAdjust = (delta: number) => {
    const currentIndex = fontSizes.indexOf(fontSize);
    if (currentIndex !== -1) {
      const newIndex = Math.max(
        0,
        Math.min(fontSizes.length - 1, currentIndex + delta)
      );
      const newSize = fontSizes[newIndex];
      setFontSize(newSize);
      setIsSaved(false);
      onFormatChange?.("fontSize", newSize);
    }
  };

  const handleHeadingChange = (heading: string) => {
    setHeadingStyle(heading);
    setIsSaved(false);
    onFormatChange?.("formatBlock", heading);
  };

  const handleTextColorChange = (color: string) => {
    setCurrentTextColor(color);
    setIsSaved(false);
    onFormatChange?.("foreColor", color);
  };

  const handleHighlightColorChange = (color: string) => {
    setCurrentHighlightColor(color);
    setIsSaved(false);
    onFormatChange?.("hiliteColor", color);
  };

  const toggleTheme = () => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setCurrentTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message}`
        );
      });
    } else {
      document.exitFullscreen?.();
    }
    setIsFullScreen(!isFullScreen);
  };

  const handleSave = () => {
    setIsSaved(true);
    onSave?.();
    showNotification("Document saved");
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const showNotification = (message: string) => {
    // Create a toast notification element
    const notification = document.createElement("div");
    notification.className =
      "fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 animate-in fade-in slide-in-from-bottom-5 duration-300";
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Add animation for removal
    setTimeout(() => {
      notification.classList.add("animate-out", "fade-out", "slide-out-to-bottom-5");
      notification.addEventListener("animationend", () => {
        notification.remove();
      });
    }, 3000);
  };

  const handleFindReplace = (action: "find" | "replace" | "replaceAll") => {
    if (!onFindReplace) return;

    if (action === "find") {
      onFindReplace({ find: findText, matchCase });
    } else if (action === "replace") {
      onFindReplace({ find: findText, replace: replaceText, matchCase });
    } else if (action === "replaceAll") {
      onFindReplace({ find: findText, replace: replaceText, matchCase });
    }
  };

  const formatWithList = (listType: string) => {
    setIsSaved(false);
    onFormatChange?.(listType, true);
  };

  const handleInsertLink = () => {
    const url = prompt("Enter URL:");
    const text = prompt("Enter link text (leave empty to use URL):");
    if (url) {
      setIsSaved(false);
      if (text && onFormatChange) {
        // Insert text
        onFormatChange("insertText", text);
        // Then select it to apply link
        const selection = window.getSelection();
        if (selection) {
          const range = selection.getRangeAt(0);
          range.setStart(range.startContainer, range.startOffset - text.length);
          selection.removeAllRanges();
          selection.addRange(range);
          onFormatChange("createLink", url);
        }
      } else {
        // Link with URL as text
        onFormatChange?.("createLink", url);
      }
    }
  };

  const handleInsertTable = () => {
    const rows = prompt("Number of rows:", "3");
    const cols = prompt("Number of columns:", "3");

    if (rows && cols) {
      const numRows = parseInt(rows, 10);
      const numCols = parseInt(cols, 10);

      if (!isNaN(numRows) && !isNaN(numCols) && numRows > 0 && numCols > 0) {
        let tableHtml =
          '<table border="1" style="width:100%; border-collapse: collapse;">';
        // Header row
        tableHtml += "<tr>";
        for (let j = 0; j < numCols; j++) {
          tableHtml += `<th style="border: 1px solid #dddddd; padding: 8px; text-align: left;">Header ${
            j + 1
          }</th>`;
        }
        tableHtml += "</tr>";
        // Data rows
        for (let i = 0; i < numRows - 1; i++) {
          tableHtml += "<tr>";
          for (let j = 0; j < numCols; j++) {
            tableHtml += `<td style="border: 1px solid #dddddd; padding: 8px;">Row ${
              i + 1
            }, Col ${j + 1}</td>`;
          }
          tableHtml += "</tr>";
        }
        tableHtml += "</table>";

        setIsSaved(false);
        onFormatChange?.("insertHTML", tableHtml);
      }
    }
  };

  const handleInsertImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      setIsSaved(false);
      onFormatChange?.("insertImage", url);
    }
  };

  // Helper for toolbar button + tooltip
  const ToolbarButton = ({
    icon,
    tooltip,
    isActive = false,
    onClick,
    disabled = false,
  }: {
    icon: React.ReactNode;
    tooltip: string;
    isActive?: boolean;
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isActive ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              isActive && "bg-accent text-accent-foreground"
            )}
            onClick={onClick}
            disabled={disabled}
          >
            {icon}
            <span className="sr-only">{tooltip}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  // Color Picker
  const ColorPicker = ({
    colors = colorPalette,
    currentColor,
    onChange,
    title,
  }: {
    colors: string[];
    currentColor: string;
    onChange: (color: string) => void;
    title: string;
  }) => (
    <div className="p-2">
      <div className="text-sm font-medium mb-2">{title}</div>
      <div className="grid grid-cols-10 gap-1">
        {colors.map((color, index) => (
          <button
            key={index}
            className={cn(
              "w-5 h-5 rounded-sm transition-all hover:scale-110",
              color === currentColor && "ring-2 ring-primary"
            )}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
            aria-label={`Color ${color}`}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col border-b border-border bg-background/95 backdrop-blur supports-backdrop-blur:bg-background/60 shadow-sm z-10 transition-all duration-200">
      {/* ========== 1) MENU BAR ========== */}
      <div className="flex items-center px-2 h-9 text-sm">
        {/* --- Left-Side Menus (File, Edit, View, Insert, etc.) --- */}
        <div className="flex items-center mr-auto">
          {/* FILE Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-sm">
                File
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onClick={onAddPage}>
                <FileText className="h-4 w-4 mr-2" />
                New
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
                <div className="ml-auto text-xs text-muted-foreground">Ctrl+S</div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
                <div className="ml-auto text-xs text-muted-foreground">Ctrl+P</div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  onFormatChange && onFormatChange("insertHTML", "<hr>")
                }
              >
                <SeparatorHorizontal className="h-4 w-4 mr-2" />
                Page Break
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <FileDown className="h-4 w-4 mr-2" />
                Download as
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* EDIT Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-sm">
                Edit
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onClick={onUndo}>
                <Undo className="h-4 w-4 mr-2" />
                Undo
                <div className="ml-auto text-xs text-muted-foreground">Ctrl+Z</div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onRedo}>
                <Redo className="h-4 w-4 mr-2" />
                Redo
                <div className="ml-auto text-xs text-muted-foreground">Ctrl+Y</div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onFormatChange && onFormatChange("cut", "")}
              >
                <Scissors className="h-4 w-4 mr-2" />
                Cut
                <div className="ml-auto text-xs text-muted-foreground">Ctrl+X</div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onFormatChange && onFormatChange("copy", "")}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
                <div className="ml-auto text-xs text-muted-foreground">Ctrl+C</div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onFormatChange && onFormatChange("paste", "")}
              >
                <Clipboard className="h-4 w-4 mr-2" />
                Paste
                <div className="ml-auto text-xs text-muted-foreground">Ctrl+V</div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* Find & Replace triggers the dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <DropdownMenuItem id="find-dialog-trigger" onSelect={(e) => e.preventDefault()}>
                    <Search className="h-4 w-4 mr-2" />
                    Find and replace
                    <div className="ml-auto text-xs text-muted-foreground">Ctrl+F</div>
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Find and Replace</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-3">
                    <Label htmlFor="findText">Find</Label>
                    <Input
                      id="findText"
                      placeholder="Search text..."
                      value={findText}
                      onChange={(e) => setFindText(e.target.value)}
                    />
                    <Label htmlFor="replaceText">Replace</Label>
                    <Input
                      id="replaceText"
                      placeholder="Replace with..."
                      value={replaceText}
                      onChange={(e) => setReplaceText(e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                      <input
                        id="matchCase"
                        type="checkbox"
                        checked={matchCase}
                        onChange={(e) => setMatchCase(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="matchCase">Match case</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => handleFindReplace("find")}
                    >
                      Find
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleFindReplace("replace")}
                    >
                      Replace
                    </Button>
                    <Button onClick={() => handleFindReplace("replaceAll")}>
                      Replace All
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* VIEW Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-sm">
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuItem onClick={toggleFullScreen}>
                {isFullScreen ? (
                  <Minimize2 className="h-4 w-4 mr-2" />
                ) : (
                  <Maximize2 className="h-4 w-4 mr-2" />
                )}
                {isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleTheme}>
                {currentTheme === "light" ? (
                  <Moon className="h-4 w-4 mr-2" />
                ) : (
                  <Sun className="h-4 w-4 mr-2" />
                )}
                {currentTheme === "light" ? "Dark Mode" : "Light Mode"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* INSERT Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-sm">
                Insert
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuItem onClick={handleInsertImage}>
                <ImageIcon className="h-4 w-4 mr-2" />
                Image
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleInsertLink}>
                <LinkIcon className="h-4 w-4 mr-2" />
                Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleInsertTable}>
                <Table className="h-4 w-4 mr-2" />
                Table
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  onFormatChange && onFormatChange("insertHorizontalRule", "")
                }
              >
                <SeparatorHorizontal className="h-4 w-4 mr-2" />
                Horizontal line
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  onFormatChange &&
                  onFormatChange("insertHTML", '<div class="page-break"></div>')
                }
              >
                <SeparatorHorizontal className="h-4 w-4 mr-2" />
                Page break
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const date = new Date().toLocaleDateString();
                  onFormatChange?.("insertText", date);
                }}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Date
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const time = new Date().toLocaleTimeString();
                  onFormatChange?.("insertText", time);
                }}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Time
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onFormatChange?.("insertHTML", "©")}
              >
                Special characters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* FORMAT Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-sm">
                Format
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onClick={() => toggleFormat("bold")}>
                <Bold className="h-4 w-4 mr-2" />
                Bold
                <div className="ml-auto text-xs text-muted-foreground">Ctrl+B</div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleFormat("italic")}>
                <Italic className="h-4 w-4 mr-2" />
                Italic
                <div className="ml-auto text-xs text-muted-foreground">Ctrl+I</div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleFormat("underline")}>
                <Underline className="h-4 w-4 mr-2" />
                Underline
                <div className="ml-auto text-xs text-muted-foreground">Ctrl+U</div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onFormatChange && onFormatChange("removeFormat", "")}
              >
                Clear formatting
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* TOOLS Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-sm">
                Tools
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuItem onClick={onChatToggle}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </DropdownMenuItem>
              <DropdownMenuItem>
                <History className="h-4 w-4 mr-2" />
                Version History
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CheckSquare className="h-4 w-4 mr-2" />
                Spelling & Grammar
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Preferences
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* HELP Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-sm">
                Help
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuItem>
                <HelpCircle className="h-4 w-4 mr-2" />
                Documentation
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit3 className="h-4 w-4 mr-2" />
                Keyboard shortcuts
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* --- Right-Side Quick Actions (Save, Undo, Redo, etc.) --- */}
        <div className="flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleSave}
                >
                  <Save className="h-4 w-4" />
                  <span className="sr-only">Save</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Save (Ctrl+S)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={onUndo}
                >
                  <Undo className="h-4 w-4" />
                  <span className="sr-only">Undo</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Undo (Ctrl+Z)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={onRedo}
                >
                  <Redo className="h-4 w-4" />
                  <span className="sr-only">Redo</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Redo (Ctrl+Y)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button
            variant={isChatOpen ? "secondary" : "ghost"}
            size="sm"
            className="h-8 px-2 mx-2 text-sm flex items-center gap-1"
            onClick={() => onChatToggle?.()}
          >
            <MessageSquare className="h-4 w-4" />
            <span>AI Assistant</span>
          </Button>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {}}
                >
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">Share</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Share document</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* ========== 2) TOOLBAR ========== */}
      <div className="px-2 h-10 flex items-center gap-1 bg-background overflow-x-auto border-t border-border">
        {/* Document Title Input */}
        <Input
          className="h-7 w-40 text-sm font-medium border-none text-center focus:ring-1 focus:ring-offset-0 focus-visible:ring-1 focus-visible:ring-primary mr-2"
          value={documentTitle}
          onChange={(e) => {
            setDocumentTitle(e.target.value);
            setIsSaved(false);
          }}
          placeholder="Untitled Document"
        />

        <div className="h-5 border-r border-border mx-1"></div>

        {/* Heading Style Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-sm flex items-center gap-1"
            >
              <span className="truncate max-w-20">
                {headingStyles.find((h) => h.value === headingStyle)?.label ||
                  "Normal text"}
              </span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40">
            {headingStyles.map((style) => (
              <DropdownMenuItem
                key={style.value}
                onClick={() => handleHeadingChange(style.value)}
                className={cn(
                  headingStyle === style.value && "bg-accent"
                )}
              >
                {style.value === "p" ? (
                  <span>{style.label}</span>
                ) : (
                  <span className="font-semibold">{style.label}</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Font Family */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-sm">
              {fontFamily}
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40 max-h-64 overflow-auto">
            {fontFamilies.map((family) => (
              <DropdownMenuItem
                key={family}
                onClick={() => handleFontFamilyChange(family)}
                className={cn(
                  fontFamily === family && "bg-accent"
                )}
                style={{ fontFamily: family }}
              >
                {family}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Font Size */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-sm">
              {fontSize}
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-20 max-h-56 overflow-auto">
            {fontSizes.map((size) => (
              <DropdownMenuItem
                key={size}
                onClick={() => handleFontSizeChange(size)}
                className={cn(
                  fontSize === size && "bg-accent"
                )}
              >
                {size}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Increase / Decrease Font Size */}
        <ToolbarButton
          icon={<Plus className="h-4 w-4" />}
          tooltip="Increase Font Size"
          onClick={() => handleFontSizeAdjust(+1)}
        />
        <ToolbarButton
          icon={<Minus className="h-4 w-4" />}
          tooltip="Decrease Font Size"
          onClick={() => handleFontSizeAdjust(-1)}
        />

        <div className="h-5 border-r border-border mx-1"></div>

        {/* Text Color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 relative"
            >
              <Type className="h-4 w-4" />
              <div 
                className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-1 rounded-sm" 
                style={{ backgroundColor: currentTextColor }}
              />
              <span className="sr-only">Text Color</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0">
            <ColorPicker
              colors={colorPalette}
              currentColor={currentTextColor}
              onChange={handleTextColorChange}
              title="Text Color"
            />
          </PopoverContent>
        </Popover>

        {/* Highlight Color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 relative"
            >
              <Highlighter className="h-4 w-4" />
              <div 
                className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-1 rounded-sm" 
                style={{ backgroundColor: currentHighlightColor }}
              />
              <span className="sr-only">Highlight Color</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0">
            <ColorPicker
              colors={colorPalette}
              currentColor={currentHighlightColor}
              onChange={handleHighlightColorChange}
              title="Highlight Color"
            />
          </PopoverContent>
        </Popover>

        <div className="h-5 border-r border-border mx-1"></div>

        {/* Bold, Italic, Underline, Strikethrough */}
        <ToolbarButton
          icon={<Bold className="h-4 w-4" />}
          tooltip="Bold (Ctrl+B)"
          isActive={activeFormats.bold}
          onClick={() => toggleFormat("bold")}
        />
        <ToolbarButton
          icon={<Italic className="h-4 w-4" />}
          tooltip="Italic (Ctrl+I)"
          isActive={activeFormats.italic}
          onClick={() => toggleFormat("italic")}
        />
        <ToolbarButton
          icon={<Underline className="h-4 w-4" />}
          tooltip="Underline (Ctrl+U)"
          isActive={activeFormats.underline}
          onClick={() => toggleFormat("underline")}
        />
        <ToolbarButton
          icon={<Strikethrough className="h-4 w-4" />}
          tooltip="Strikethrough"
          isActive={activeFormats.strikethrough}
          onClick={() => toggleFormat("strikethrough")}
        />

        {/* Subscript, Superscript */}
        <ToolbarButton
          icon={<Subscript className="h-4 w-4" />}
          tooltip="Subscript"
          isActive={activeFormats.subscript}
          onClick={() => toggleFormat("subscript")}
        />
        <ToolbarButton
          icon={<Superscript className="h-4 w-4" />}
          tooltip="Superscript"
          isActive={activeFormats.superscript}
          onClick={() => toggleFormat("superscript")}
        />

        <div className="h-5 border-r border-border mx-1"></div>

        {/* Alignment */}
        <ToolbarButton
          icon={<AlignLeft className="h-4 w-4" />}
          tooltip="Align Left"
          isActive={activeFormats.alignLeft}
          onClick={() => toggleFormat("alignLeft")}
        />
        <ToolbarButton
          icon={<AlignCenter className="h-4 w-4" />}
          tooltip="Align Center"
          isActive={activeFormats.alignCenter}
          onClick={() => toggleFormat("alignCenter")}
        />
        <ToolbarButton
          icon={<AlignRight className="h-4 w-4" />}
          tooltip="Align Right"
          isActive={activeFormats.alignRight}
          onClick={() => toggleFormat("alignRight")}
        />
        <ToolbarButton
          icon={<AlignJustify className="h-4 w-4" />}
          tooltip="Justify"
          isActive={activeFormats.alignJustify}
          onClick={() => toggleFormat("alignJustify")}
        />

        {/* Indentation */}
        <ToolbarButton
          icon={<IndentIncrease className="h-4 w-4" />}
          tooltip="Increase Indent"
          onClick={() => onFormatChange?.("indent", "")}
        />
        <ToolbarButton
          icon={<IndentDecrease className="h-4 w-4" />}
          tooltip="Decrease Indent"
          onClick={() => onFormatChange?.("outdent", "")}
        />

        <div className="h-5 border-r border-border mx-1"></div>

        {/* Lists */}
        <ToolbarButton
          icon={<List className="h-4 w-4" />}
          tooltip="Bulleted List"
          onClick={() => formatWithList("insertUnorderedList")}
        />
        <ToolbarButton
          icon={<ListOrdered className="h-4 w-4" />}
          tooltip="Numbered List"
          onClick={() => formatWithList("insertOrderedList")}
        />
        <ToolbarButton
          icon={<CheckSquare className="h-4 w-4" />}
          tooltip="Checklist"
          onClick={() => onFormatChange?.("insertHTML", '<ul style="list-style-type: none; padding-left: 1.5em;"><li><input type="checkbox"> Checklist item</li></ul>')}
        />

        <div className="h-5 border-r border-border mx-1"></div>

        {/* Blockquote, Code */}
        <ToolbarButton
          icon={<Quote className="h-4 w-4" />}
          tooltip="Blockquote"
          onClick={() => onFormatChange?.("formatBlock", "blockquote")}
        />
        <ToolbarButton
          icon={<Code className="h-4 w-4" />}
          tooltip="Code Block"
          onClick={() => onFormatChange?.("formatBlock", "pre")}
        />
        
        {/* Status indicator */}
        <div className="ml-auto flex items-center">
          <span className={cn(
            "text-xs px-2 py-1 rounded-full",
            isSaved ? "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400" : "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400"
          )}>
            {isSaved ? "Saved" : "Unsaved changes"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EditorToolbar;
