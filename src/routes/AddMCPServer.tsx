import React, { useState, useRef } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { MCPServerFormValues, mcpServerFormSchema } from '@/types/agent';
import { submitMCPServer } from '@/services/apiService';
import { validateFileNameMatches } from '@/components/form/FileValidator';
import MCPServerBasicInfo from '@/components/form/MCPServerBasicInfo';
import MCPServerTechnicalInfo from '@/components/form/MCPServerTechnicalInfo';
import { isValidJson, formatJsonForCanister } from '@/util/formatters';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FileServer from '@/components/FileServer';
import { uploadExecutableFile } from '@/services/ExecFileUpload';

// Add logger utility for AddMCPServer component
const logMCP = (area: string, message: string, data?: any) => {
  if (data) {
    console.log(`[AddMCPServer][${area}] ${message}`, data);
  } else {
    console.log(`[AddMCPServer][${area}] ${message}`);
  }
};

const AddMCPServer = () => {
  const [serverFile, setServerFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFileUploader, setShowFileUploader] = useState(false);
  const [uploadedFilePath, setUploadedFilePath] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<'pending' | 'uploading' | 'success' | 'error'>('pending');
  
  const formDataRef = useRef<MCPServerFormValues | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<MCPServerFormValues>({
    resolver: zodResolver(mcpServerFormSchema),
    defaultValues: {
      name: '',
      description: '',
      author: '',
      gitRepo: '',
      homepage: '',
      remoteEndpoint: '',
      type: 'sse',
      communityBody: JSON.stringify({
        method: "math_agent::tools.call",
        params: {
          tool: "calculate_area",
          args: { x: 3, y: 4 }
        }
      }, null, 2),
      resources: false,
      prompts: false,
      tools: false,
      sampling: false,
    },
  });

  const uploadFile = async () => {
    logMCP('UPLOAD', 'Starting file upload process');
    
    if (!serverFile) {
      logMCP('UPLOAD', 'No file to upload, skipping upload step');
      return true; // No file to upload is considered success
    }
    
    try {
      setIsUploading(true);
      setUploadStep('uploading');
      
      logMCP('UPLOAD', 'Uploading file', { 
        filename: serverFile.name, 
        size: serverFile.size, 
        type: 'mcp' 
      });
      
      // Use form data to create a valid filename
      const customFilename = formDataRef.current?.name 
        ? `${formDataRef.current.name}.js` 
        : serverFile.name;
      
      const uploadResult = await uploadExecutableFile(serverFile, 'mcp', customFilename);
      
      if (uploadResult.success) {
        logMCP('UPLOAD', 'File upload successful', uploadResult);
        setUploadedFilePath(uploadResult.filepath || '');
        setUploadStep('success');
        
        toast({
          title: "File Upload Successful",
          description: `File '${uploadResult.filename}' uploaded successfully.`,
        });
        
        return true;
      } else {
        logMCP('UPLOAD', 'File upload failed', uploadResult);
        setUploadStep('error');
        
        toast({
          title: "File Upload Failed",
          description: uploadResult.message,
          variant: "destructive",
        });
        
        return false;
      }
    } catch (error) {
      logMCP('UPLOAD', 'Exception during file upload', error);
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
    logMCP('UPLOAD_COMPLETE', 'File upload process completed');
    setShowFileUploader(false);
    
    if (uploadStep === 'success' && formDataRef.current) {
      logMCP('UPLOAD_COMPLETE', 'Proceeding to submit MCP server with uploaded file');
      submitMcpServerData(formDataRef.current, uploadedFilePath);
    }
  };

  const submitMcpServerData = async (data: MCPServerFormValues, filePath?: string) => {
    logMCP('SUBMIT', 'Submitting MCP server data to backend', { 
      data,
      hasFilePath: !!filePath
    });
    
    try {
      setIsSubmitting(true);
      
      // Prepare data according to AIO-MCP protocol format
      const serverData = {
        name: data.name,
        description: data.description,
        author: data.author,
        gitRepo: data.gitRepo,
        exec_file: filePath || (serverFile ? serverFile.name : ''),
        homepage: data.homepage,
        remoteEndpoint: data.remoteEndpoint,
        type: data.type,
        communityBody: data.communityBody,
        resources: data.resources,
        prompts: data.prompts,
        tools: data.tools,
        sampling: data.sampling
      };
      
      // If we uploaded the file, we don't need to pass it again
      // If we didn't upload and have a file object, pass it to submitMCPServer
      const fileToSubmit = filePath ? undefined : serverFile;
      
      logMCP('SUBMIT', 'Calling submitMCPServer', { 
        serverData,
        usingFilePath: !!filePath,
        passingFileObject: !!fileToSubmit
      });
      
      const response = await submitMCPServer(serverData, fileToSubmit);
      
      logMCP('SUBMIT', 'Submission response received', response);
      
      if (response.success) {
        toast({
          title: "MCP Server Submitted",
          description: `Your MCP server has been submitted successfully with ID: ${response.id}`,
        });
        
        setTimeout(() => {
          navigate('/home/mcp-store');
        }, 2000);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      logMCP('SUBMIT', 'Error submitting MCP server', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit MCP server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: MCPServerFormValues) => {
    logMCP('SUBMIT', 'Form submitted', data);
    
    // Store form data for later use after file upload
    formDataRef.current = data;
    
    // Validate JSON format for communityBody
    if (data.communityBody && !isValidJson(data.communityBody)) {
      logMCP('VALIDATION', 'Invalid JSON format in communityBody');
      toast({
        title: "Invalid JSON Format",
        description: "The Community Body must be valid JSON. Please check your syntax.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if there's a file to upload
    if (serverFile) {
      logMCP('UPLOAD', 'File selected, need to upload first', { 
        filename: serverFile.name, 
        size: serverFile.size 
      });
      
      // Validate file name matches if needed
      if (!validateFileNameMatches(serverFile, data.name)) {
        return;
      }
      
      // Show file uploader dialog
      setShowFileUploader(true);
    } else {
      // No file to upload, proceed directly to submission
      logMCP('UPLOAD', 'No file selected, proceeding directly to submission');
      submitMcpServerData(data);
    }
  };

  return (
    <div className="py-8 max-w-3xl mx-auto">
      <div className="flex items-center mb-8">
        <Link to="/home/mcp-store" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Add My MCP Server</h1>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic information section */}
            <MCPServerBasicInfo 
              form={form} 
              serverFile={serverFile} 
              setServerFile={setServerFile} 
            />
            
            {/* Technical information section */}
            <MCPServerTechnicalInfo form={form} />

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit MCP Server'}
              </Button>
            </div>
          </form>
        </Form>
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
                      setTimeout(handleFileUploadComplete, 30000);
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

export default AddMCPServer;
