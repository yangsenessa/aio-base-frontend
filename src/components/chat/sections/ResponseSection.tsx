
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { getResponseContent } from '@/util/responseUtils';

interface ResponseSectionProps {
  content: string;
  hideTitle?: boolean;
}

const ResponseSection: React.FC<ResponseSectionProps> = ({ content, hideTitle = false }) => {
  return (
    <div className="p-4 mt-auto">
      {!hideTitle && (
        <div className="flex items-center gap-2 mb-2 text-[#9b87f5]">
          <MessageCircle size={16} />
          <h3 className="font-semibold">Response</h3>
        </div>
      )}
      <div className="prose prose-invert max-w-none">
        {getResponseContent(content)}
      </div>
    </div>
  );
};

export default ResponseSection;
