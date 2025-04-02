
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { AgentFormValues } from '@/types/agent';
import ImgFileUpload from '@/components/form/ImgFileUpload';
import ExecFileUpload from '@/components/form/ExecFileUpload';
import ServerEndpointField from '@/components/form/ServerEndpointField';

interface AgentFileUploadProps {
  form: UseFormReturn<AgentFormValues>;
  image: File | null;
  setImage: (file: File | null) => void;
  execFile: File | null;
  setExecFile: (file: File | null) => void;
  onImageUploadComplete?: (filePath: string) => void;
  onExecFileUploadComplete?: (filePath: string) => void;
}

const AgentFileUpload = ({ 
  form, 
  image, 
  setImage, 
  execFile, 
  setExecFile,
  onImageUploadComplete,
  onExecFileUploadComplete
}: AgentFileUploadProps) => {
  return (
    <div className="space-y-6">
      <ImgFileUpload
        image={image}
        setImage={setImage}
        onUploadComplete={onImageUploadComplete}
      />
      
      <ExecFileUpload
        execFile={execFile}
        setExecFile={setExecFile}
        agentName={form.getValues().name}
        onUploadComplete={onExecFileUploadComplete}
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
