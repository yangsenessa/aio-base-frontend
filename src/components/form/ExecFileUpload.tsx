
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { uploadExecutableFile } from '@/services/ExecFileUpload';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { validateFileNameMatches, validateExecutableFile } from '@/components/form/FileValidator';

interface ExecFileUploadProps {
  execFile: File | null;
  setExecFile: (file: File | null) => void;
  agentName?: string; // Made this prop optional
  onUploadComplete?: (filePath: string) => void;
  isUploading?: boolean;
  setIsUploading?: (value: boolean) => void;
  showUploadNowButton?: boolean; // New prop to control upload button visibility
}

const ExecFileUpload = ({ 
  execFile, 
  setExecFile, 
  agentName = '', // Add default value
  onUploadComplete,
  isUploading,
  setIsUploading,
  showUploadNowButton = true // Default to true for backward compatibility
}: ExecFileUploadProps) => {
  const [showFileUploader, setShowFileUploader] = useState(false);
  const [isLocalUploading, setIsLocalUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<'pending' | 'uploading' | 'success' | 'error'>('pending');
  const [uploadedFilePath, setUploadedFilePath] = useState<string>('');
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Validate file type
      const validation = validateExecutableFile(file);
      if (!validation.valid) {
        toast({
          title: "Invalid File",
          description: validation.message || "Please upload a valid executable file",
          variant: "destructive",
        });
        return;
      }
      
      // Only validate file name matching if agentName is provided
      if (agentName && !validateFileNameMatches(file, agentName)) {
        return;
      }
      
      setExecFile(file);
    }
  };

  const uploadFile = async () => {
    if (!execFile) {
      toast({
        title: "No File Selected",
        description: "Please select an executable file first",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsLocalUploading(true);
      if (setIsUploading) {
        setIsUploading(true);
      }
      setUploadStep('uploading');
      
      // Upload the file using the service
      const uploadResult = await uploadExecutableFile(
        execFile,
        'agent',
        agentName ? `${agentName}.js` : undefined
      );
      
      if (uploadResult.success) {
        setUploadedFilePath(uploadResult.filepath || '');
        setUploadStep('success');
        
        toast({
          title: "File Upload Successful",
          description: `File '${uploadResult.filename}' uploaded successfully.`,
        });
        
        return true;
      } else {
        setUploadStep('error');
        
        toast({
          title: "File Upload Failed",
          description: uploadResult.message,
          variant: "destructive",
        });
        
        return false;
      }
    } catch (error) {
      setUploadStep('error');
      
      toast({
        title: "File Upload Error",
        description: error instanceof Error ? error.message : "An unknown error occurred during file upload",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLocalUploading(false);
    }
  };

  const handleFileUploadComplete = () => {
    setShowFileUploader(false);
    
    if (uploadStep === 'success' && onUploadComplete) {
      onUploadComplete(uploadedFilePath);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('execFile')?.click()}
          >
            <Upload className="mr-2 h-4 w-4" /> Choose Executable File
          </Button>
          <input
            id="execFile"
            type="file"
            accept=".sh,.bin,.js,.py,application/octet-stream"
            className="hidden"
            onChange={handleFileChange}
          />
          <span className="text-sm text-muted-foreground">
            {execFile ? execFile.name : 'No file chosen'}
          </span>
        </div>

        {/* Only show the upload now button if showUploadNowButton is true */}
        {execFile && showUploadNowButton && (
          <div className="flex items-center mt-2">
            <Button 
              type="button" 
              onClick={() => setShowFileUploader(true)}
              variant="secondary"
              size="sm"
            >
              Upload Now
            </Button>
            <span className="ml-2 text-xs text-muted-foreground">
              Upload file to server before submitting the form
            </span>
          </div>
        )}
      </div>

      {/* File upload dialog */}
      <Dialog open={showFileUploader} onOpenChange={setShowFileUploader}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Upload Executable File</DialogTitle>
            <DialogDescription>
              Your file needs to be uploaded before submitting the agent.
              {uploadStep === 'error' && 
                <p className="text-destructive mt-2">
                  There was a problem uploading your file. Please try again or cancel to go back.
                </p>
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="w-full">
            <div className="mb-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Selected File: {execFile?.name}</p>
                <p className="text-sm text-muted-foreground">
                  Size: {execFile && Math.round(execFile.size / 1024)} KB
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowFileUploader(false)}
                  disabled={isLocalUploading}
                >
                  Cancel
                </Button>
                
                <Button 
                  onClick={uploadFile}
                  disabled={isLocalUploading || uploadStep === 'success'}
                >
                  {isLocalUploading ? 'Uploading...' : uploadStep === 'success' ? 'Upload Complete' : 'Upload File'}
                </Button>
              </div>
            </div>
            
            {uploadStep === 'uploading' && (
              <div className="w-full bg-muted rounded-full h-2.5 my-4">
                <div className="bg-primary h-2.5 rounded-full animate-pulse w-full"></div>
              </div>
            )}
            
            {uploadStep === 'success' && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md my-4">
                <p className="text-green-800 dark:text-green-300">
                  File uploaded successfully! Filepath: {uploadedFilePath}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  Click "Continue" to proceed with Agent submission.
                </p>
              </div>
            )}
            
            {uploadStep === 'error' && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md my-4">
                <p className="text-red-800 dark:text-red-300">
                  Failed to upload file. Please try again or cancel.
                </p>
              </div>
            )}
          </div>
          
          {uploadStep === 'success' && (
            <div className="flex justify-end">
              <Button onClick={handleFileUploadComplete}>
                Continue with Submission
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExecFileUpload;
