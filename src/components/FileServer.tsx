import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { uploadExecutableFile, downloadExecutableFile, checkFileExists, getFileDownloadUrl } from '@/services/ExecFileUpload';
import { SERVER_PATHS } from '@/services/apiService';

const FileServer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'agent' | 'mcp'>('agent');
  const [customFilename, setCustomFilename] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState<boolean | null>(null);
  const [uploadedFilePath, setUploadedFilePath] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  // For download tab
  const [filePath, setFilePath] = useState<string>('');
  const [fileExists, setFileExists] = useState<boolean | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<string>('');

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      if (!customFilename) {
        setCustomFilename(e.target.files[0].name);
      }
    }
  }, [customFilename]);

  const handleUpload = useCallback(async () => {
    if (!file) {
      setUploadStatus('Please select a file first');
      setUploadSuccess(false);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate progress (in a real app, you'd use upload progress events)
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 5;
      });
    }, 100);

    try {
      const result = await uploadExecutableFile(file, fileType, customFilename);
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (result.success) {
        setUploadStatus(`File uploaded successfully: ${result.filename}`);
        setUploadSuccess(true);
        setUploadedFilePath(result.filepath || '');
      } else {
        setUploadStatus(`Upload failed: ${result.message}`);
        setUploadSuccess(false);
      }
    } catch (error) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      setUploadStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setUploadSuccess(false);
    } finally {
      setIsUploading(false);
    }
  }, [file, fileType, customFilename]);

  const handleCheckExists = useCallback(async () => {
    if (!filePath) {
      setDownloadStatus('Please enter a file path');
      return;
    }

    try {
      const exists = await checkFileExists(filePath);
      setFileExists(exists);
      setDownloadStatus(exists ? 'File exists and is ready for download' : 'File does not exist');
    } catch (error) {
      setFileExists(false);
      setDownloadStatus(`Error checking file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [filePath]);

  const handleDownload = useCallback(async () => {
    if (!filePath) {
      setDownloadStatus('Please enter a file path');
      return;
    }

    try {
      const result = await downloadExecutableFile(filePath);
      
      if (result.success && result.data) {
        // Create a download link
        const url = window.URL.createObjectURL(result.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename || 'downloaded-file';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setDownloadStatus(`File downloaded: ${result.filename}`);
      } else {
        setDownloadStatus(`Download failed: ${result.message}`);
      }
    } catch (error) {
      setDownloadStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [filePath]);

  return (
    <Card className="w-[800px] mx-auto my-8">
      <CardHeader>
        <CardTitle>File Server</CardTitle>
        <CardDescription>
          Upload and download executable files for agents and MCP servers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Files</TabsTrigger>
            <TabsTrigger value="download">Download Files</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fileType" className="text-right">
                  File Type
                </Label>
                <Select 
                  value={fileType} 
                  onValueChange={(value) => setFileType(value as 'agent' | 'mcp')}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select file type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">Agent Executable</SelectItem>
                    <SelectItem value="mcp">MCP Server</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="targetDir" className="text-right">
                  Target Directory
                </Label>
                <Input
                  id="targetDir"
                  value={fileType === 'agent' ? SERVER_PATHS.AGENT_EXEC_DIR : SERVER_PATHS.MCP_EXEC_DIR}
                  disabled
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customFilename" className="text-right">
                  Custom Filename
                </Label>
                <Input
                  id="customFilename"
                  value={customFilename}
                  onChange={(e) => setCustomFilename(e.target.value)}
                  placeholder="Optional custom filename"
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="file" className="text-right">
                  File
                </Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  className="col-span-3"
                />
              </div>
              
              {isUploading && (
                <div className="py-2">
                  <Label className="text-sm">Upload Progress</Label>
                  <Progress value={uploadProgress} className="h-2 mt-2" />
                </div>
              )}
              
              {uploadStatus && (
                <Alert variant={uploadSuccess ? "default" : "destructive"}>
                  <AlertDescription>{uploadStatus}</AlertDescription>
                </Alert>
              )}
              
              {uploadSuccess && uploadedFilePath && (
                <div className="text-sm mt-2">
                  <p>File Path: {uploadedFilePath}</p>
                  <p>Use this path to download the file later.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="download" className="space-y-4">
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="filePath" className="text-right">
                  File Path
                </Label>
                <Input
                  id="filePath"
                  value={filePath}
                  onChange={(e) => setFilePath(e.target.value)}
                  placeholder="Enter the path to the file"
                  className="col-span-3"
                />
              </div>
              
              {downloadStatus && (
                <Alert variant={fileExists ? "default" : "destructive"}>
                  <AlertDescription>{downloadStatus}</AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Tabs defaultValue="upload">
          <TabsContent value="upload">
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload File"}
            </Button>
          </TabsContent>
          <TabsContent value="download" className="flex space-x-4">
            <Button onClick={handleCheckExists} variant="outline">
              Check If File Exists
            </Button>
            <Button onClick={handleDownload} disabled={fileExists === false}>
              Download File
            </Button>
          </TabsContent>
        </Tabs>
      </CardFooter>
    </Card>
  );
};

export default FileServer;
