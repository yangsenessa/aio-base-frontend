
import React, { useState, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import AgentBasicInfo from '@/components/form/AgentBasicInfo';
import AgentTechnicalInfo from '@/components/form/AgentTechnicalInfo';
import AgentIOExamples from '@/components/form/AgentIOExamples';
import AgentFileUpload from '@/components/form/AgentFileUpload';
import { AgentFormValues, agentFormSchema } from '@/types/agent';
import { submitAgent } from '@/services/apiService';

const AddAgent = () => {
  const [image, setImage] = useState<File | null>(null);
  const [execFile, setExecFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImagePath, setUploadedImagePath] = useState<string>('');
  const [uploadedExecFilePath, setUploadedExecFilePath] = useState<string>('');
  const formDataRef = useRef<AgentFormValues | null>(null);
  
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

  const handleImageUploadComplete = (filePath: string) => {
    setUploadedImagePath(filePath);
  };

  const handleExecFileUploadComplete = (filePath: string) => {
    setUploadedExecFilePath(filePath);
  };

  const submitAgentData = async (data: AgentFormValues) => {
    try {
      setIsSubmitting(true);
      console.log('Form data:', data);
      console.log('Image file:', image);
      console.log('Executable file:', execFile);
      console.log('Uploaded image path:', uploadedImagePath);
      console.log('Uploaded exec file path:', uploadedExecFilePath);
      
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
        imagePath: uploadedImagePath,
        execFilePath: uploadedExecFilePath
      };
      
      // If we have uploaded files already, pass the paths instead of the File objects
      const imageToSubmit = uploadedImagePath ? undefined : image;
      const execFileToSubmit = uploadedExecFilePath ? undefined : execFile;
      
      // Submit the agent data to the backend
      const response = await submitAgent(
        agentData, 
        imageToSubmit, 
        execFileToSubmit
      );
      
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

  const onSubmit = async (data: AgentFormValues) => {
    // Store form data for later use
    formDataRef.current = data;
    
    // Validate required files
    if (!image && !uploadedImagePath) {
      toast({
        title: "Image Required",
        description: "Please upload an image for your agent",
        variant: "destructive",
      });
      return;
    }

    if (!execFile && !uploadedExecFilePath) {
      toast({
        title: "Executable Required",
        description: "Please upload an executable file for your agent",
        variant: "destructive",
      });
      return;
    }

    // If all validations pass, submit the agent data
    await submitAgentData(data);
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
            <AgentFileUpload 
              form={form}
              image={image}
              setImage={setImage}
              execFile={execFile}
              setExecFile={setExecFile}
              onImageUploadComplete={handleImageUploadComplete}
              onExecFileUploadComplete={handleExecFileUploadComplete}
            />
            
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
