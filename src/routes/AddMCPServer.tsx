
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import FileUploader from '@/components/form/FileUploader';
import { MCPServerFormValues, mcpServerFormSchema } from '@/types/agent';
import { submitMCPServer } from '@/services/apiService';
import { validateExecutableFile, validateFileNameMatches } from '@/components/form/FileValidator';
import MCPServerTechnicalInfo from '@/components/form/MCPServerTechnicalInfo';

const AddMCPServer = () => {
  const [serverFile, setServerFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      type: 'mcp',
      supportedMethods: '',
      supportedModalities: 'text',
      resources: false,
      prompts: false,
      tools: false,
      sampling: false,
      entities: '',
      relations: '',
      traceSupport: false,
    },
  });

  const validateExecFile = (file: File) => {
    const validation = validateExecutableFile(file);
    
    // Also check if the filename matches the server name
    if (validation.valid) {
      validateFileNameMatches(file, form.getValues().name);
    }
    
    return validation;
  };

  const onSubmit = async (data: MCPServerFormValues) => {
    if (!serverFile) {
      toast({
        title: "Executable Required",
        description: "Please upload an executable file for your MCP server",
        variant: "destructive",
      });
      return;
    }

    // Verify the filename matches the server name
    if (!validateFileNameMatches(serverFile, data.name)) {
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Form data:', data);
      console.log('Server file:', serverFile);
      
      // Prepare the data for submission according to AIO-MCP protocol
      const serverData = {
        name: data.name,
        description: data.description,
        author: data.author,
        gitRepo: data.gitRepo,
        homepage: data.homepage,
        // Protocol-specific fields
        type: data.type,
        methods: data.supportedMethods ? data.supportedMethods.split(',').map(m => m.trim()) : [],
        modalities: data.supportedModalities ? data.supportedModalities.split(',').map(m => m.trim()) : ['text'],
        // MCP capabilities
        mcp: {
          resources: data.resources,
          prompts: data.prompts,
          tools: data.tools,
          sampling: data.sampling
        },
        // Implementation details
        entities: data.entities,
        relations: data.relations,
        traceSupport: data.traceSupport
      };
      
      // Submit the server data to the backend
      const response = await submitMCPServer(serverData, serverFile);
      
      console.log('Submission response:', response);
      
      if (response.success) {
        toast({
          title: "MCP Server Submitted",
          description: `Your MCP server has been submitted successfully with ID: ${response.id}`,
        });
        
        // Redirect back to MCP store after successful submission
        setTimeout(() => {
          navigate('/home/mcp-store');
        }, 2000);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error submitting MCP server:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit MCP server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium">
                      Server Name
                    </label>
                    <input
                      id="name"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="e.g., mysql-mcp"
                      {...form.register("name")}
                    />
                    {form.formState.errors.name && (
                      <p className="text-red-500 text-xs">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="author" className="block text-sm font-medium">
                      Author
                    </label>
                    <input
                      id="author"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Your name or organization"
                      {...form.register("author")}
                    />
                    {form.formState.errors.author && (
                      <p className="text-red-500 text-xs">
                        {form.formState.errors.author.message}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    id="description"
                    className="w-full p-2 border border-gray-300 rounded-md h-[104px]"
                    placeholder="Describe what your MCP server does"
                    {...form.register("description")}
                  />
                  {form.formState.errors.description && (
                    <p className="text-red-500 text-xs">
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* File Upload Section */}
            <div className="space-y-6">
              <FileUploader
                id="serverFile"
                label="Upload MCP Server Executable"
                accept=".sh,.bin,.js,.py,application/octet-stream"
                buttonText="Choose Executable File"
                noFileText="No file chosen"
                onChange={setServerFile}
                validateFile={validateExecFile}
                currentFile={serverFile}
              />
              <div className="mt-1 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
                <strong>Important:</strong> The executable file name must match your MCP server name, and it must be compatible with Linux.
              </div>
            </div>
            
            {/* Technical Information Section */}
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
    </div>
  );
};

export default AddMCPServer;
