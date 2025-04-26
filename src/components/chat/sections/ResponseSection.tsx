import React from 'react';
import { MessageCircle } from 'lucide-react';
import { getResponseContent } from '@/util/responseUtils';
import { safeJsonParse, removeJsonComments } from '@/util/formatters';

interface ResponseSectionProps {
  content: string;
  response?: string;
  hideTitle?: boolean;
}

const ResponseSection: React.FC<ResponseSectionProps> = ({ 
  content, 
  response, 
  hideTitle = false 
}) => {
  // More detailed logging to debug response extraction
  React.useEffect(() => {
    console.log('[ResponseSection] Rendering with:', {
      hasDirectResponse: !!response,
      contentLength: content?.length || 0,
      contentPreview: content?.substring(0, 50),
    });
    
    if (response) {
      console.log('[ResponseSection] Using provided response:', response);
    } else {
      console.log('[ResponseSection] Will extract response from content');
    }
  }, [content, response]);

  // Get the appropriate response content to display
  const displayContent = React.useMemo(() => {
    // If a response was directly provided, use it
    if (response) {
      return response;
    }
    
    // Try direct JSON parse first for complete objects
    if (content && content.trim().startsWith('{')) {
      try {
        // Remove any potential JS comments
        const cleanContent = removeJsonComments(content);
        
        // Try direct parsing first
        const directParsed = JSON.parse(cleanContent);
        if (directParsed && typeof directParsed.response === 'string') {
          console.log('[ResponseSection] Extracted response from direct JSON parse');
          return directParsed.response;
        }
      } catch (directError) {
        console.log('[ResponseSection] Direct JSON parse failed', directError.message);
      }
    }
    
    // Try to extract response from content
    const responseText = getResponseContent(content);
    
    // If the extracted response is still JSON, try to get just the 'response' field
    if (responseText.trim().startsWith('{') && responseText.includes('"response"')) {
      try {
        const parsed = safeJsonParse(responseText);
        if (parsed && typeof parsed.response === 'string') {
          console.log('[ResponseSection] Extracted response from parsed JSON');
          return parsed.response;
        }
      } catch (error) {
        console.warn('[ResponseSection] Failed to parse response JSON:', error);
      }
    }
    
    // Simple regex extraction as fallback
    if (content.includes('"response"')) {
      const responseMatch = content.match(/"response"\s*:\s*"([^"]+)"/);
      if (responseMatch && responseMatch[1]) {
        console.log('[ResponseSection] Extracted response using regex');
        return responseMatch[1];
      }
    }
    
    console.log('[ResponseSection] Using original response text');
    return responseText;
  }, [content, response]);

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
