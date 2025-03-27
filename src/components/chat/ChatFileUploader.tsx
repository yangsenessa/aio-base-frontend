
import React, { useState, useRef } from 'react';
import { Paperclip, X, FileText, Image, FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { storeFile, deleteStoredFile } from '@/services/fileStorageService';

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface ChatFileUploaderProps {
  onFileAttached: (fileId: string, fileInfo: AttachedFile) => void;
  onFileRemoved: (fileId: string) => void;
  attachedFiles: AttachedFile[];
}

const ChatFileUploader: React.FC<ChatFileUploaderProps> = ({
  onFileAttached,
  onFileRemoved,
  attachedFiles
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      const fileId = await storeFile(file);
      
      onFileAttached(fileId, {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
      });
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    deleteStoredFile(fileId);
    onFileRemoved(fileId);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image size={16} />;
    } else if (fileType.includes('pdf')) {
      return <FileText size={16} />;
    } else {
      return <FileIcon size={16} />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*, application/pdf, text/plain, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      />
      
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="rounded-full h-8 w-8 p-0"
      >
        <Paperclip size={18} className="text-muted-foreground" />
      </Button>
      
      {attachedFiles.length > 0 && (
        <div className="space-y-1 mt-2">
          {attachedFiles.map((file) => (
            <div key={file.id} className="flex items-center p-1.5 rounded-md bg-secondary/50 text-xs">
              <span className="mr-1">{getFileIcon(file.type)}</span>
              <span className="truncate flex-1 mr-1">{file.name}</span>
              <span className="text-muted-foreground text-xs mr-2">
                {formatFileSize(file.size)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveFile(file.id)}
                className="h-4 w-4 p-0 rounded-full hover:bg-secondary-foreground/20"
              >
                <X size={12} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatFileUploader;
