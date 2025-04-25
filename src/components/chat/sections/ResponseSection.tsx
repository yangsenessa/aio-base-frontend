import React from 'react';
import { MessageCircle } from 'lucide-react';
import { getResponseContent } from '@/util/responseUtils';
import { safeJsonParse } from '@/util/formatters';

interface ResponseSectionProps {
  content: string;
  hideTitle?: boolean;
}

const ResponseSection: React.FC<ResponseSectionProps> = ({ content, hideTitle = false }) => {
  // Get the appropriate response content to display
  const displayContent = React.useMemo(() => {
    // Try to extract response from content
    const responseText = getResponseContent(content);
    
    // If the extracted response is still JSON, try to get just the 'response' field
    if (responseText.trim().startsWith('{') && responseText.includes('"response"')) {
      try {
        const parsed = safeJsonParse(responseText);
        if (parsed && typeof parsed.response === 'string') {
          return parsed.response;
        }
      } catch (error) {
        console.warn('[ResponseSection] Failed to parse response JSON:', error);
      }
    }
    
    return responseText;
  }, [content]);

  return (
    <div className="p-4 mt-auto">
      {!hideTitle && (
        <div className="flex items-center gap-2 mb-2 text-[#9b87f5]">
          <MessageCircle size={16} />
          <h3 className="font-semibold">Response</h3>
        </div>
      )}
      <div className="prose prose-invert max-w-none whitespace-pre-wrap">
        {displayContent}
      </div>
    </div>
  );
};

export default ResponseSection;
