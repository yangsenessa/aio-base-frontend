
import { Mic } from 'lucide-react';
import { AIMessage } from '@/services/types/aiTypes';
import FilePreview from './FilePreview';
import MessageAudioPlayer from './MessageAudioPlayer';

interface MessageContentProps {
  message: AIMessage;
  onPlaybackChange: (messageId: string, audioElement: HTMLAudioElement | null) => void;
}

const MessageContent = ({ message, onPlaybackChange }: MessageContentProps) => {
  // Format the message content for voice messages
  const renderMessageContent = () => {
    if (message.isVoiceMessage) {
      if (message.transcript) {
        return (
          <div className="flex items-start space-x-2">
            <Mic size={16} className="mt-0.5 flex-shrink-0" />
            <div>{message.transcript}</div>
          </div>
        );
      } else if (message.content.startsWith('🎤')) {
        return (
          <div className="flex items-start space-x-2">
            <Mic size={16} className="mt-0.5 flex-shrink-0" />
            <div>{message.content.substring(3).replace(/^"(.*)"$/, '$1')}</div>
          </div>
        );
      }
    }
    
    return message.content;
  };
  
  return (
    <>
      <div className="text-sm">
        {renderMessageContent()}
      </div>
      
      {message.isVoiceMessage && (
        <MessageAudioPlayer 
          messageId={message.id}
          audioProgress={message.audioProgress}
          isPlaying={message.isPlaying}
          onPlaybackChange={onPlaybackChange}
        />
      )}
      
      {message.attachedFiles && message.attachedFiles.length > 0 && (
        <div className="mt-2 space-y-2">
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
        <div className="mt-4 space-y-3 pt-2 border-t border-white/10">
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
      
      <div className="text-xs opacity-70 mt-1">
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </>
  );
};

export default MessageContent;
