import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadImageFile } from '@/services/ImgFileUpload';
import { X, Upload, Image } from 'lucide-react';

interface ImgFileUploadProps {
  image: File | null;
  setImage: (file: File | null) => void;
  onUploadComplete?: (filePath: string) => void;
}

const ImgFileUpload: React.FC<ImgFileUploadProps> = ({ 
  image, 
  setImage, 
  onUploadComplete 
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      // Validate file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Create preview URL using FileReader to generate a data URL (CSP compliant)
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      setImage(file);
    } else {
      setPreviewUrl(null);
      setImage(null);
    }
  };
  
  // Clear selected file
  const handleClearFile = () => {
    setImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Upload the selected image
  const handleUpload = async () => {
    if (!image) {
      alert('Please select an image first');
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const result = await uploadImageFile(image);
      setUploadProgress(100);
      
      if (result.success && result.filepath && onUploadComplete) {
        onUploadComplete(result.filepath);
        alert('Image uploaded successfully');
      } else {
        alert(`Upload failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Label htmlFor="image-upload" className="sr-only">
          Agent Image
        </Label>
        <Input
          id="image-upload"
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
        />
        
        {image && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClearFile}
            title="Clear selected image"
          >
            <X size={18} />
          </Button>
        )}
      </div>
      
      {/* Preview image if available */}
      {previewUrl && (
        <div className="relative w-full max-w-xs h-40 border rounded-md overflow-hidden">
          <img 
            src={previewUrl} 
            alt="Image preview" 
            className="w-full h-full object-contain"
          />
        </div>
      )}
      
      {/* Upload button and progress */}
      {image && !uploading && (
        <Button 
          onClick={handleUpload} 
          className="flex items-center gap-2"
        >
          <Upload size={16} />
          Upload Image
        </Button>
      )}
      
      {/* Upload progress indicator */}
      {uploading && (
        <div className="space-y-2">
          <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-muted-foreground">
            Uploading ({uploadProgress}%)...
          </p>
        </div>
      )}
      
      {!image && (
        <div className="flex items-center justify-center w-full max-w-xs h-32 border border-dashed rounded-md bg-slate-50">
          <div className="text-center text-muted-foreground">
            <Image size={24} className="mx-auto mb-2" />
            <p className="text-sm">Select an image file</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImgFileUpload;
