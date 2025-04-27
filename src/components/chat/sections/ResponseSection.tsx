
import React, { useEffect, useMemo } from 'react';
import { MessageCircle } from 'lucide-react';
import { getResponseContent } from '@/util/responseUtils';
import { safeJsonParse, removeJsonComments } from '@/util/formatters';

interface ResponseSectionProps {
  content: string;
  response?: string;
  hideTitle?: boolean;
}

// Create a process cache to avoid processing the same content multiple times
const processCache = new Map<string, string>();
const MAX_CACHE_SIZE = 50;
const processingStatus = new Map<string, boolean>();

const ResponseSection: React.FC<ResponseSectionProps> = ({ 
  content, 
  response, 
  hideTitle = false 
}) => {
  // Generate a simple content fingerprint for caching
  const contentFingerprint = useMemo(() => {
    if (!content) return '';
    const preview = content.substring(0, 40);
    return `${preview}-${content.length}`;
  }, [content]);
  
  // More detailed logging to debug response extraction
  useEffect(() => {
    console.log('[ResponseSection] Rendering with:', {
      hasDirectResponse: !!response,
      contentLength: content?.length || 0,
      contentPreview: content?.substring(0, 50),
      fingerprint: contentFingerprint
    });
    
    if (response) {
      console.log('[ResponseSection] Using provided response:', response);
    } else if (processCache.has(contentFingerprint)) {
      console.log('[ResponseSection] Using cached response');
    } else {
      console.log('[ResponseSection] Will extract response from content');
    }
  }, [content, response, contentFingerprint]);

  // Prevent reprocessing already in-progress content
  useEffect(() => {
    return () => {
      // Cleanup processing status when component unmounts
      processingStatus.delete(contentFingerprint);
    };
  }, [contentFingerprint]);

  // Get the appropriate response content to display
  const displayContent = useMemo(() => {
    // If direct response was provided, use it
    if (response) {
      return response;
    }
    
    // If we have already processed this content, return cached result
    if (processCache.has(contentFingerprint)) {
      return processCache.get(contentFingerprint) as string;
    }
    
    // If content is empty, return placeholder
    if (!content) {
      return "No content available.";
    }
    
    // If this content is already being processed, don't reprocess
    if (processingStatus.get(contentFingerprint)) {
      return content; // Return original while still processing
    }
    
    // Mark as processing
    processingStatus.set(contentFingerprint, true);
    
    // Try direct JSON parse first for complete objects
    if (content.trim().startsWith('{')) {
      try {
        // Remove any potential JS comments
        const cleanContent = removeJsonComments(content);
        
        // Try direct parsing first
        const directParsed = JSON.parse(cleanContent);
        if (directParsed && typeof directParsed.response === 'string') {
          console.log('[ResponseSection] Extracted response from direct JSON parse');
          const result = directParsed.response;
          cacheResult(contentFingerprint, result);
          return result;
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
          const result = parsed.response; 
          cacheResult(contentFingerprint, result);
          return result;
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
        const result = responseMatch[1];
        cacheResult(contentFingerprint, result);
        return result;
      }
    }
    
    console.log('[ResponseSection] Using original response text');
    cacheResult(contentFingerprint, responseText);
    return responseText;
  }, [content, response, contentFingerprint]);

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

// Cache the processed result
function cacheResult(key: string, result: string): void {
  // Maintain cache size limit
  if (processCache.size >= MAX_CACHE_SIZE) {
    // Clear oldest entries
    const keys = Array.from(processCache.keys());
    processCache.delete(keys[0]);
  }
  
  processCache.set(key, result);
  processingStatus.delete(key); // Clear processing status
}

export default ResponseSection;
