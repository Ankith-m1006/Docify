
import { CalendarDays } from "lucide-react";

interface DocumentCardProps {
  id: string;
  title: string;
  lastModified: Date;
  onClick: () => void;
}

const DocumentCard = ({ id, title, lastModified, onClick }: DocumentCardProps) => {
  // Format date to display like "May 15, 2023"
  const formattedDate = lastModified.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div 
      className="document-card group animate-fade-in" 
      onClick={onClick}
    >
      <div className="document-card-preview">
        <div className="w-full h-full flex flex-col">
          <p className="text-lg font-medium mb-2 truncate">{title}</p>
          <div className="border-b border-editor-mediumGray/30 my-1"></div>
          <p className="text-sm text-muted-foreground">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
      </div>
      <div className="document-card-footer">
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
          <span>{formattedDate}</span>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* This could be action buttons that appear on hover */}
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
