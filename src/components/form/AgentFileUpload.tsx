
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { AgentFormValues } from '@/types/agent';
import ImgFileUpload from '@/components/form/ImgFileUpload';
import ExecFileUpload from '@/components/form/ExecFileUpload';
import ServerEndpointField from '@/components/form/ServerEndpointField';
import { FormField, FormItem, FormLabel, FormDescription, FormControl, FormMessage } from '@/components/ui/form';

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
  // Get the current agent name from the form
  const agentName = form.watch('name');

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold mb-4">File Uploads and Server Configuration</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <FormItem>
            <FormLabel>Agent Image</FormLabel>
            <FormDescription>Upload an image for your agent (optional)</FormDescription>
            <FormControl>
              <ImgFileUpload 
                image={image} 
                setImage={setImage} 
                onUploadComplete={onImageUploadComplete}
                agentName={agentName} // Pass the agent name for use in filename
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </div>
        <div>
          <FormItem>
            <FormLabel>Executable File</FormLabel>
            <FormDescription>Upload an executable file for your agent (optional)</FormDescription>
            <FormControl>
              <ExecFileUpload 
                execFile={execFile} 
                setExecFile={setExecFile} 
                agentName={agentName} // Pass the agent name from the form
                onUploadComplete={onExecFileUploadComplete}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </div>
      </div>
      
      {/* Server Endpoint field */}
      <ServerEndpointField form={form} />
      
      <div className="mt-1 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
        <strong>Important:</strong> The executable file name must match your agent name, and it must be compatible with Linux.
      </div>
    </div>
  );
};

export default AgentFileUpload;
