
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { MCPServerFormValues } from '@/types/agent';
import FileUploader from '@/components/form/FileUploader';
import { validateExecutableFile, validateFileNameMatches } from '@/components/form/FileValidator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { uploadExecutableFile } from '@/services/ExecFileUpload';

interface MCPServerFileUploadProps {
  form: UseFormReturn<MCPServerFormValues>;
  serverFile: File | null;
  setServerFile: (file: File | null) => void;
  onFileUploadComplete?: (filePath: string) => void;
}

const MCPServerFileUpload = ({ 
  form, 
  serverFile, 
  setServerFile,
  onFileUploadComplete
}: MCPServerFileUploadProps) => {
  const [showFileUploader, setShowFileUploader] = useState(false);
  const [uploadedFilePath, setUploadedFilePath] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<'pending' | 'uploading' | 'success' | 'error'>('pending');
  const { toast } = useToast();

  const validateExecFile = (file: File) => {
    const validation = validateExecutableFile(file);
    if (validation.valid) {
      validateFileNameMatches(file, form.getValues().name);
    }
    return validation;
  };

  const uploadFile = async () => {
    if (!serverFile) {
      return true; // No file to upload is considered success
    }
    
    try {
      setIsUploading(true);
      setUploadStep('uploading');
      
      // Use form data to create a valid filename
      const customFilename = form.getValues().name 
        ? `${form.getValues().name}.js` 
        : serverFile.name;
      
      const uploadResult = await uploadExecutableFile(serverFile, 'mcp', customFilename);
      
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
      setIsUploading(false);
    }
  };

  const handleFileUploadComplete = () => {
    setShowFileUploader(false);
    
    if (uploadStep === 'success' && onFileUploadComplete) {
      onFileUploadComplete(uploadedFilePath);
    }
  };

  return (
    <div className="space-y-6">
      <FileUploader 
        id="serverFile" 
        label="Upload MCP Server Executable" 
        accept=".sh,.bin,.js,.py,.exe,application/octet-stream" 
        buttonText="Choose Executable File" 
        noFileText="No file chosen" 
        onChange={setServerFile} 
        validateFile={validateExecFile} 
        currentFile={serverFile} 
      />

      <div className="mt-1 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
        <strong>Note:</strong> The executable file name must match your MCP server name, and it must be compatible with Linux.
      </div>

      {/* File upload dialog */}
      <Dialog open={showFileUploader} onOpenChange={setShowFileUploader}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Upload MCP Server File</DialogTitle>
            <DialogDescription>
              Your file needs to be uploaded before submitting the MCP server.
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
                <p className="text-sm font-medium">Selected File: {serverFile?.name}</p>
                <p className="text-sm text-muted-foreground">
                  Size: {serverFile && Math.round(serverFile.size / 1024)} KB
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowFileUploader(false)}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                
                <Button 
                  onClick={async () => {
                    const success = await uploadFile();
                    if (success) {
                      setTimeout(handleFileUploadComplete, 1000);
                    }
                  }}
                  disabled={isUploading || uploadStep === 'success'}
                >
                  {isUploading ? 'Uploading...' : uploadStep === 'success' ? 'Upload Complete' : 'Upload File'}
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
                  Click "Continue" to proceed with MCP Server submission.
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

export default MCPServerFileUpload;
