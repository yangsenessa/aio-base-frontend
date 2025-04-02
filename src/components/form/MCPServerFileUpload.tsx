
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { MCPServerFormValues } from '@/types/agent';
import FileUploader from '@/components/form/FileUploader';
import { validateExecutableFile, validateFileNameMatches } from '@/components/form/FileValidator';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

interface MCPServerFileUploadProps {
  form: UseFormReturn<MCPServerFormValues>;
  serverFile: File | null;
  setServerFile: (file: File | null) => void;
}

const MCPServerFileUpload = ({ 
  form, 
  serverFile, 
  setServerFile
}: MCPServerFileUploadProps) => {
  const validateExecFile = (file: File) => {
    const validation = validateExecutableFile(file);
    if (validation.valid) {
      validateFileNameMatches(file, form.getValues().name);
    }
    return validation;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold mb-4">MCP Server Executable</h2>
      
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
    </div>
  );
};

export default MCPServerFileUpload;
