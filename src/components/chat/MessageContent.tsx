
import React from 'react';
import { Mic } from 'lucide-react';
import { AIMessage } from '@/services/types/aiTypes';
import FilePreview from './FilePreview';
import MessageAudioPlayer from './MessageAudioPlayer';
import { cn } from '@/lib/utils';
import AIResponseCard from './AIResponseCard';

interface MessageContentProps {
  message: AIMessage;
  onPlaybackChange: (messageId: string, audioElement: HTMLAudioElement | null) => void;
}

const MessageContent = ({ message, onPlaybackChange }: MessageContentProps) => {
  // Add debugging for the message metadata
  React.useEffect(() => {
    if (message.sender === 'ai') {
      console.log("Message Content - Message type:", message.sender);
      console.log("Has metadata:", !!message.metadata);
      console.log("Has structured AI response:", !!message.metadata?.aiResponse);
      
      if (message.metadata?.aiResponse) {
        console.log("Intent analysis keys:", Object.keys(message.metadata.aiResponse.intent_analysis || {}));
        console.log("Execution steps:", message.metadata.aiResponse.execution_plan?.steps?.length || 0);
      }
      
      // Check if content appears to be raw JSON
      if (message.content && (message.content.startsWith('```json') || 
          message.content.startsWith('\\\\json') ||
          message.content.trim().startsWith('{'))) {
        console.log("Content appears to be raw JSON");
      }
    }
  }, [message]);

  const renderMessageContent = () => {
    // Handle voice messages
    if (message.isVoiceMessage) {
      if (message.transcript) {
        return (
          <div className="flex items-start space-x-2">
            <Mic size={16} className="mt-0.5 flex-shrink-0 animate-pulse" />
            <div className="transition-opacity animate-fade-in">{message.transcript}</div>
          </div>
        );
      } else if (message.content.startsWith('🎤')) {
        return (
          <div className="flex items-start space-x-2">
            <Mic size={16} className="mt-0.5 flex-shrink-0 animate-pulse" />
            <div className="transition-opacity animate-fade-in">{message.content.substring(3).replace(/^"(.*)"$/, '$1')}</div>
          </div>
        );
      }
    }
    
    // Handle AI responses
    if (message.sender === 'ai') {
      // Check if this is a structured response with valid metadata
      const hasValidStructuredData = message.metadata?.aiResponse && (
        Object.keys(message.metadata.aiResponse.intent_analysis || {}).length > 0 ||
        (message.metadata.aiResponse.execution_plan?.steps?.length > 0)
      );

      // Use AIResponseCard only if we have valid structured data
      if (hasValidStructuredData) {
        const aiResponse = message.metadata.aiResponse;
        return (
          <AIResponseCard 
            content={aiResponse.response || message.content}
            intentAnalysis={aiResponse.intent_analysis}
            executionPlan={aiResponse.execution_plan}
          />
        );
      }
      
      // Check if content appears to be raw JSON that wasn't properly parsed
      if (message.content && (
          message.content.includes('```json') || 
          message.content.includes('\\\\json') ||
          (message.content.includes('{') && message.content.includes('}'))
      )) {
        // If it appears to be raw JSON, render it with pre formatting
        return (
          <div className="prose prose-invert max-w-none">
            <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-[300px] p-2 bg-[#1A1F2C] rounded">
              {message.content}
            </pre>
          </div>
        );
      }
      
      // Otherwise, display the raw content
      return <div className="prose prose-invert max-w-none">{message.content}</div>;
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
