
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { uploadExecutableFile } from '@/services/ExecFileUpload';

interface ImgFileUploadProps {
  image: File | null;
  setImage: (file: File | null) => void;
  onUploadComplete?: (filePath: string) => void;
}

const ImgFileUpload = ({ 
  image, 
  setImage, 
  onUploadComplete 
}: ImgFileUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [showFileUploader, setShowFileUploader] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<'pending' | 'uploading' | 'success' | 'error'>('pending');
  const [uploadedFilePath, setUploadedFilePath] = useState<string>('');
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid File",
          description: "Please upload a valid image file (JPEG, PNG, GIF, WEBP)",
          variant: "destructive",
        });
        return;
      }
      
      setImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setPreview(loadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadFile = async () => {
    if (!image) {
      toast({
        title: "No Image Selected",
        description: "Please select an image file first",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsUploading(true);
      setUploadStep('uploading');
      
      // Use the actual file upload service - fixed type parameter to 'agent'
      const result = await uploadExecutableFile(
        image, 
        'agent', // Changed from 'img' to 'agent' to match the allowed types
        image.name // Use original filename
      );
      
      if (result.success) {
        setUploadedFilePath(result.filepath || '');
        setUploadStep('success');
        
        toast({
          title: "Image Upload Successful",
          description: `Image '${image.name}' uploaded successfully.`,
        });
        
        // Call the callback to notify parent
        if (onUploadComplete) {
          onUploadComplete(result.filepath || '');
        }
        
        return true;
      } else {
        setUploadStep('error');
        
        toast({
          title: "Image Upload Failed",
          description: result.message,
          variant: "destructive",
        });
        
        // Keep dialog open on error - don't close it, let user try again
        return false;
      }
    } catch (error) {
      setUploadStep('error');
      
      toast({
        title: "Image Upload Error",
        description: error instanceof Error ? error.message : "An unknown error occurred during image upload",
        variant: "destructive",
      });
      
      // Keep dialog open on error
      return false;
    } finally {
      setIsUploading(false);
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
            onClick={() => document.getElementById('imageFile')?.click()}
          >
            <Upload className="mr-2 h-4 w-4" /> Choose Image
          </Button>
          <input
            id="imageFile"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <span className="text-sm text-muted-foreground">
            {image ? image.name : 'No file chosen'}
          </span>
        </div>

        {preview && (
          <div className="mt-2 overflow-hidden rounded-md border">
            <img
              src={preview}
              alt="Preview"
              className="h-48 w-full object-cover"
            />
          </div>
        )}

        {image && (
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
              Upload image to server before submitting the form
            </span>
          </div>
        )}
      </div>

      {/* File upload dialog */}
      <Dialog open={showFileUploader} onOpenChange={setShowFileUploader}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Upload Image File</DialogTitle>
            <DialogDescription>
              Your image needs to be uploaded before submitting the agent.
              {uploadStep === 'error' && 
                <p className="text-destructive mt-2">
                  There was a problem uploading your image. Please try again or cancel to go back.
                </p>
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="w-full">
            <div className="mb-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Selected Image: {image?.name}</p>
                <p className="text-sm text-muted-foreground">
                  Size: {image && Math.round(image.size / 1024)} KB
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
                  onClick={uploadFile}
                  disabled={isUploading || uploadStep === 'success'}
                >
                  {isUploading ? 'Uploading...' : uploadStep === 'success' ? 'Upload Complete' : 'Upload Image'}
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
                  Image uploaded successfully! Filepath: {uploadedFilePath}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  Click "Continue" to proceed with Agent submission.
                </p>
              </div>
            )}
            
            {uploadStep === 'error' && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md my-4">
                <p className="text-red-800 dark:text-red-300">
                  Failed to upload image. Please try again or cancel.
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

export default ImgFileUpload;
