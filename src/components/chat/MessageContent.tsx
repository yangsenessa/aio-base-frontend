
import React from 'react';
import { Mic } from 'lucide-react';
import { AIMessage } from '@/services/types/aiTypes';
import FilePreview from './FilePreview';
import MessageAudioPlayer from './MessageAudioPlayer';
import { cn } from '@/lib/utils';
import AIResponseCard from './AIResponseCard';
import { 
  isValidJson, 
  extractJsonFromText, 
  processAIResponseContent,
  cleanJsonString,
  safeJsonParse,
  hasModalStructure,
  fixMalformedJson 
} from '@/util/formatters';

interface MessageContentProps {
  message: AIMessage;
  onPlaybackChange: (messageId: string, audioElement: HTMLAudioElement | null) => void;
}

const MessageContent = ({ message, onPlaybackChange }: MessageContentProps) => {
  // Debug logging for message structure
  React.useEffect(() => {
    if (message.sender === 'ai') {
      console.log("Message Content - Message ID:", message.id);
      console.log("Message type:", message.sender);
      console.log("Has metadata:", !!message.metadata);
      console.log("Has structured AI response:", !!message.metadata?.aiResponse);
      console.log("Content preview:", message.content?.substring(0, 100));
      
      if (message.metadata?.aiResponse) {
        console.log("Intent analysis keys:", Object.keys(message.metadata.aiResponse.intent_analysis || {}));
        console.log("Execution steps:", message.metadata.aiResponse.execution_plan?.steps?.length || 0);
      }
    }
  }, [message]);

  // Check if content has JSON format
  const hasJsonContent = React.useMemo(() => {
    if (message.sender !== 'ai' || !message.content) return false;
    
    // Check for JSON markers in the content
    const hasJsonMarkers = 
      message.content.includes('```json') || 
      message.content.includes('\\\\json') ||
      message.content.trim().startsWith('{') ||
      message.content.includes('intent_analysis') ||
      message.content.includes('tasks') ||
      message.content.includes('modalities') ||
      message.content.includes('execution_plan') ||
      message.content.includes('capability_mapping');
    
    // If it looks like JSON, validate it
    if (hasJsonMarkers) {
      // For code blocks with ```json format
      if (message.content.includes('```json')) {
        const cleanJson = cleanJsonString(message.content);
        // Use our enhanced JSON parsing
        try {
          const fixedJson = fixMalformedJson(cleanJson);
          return isValidJson(fixedJson);
        } catch (e) {
          return false;
        }
      }
      
      // Try to extract JSON content
      const jsonContent = extractJsonFromText(message.content);
      return !!jsonContent; // Return true if valid JSON was extracted
    }
    
    return false;
  }, [message]);

  // Check if the content appears to be a structured AI message without being properly parsed
  const isUnparsedStructuredResponse = React.useMemo(() => {
    if (message.sender !== 'ai' || !message.content) return false;
    
    // Check for intent analysis and execution plan markers in raw text
    return (
      message.content.includes("**Intent Analysis:**") && 
      (message.content.includes("**Execution Plan:**") || message.content.includes("**Response:**"))
    );
  }, [message]);

  // Helper function to extract and process structured JSON data
  const extractStructuredData = (content: string) => {
    try {
      // Apply JSON fixing before extraction
      const fixedContent = fixMalformedJson(content);
      const jsonContent = extractJsonFromText(fixedContent);
      if (!jsonContent) return null;
      
      const parsedJson = safeJsonParse(jsonContent);
      if (!parsedJson) return null;
      
      // Check if this JSON has a valid modal structure
      if (hasModalStructure(parsedJson)) {
        return {
          content: parsedJson.response || content,
          intentAnalysis: parsedJson.intent_analysis || {},
          executionPlan: parsedJson.execution_plan
        };
      }
      
      return null;
    } catch (error) {
      console.error("Failed to extract structured data:", error);
      return null;
    }
  };

  const renderMessageContent = () => {
    // Handle voice messages
    if (message.isVoiceMessage) {
      return <span>🎤 {message.content}</span>;
    }
    
    // Handle AI responses
    if (message.sender === 'ai') {
      // Check if this is a structured response with valid metadata
      const hasValidStructuredData = message.metadata?.aiResponse && (
        Object.keys(message.metadata.aiResponse.intent_analysis || {}).length > 0 ||
        (message.metadata.aiResponse.execution_plan?.steps?.length > 0)
      );

      // For properly parsed structured data, use AIResponseCard with modal
      if (hasValidStructuredData) {
        const aiResponse = message.metadata.aiResponse;
        console.log("Rendering modal AIResponseCard with valid data");
        
        // Use the response field from metadata if available, otherwise process the content
        const responseText = aiResponse.response || processAIResponseContent(message.content);
        
        return (
          <AIResponseCard 
            content={responseText}
            intentAnalysis={aiResponse.intent_analysis}
            executionPlan={aiResponse.execution_plan}
            isModal={false}
          />
        );
      }
      
      // Special handling for content that starts with ```json or includes ```json
      if (message.content && (message.content.trim().startsWith('```json') || message.content.includes('```json'))) {
        console.log("Found markdown JSON block, processing...");
        
        const structuredData = extractStructuredData(message.content);
        if (structuredData) {
          console.log("Successfully parsed markdown JSON as structured content");
          return (
            <AIResponseCard 
              content={structuredData.content}
              intentAnalysis={structuredData.intentAnalysis}
              executionPlan={structuredData.executionPlan}
              isModal={false}
            />
          );
        }
      }
      
      // For raw content that appears to be valid JSON but wasn't parsed into metadata
      if (hasJsonContent) {
        console.log("Content appears to be JSON, attempting to parse and display");
        
        const structuredData = extractStructuredData(message.content);
        if (structuredData) {
          console.log("Successfully parsed JSON content, using AIResponseCard with parsed data");
          return (
            <AIResponseCard 
              content={structuredData.content}
              intentAnalysis={structuredData.intentAnalysis}
              executionPlan={structuredData.executionPlan}
              isModal={false}
            />
          );
        }
        
        // If no structured data was extracted, try to display the processed content
        const fixedContent = fixMalformedJson(message.content);
        const jsonContent = extractJsonFromText(fixedContent);
        if (jsonContent) {
          try {
            const parsedJson = safeJsonParse(jsonContent);
            const responseText = parsedJson?.response || message.content;
            return <div className="prose prose-invert max-w-none">{responseText}</div>;
          } catch (error) {
            console.error("Failed to parse JSON content:", error);
          }
        }
      }
      
      // Process the content to extract just the response field if possible
      const processedContent = processAIResponseContent(message.content);
      
      // If the response is different from the original, it means we successfully 
      // extracted the response value
      if (processedContent !== message.content) {
        return <div className="prose prose-invert max-w-none">{processedContent}</div>;
      }
      
      // For an unparsed but structured response, attempt to display it in a more structured way
      if (isUnparsedStructuredResponse) {
        // Extract response part if possible
        let displayContent = message.content;
        if (message.content.includes("**Response:**")) {
          const parts = message.content.split("**Response:**");
          if (parts.length > 1) {
            displayContent = parts[1].trim();
          }
        }
        
        return (
          <div className="space-y-3">
            <AIResponseCard 
              content={displayContent}
              isModal={false}
            />
          </div>
        );
      }
      
      // Otherwise, display the processed content
      return <div className="prose prose-invert max-w-none">{processedContent}</div>;
    }
    
    return message.content;
  };
  
  return (
    <>
      <div className={cn(
        "text-sm transition-all", 
        message.isVoiceMessage ? "italic" : ""
      )}>
        {renderMessageContent()}
      </div>
      
      {message.isVoiceMessage && (
        <div className="mt-2 animate-fade-in">
          <MessageAudioPlayer 
            messageId={message.id}
            audioProgress={message.audioProgress}
            isPlaying={message.isPlaying}
            onPlaybackChange={onPlaybackChange}
          />
        </div>
      )}
      
      {message.attachedFiles && message.attachedFiles.length > 0 && (
        <div className="mt-2 space-y-2 transition-all animate-fade-in">
          {message.attachedFiles.map(file => (
            <FilePreview 
              key={file.id} 
              file={file} 
              compact={true}
              inMessage={true}
            />
          ))}
        </div>
      )}
      
      {message.sender === 'ai' && message.referencedFiles && message.referencedFiles.length > 0 && (
        <div className="mt-4 space-y-3 pt-2 border-t border-white/10 animate-fade-in">
          <div className="text-xs opacity-70">Files referenced:</div>
          <div className="grid grid-cols-1 gap-2">
            {message.referencedFiles.map(file => (
              <FilePreview 
                key={file.id} 
                file={file} 
                inAIResponse={true}
              />
            ))}
          </div>
        </div>
      )}
      
      <div className="text-xs opacity-70 mt-1 transition-opacity">
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </>
  );
};

export default MessageContent;
