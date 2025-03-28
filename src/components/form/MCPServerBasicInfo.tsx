import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { MCPServerFormValues } from '@/types/agent';
import FileUploader from '@/components/form/FileUploader';
import { validateExecutableFile, validateFileNameMatches } from '@/components/form/FileValidator';
interface MCPServerBasicInfoProps {
  form: UseFormReturn<MCPServerFormValues>;
  serverFile: File | null;
  setServerFile: React.Dispatch<React.SetStateAction<File | null>>;
}
const MCPServerBasicInfo = ({
  form,
  serverFile,
  setServerFile
}: MCPServerBasicInfoProps) => {
  const validateExecFile = (file: File) => {
    const validation = validateExecutableFile(file);
    if (validation.valid) {
      validateFileNameMatches(file, form.getValues().name);
    }
    return validation;
  };
  return <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium">
                Server Name
              </label>
              <input id="name" placeholder="e.g., mysql-mcp" className="w-full p-2 border border-gray-300 rounded-md bg-stone-900" />
              {form.formState.errors.name && <p className="text-red-500 text-xs">
                  {form.formState.errors.name.message}
                </p>}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="author" className="block text-sm font-medium">
                Author
              </label>
              <input id="author" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Your name or organization" {...form.register("author")} />
              {form.formState.errors.author && <p className="text-red-500 text-xs">
                  {form.formState.errors.author.message}
                </p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium">
              Description
            </label>
            <textarea id="description" placeholder="Describe what your MCP server does" className="w-full p-2 border border-gray-300 rounded-md h-[104px] bg-gray-950" />
            {form.formState.errors.description && <p className="text-red-500 text-xs">
                {form.formState.errors.description.message}
              </p>}
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        <FileUploader id="serverFile" label="Upload MCP Server Executable" accept=".sh,.bin,.js,.py,application/octet-stream" buttonText="Choose Executable File" noFileText="No file chosen" onChange={setServerFile} validateFile={validateExecFile} currentFile={serverFile} />

        {/* Add Remote Endpoint URL field */}
        <div className="space-y-2 mt-4">
          <label htmlFor="remoteEndpoint" className="block text-sm font-medium">
            Remote Call Endpoint URL
          </label>
          <input id="remoteEndpoint" className="w-full p-2 border border-gray-300 rounded-md" placeholder="https://your-remote-endpoint.com" {...form.register("remoteEndpoint")} />
          {form.formState.errors.remoteEndpoint && <p className="text-red-500 text-xs">
              {form.formState.errors.remoteEndpoint.message}
            </p>}
          <p className="text-xs text-gray-500">
            Optional URL endpoint for remote MCP server calls
          </p>
        </div>
        
        <div className="mt-1 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
          <strong>:</strong> The executable file name must match your MCP server name, and it must be compatible with Linux.
        </div>
      </div>
    </div>;
};
export default MCPServerBasicInfo;