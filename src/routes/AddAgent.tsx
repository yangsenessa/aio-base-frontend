
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import FileUploader from '@/components/form/FileUploader';
import AgentBasicInfo from '@/components/form/AgentBasicInfo';
import AgentTechnicalInfo from '@/components/form/AgentTechnicalInfo';
import AgentIOExamples from '@/components/form/AgentIOExamples';
import { AgentFormValues, agentFormSchema } from '@/types/agent';
import { submitAgent } from '@/services/apiService';
import { validateExecutableFile, validateFileNameMatches } from '@/components/form/FileValidator';

const AddAgent = () => {
  const [image, setImage] = useState<File | null>(null);
  const [execFile, setExecFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      name: '',
      description: '',
      author: '',
      platform: 'linux', 
      gitRepo: '',
      homepage: '',
      serverEndpoint: '',
      inputParams: '',
      outputExample: '',
    },
  });

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

  const onSubmit = async (data: AgentFormValues) => {
    if (!image) {
      toast({
        title: "Image Required",
        description: "Please upload an image for your agent",
        variant: "destructive",
      });
      return;
    }

    if (!execFile) {
      toast({
        title: "Executable Required",
        description: "Please upload an executable file for your agent",
        variant: "destructive",
      });
      return;
    }

    // Verify the filename matches the agent name
    if (!validateFileNameMatches(execFile, data.name)) {
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Form data:', data);
      console.log('Image file:', image);
      console.log('Executable file:', execFile);
      
      // Prepare the data for submission
      const agentData = {
        name: data.name,
        description: data.description,
        author: data.author,
        platform: data.platform,
        gitRepo: data.gitRepo,
        homepage: data.homepage,
        serverEndpoint: data.serverEndpoint,
        inputParams: data.inputParams,
        outputExample: data.outputExample,
      };
      
      // Submit the agent data to the backend
      const response = await submitAgent(agentData, image, execFile);
      
      console.log('Submission response:', response);
      
      if (response.success) {
        toast({
          title: "Agent Submitted",
          description: `Your agent has been submitted successfully with ID: ${response.id}`,
        });
        
        // Redirect back to agent store after successful submission
        setTimeout(() => {
          navigate('/home/agent-store');
        }, 2000);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error submitting agent:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit agent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8 max-w-3xl mx-auto">
      <div className="flex items-center mb-8">
        <Link to="/home/agent-store" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Add My Agent</h1>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information Section */}
            <AgentBasicInfo form={form} />
            
            {/* File Upload Section */}
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
              
              {/* NEW: Adding Server Endpoint field here, just after executable file upload */}
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="serverEndpoint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Server Endpoint URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://your-agent-endpoint.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional URL endpoint for your agent's server
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="mt-1 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
                <strong>Important:</strong> The executable file name must match your agent name, and it must be compatible with Linux.
              </div>
            </div>
            
            {/* Technical Information Section */}
            <AgentTechnicalInfo form={form} />
            
            {/* I/O Examples Section */}
            <AgentIOExamples form={form} />

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Agent'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AddAgent;

