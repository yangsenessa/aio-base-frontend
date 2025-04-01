
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { AgentFormValues } from '@/types/agent';
import FileUploader from '@/components/form/FileUploader';
import ServerEndpointField from '@/components/form/ServerEndpointField';
import { validateExecutableFile, validateFileNameMatches } from '@/components/form/FileValidator';

interface AgentFileUploadProps {
  form: UseFormReturn<AgentFormValues>;
  image: File | null;
  setImage: (file: File | null) => void;
  execFile: File | null;
  setExecFile: (file: File | null) => void;
}

const AgentFileUpload = ({ 
  form, 
  image, 
  setImage, 
  execFile, 
  setExecFile 
}: AgentFileUploadProps) => {

  const validateImageFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return { 
      valid: validTypes.includes(file.type),
      message: "Please upload a valid image file (JPEG, PNG, GIF, WEBP)"
    };
  };

  const validateExecFile = (file: File) => {
    const validation = validateExecutableFile(file);
    
    // Also check if the filename matches the agent name
    if (validation.valid) {
      validateFileNameMatches(file, form.getValues().name);
    }
    
    return validation;
  };

  return (
    <div className="space-y-6">
      <FileUploader
        id="image"
        label="Upload Image"
        accept="image/*"
        buttonText="Choose Image"
        noFileText="No file chosen"
        onChange={setImage}
        validateFile={validateImageFile}
        showPreview={true}
        currentFile={image}
      />
      
      <FileUploader
        id="execFile"
        label="Upload Executable"
        accept=".sh,.bin,.js,.py,application/octet-stream"
        buttonText="Choose Executable File"
        noFileText="No file chosen"
        onChange={setExecFile}
        validateFile={validateExecFile}
        currentFile={execFile}
      />
      
      {/* Server Endpoint field */}
      <ServerEndpointField form={form} />
      
      <div className="mt-1 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
        <strong>Important:</strong> The executable file name must match your agent name, and it must be compatible with Linux.
      </div>
    </div>
  );
};

export default AgentFileUpload;
