
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { getResponseContent } from '@/util/responseUtils';

interface ResponseSectionProps {
  content: string;
  hideTitle?: boolean;
}

const ResponseSection: React.FC<ResponseSectionProps> = ({ 
  content,
  hideTitle = false
}) => {
  const displayContent = getResponseContent(content);
  
  return (
    <div className={hideTitle ? 'p-4' : 'p-4 border-b border-[#9b87f5]/20'}>
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
