
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { extractResponseFromContent } from '../utils/responseExtractor';

interface ResponseSectionProps {
  content: string;
}

const ResponseSection: React.FC<ResponseSectionProps> = ({ content }) => {
  const displayContent = extractResponseFromContent(content);
  
  return (
    <div className="p-4 mt-auto">
      <div className="flex items-center gap-2 mb-2 text-[#9b87f5]">
        <MessageCircle size={16} />
        <h3 className="font-semibold">Response</h3>
      </div>
      <div className="prose prose-invert max-w-none">
        {displayContent}
      </div>
    </div>
  );
};

export default ResponseSection;
