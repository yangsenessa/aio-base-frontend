
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

const AddAgent = () => {
  const [image, setImage] = useState<File | null>(null);
  const [execFile, setExecFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      name: '',
      description: '',
      author: '',
      platform: 'both',
      gitRepo: '',
      homepage: '',
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
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    return { 
      valid: fileExt === 'exe' || fileExt === 'bin',
      message: "Please upload a valid executable file (.exe or .bin)"
    };
  };

  const onSubmit = (data: AgentFormValues) => {
    if (!image) {
      toast({
        title: "Image Required",
        description: "Please upload an image for your agent",
        variant: "destructive",
      });
      return;
    }

    console.log('Form submitted:', { ...data, image, execFile });
    
    // Here you would typically send this data to your backend
    // For now, we'll just show a success message and redirect
    
    toast({
      title: "Agent Submitted",
      description: "Your agent has been submitted successfully",
    });
    
    // Redirect back to agent store after successful submission
    setTimeout(() => {
      navigate('/agent-store');
    }, 2000);
  };

  return (
    <div className="py-8 max-w-3xl mx-auto">
      <div className="flex items-center mb-8">
        <Link to="/agent-store" className="mr-4">
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
                accept=".exe,.bin"
                buttonText="Choose Executable File"
                noFileText="No file chosen (.exe or .bin)"
                onChange={setExecFile}
                validateFile={validateExecFile}
                currentFile={execFile}
              />
            </div>
            
            {/* Technical Information Section */}
            <AgentTechnicalInfo form={form} />
            
            {/* I/O Examples Section */}
            <AgentIOExamples form={form} />

            <div className="pt-4">
              <Button type="submit" className="w-full">Submit Agent</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AddAgent;
