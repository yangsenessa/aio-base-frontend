
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import AgentBasicInfo from '@/components/form/AgentBasicInfo';
import AgentTechnicalInfo from '@/components/form/AgentTechnicalInfo';
import AgentIOExamples from '@/components/form/AgentIOExamples';
import AgentFileUpload from '@/components/form/AgentFileUpload';
import { AgentFormValues, agentFormSchema } from '@/types/agent';
import { submitAgent } from '@/services/apiService';
import AddAgentHeader from '@/components/form/AddAgentHeader';
import AddAgentFormContainer from '@/components/form/AddAgentFormContainer';
import FormCard from '@/components/form/FormCard';
import FormSubmitButton from '@/components/form/FormSubmitButton';
import { useFileUploads } from '@/hooks/useFileUploads';

// Add logger utility for AddAgent component
const logAgent = (area: string, message: string, data?: any) => {
  if (data) {
    console.log(`[AddAgent][${area}] ${message}`, data);
  } else {
    console.log(`[AddAgent][${area}] ${message}`);
  }
};

const AddAgent = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formDataRef = useRef<AgentFormValues | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Use our custom file upload hook
  const { 
    imageFile, 
    execFile, 
    setImage, 
    setExecFile, 
    handleImageUploadComplete, 
    handleExecFileUploadComplete,
    isUploading,
    setIsUploading
  } = useFileUploads();

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      name: '',
      description: '',
      author: '',
      gitRepo: '',
      homepage: '',
      serverEndpoint: '',
      inputParams: '',
      outputExample: '',
    },
  });

  const submitAgentData = async (data: AgentFormValues) => {
    try {
      setIsSubmitting(true);
      logAgent('SUBMIT', 'Preparing agent data', {
        formData: data,
        hasImageFile: !!imageFile.file,
        hasExecFile: !!execFile.file,
        hasUploadedImagePath: !!imageFile.uploadedPath,
        hasUploadedExecFilePath: !!execFile.uploadedPath,
        imageUrl: imageFile.downloadUrl,
        execFileUrl: execFile.downloadUrl,
      });

      // Prepare the data for submission, using URLs when available
      const agentData = {
        name: data.name,
        description: data.description,
        author: data.author,
        gitRepo: data.gitRepo,
        homepage: data.homepage,
        serverEndpoint: data.serverEndpoint,
        inputParams: data.inputParams,
        outputExample: data.outputExample,
        // Use generated URLs if available, otherwise use paths or empty string
        imagePath: imageFile.downloadUrl || imageFile.uploadedPath || '',
        execFilePath: execFile.downloadUrl || execFile.uploadedPath || '',
      };

      logAgent('SUBMIT', 'Final agent data with URLs', agentData);

      // If we have uploaded files already, pass the paths instead of the File objects
      // If no files are provided, pass undefined
      const imageToSubmit = imageFile.uploadedPath ? undefined : imageFile.file;
      const execFileToSubmit = execFile.uploadedPath ? undefined : execFile.file;

      // Submit the agent data to the backend
      const response = await submitAgent(agentData, imageToSubmit, execFileToSubmit);

      logAgent('SUBMIT', 'Submission response', response);

      if (response.success) {
        toast({
          title: 'Agent Submitted',
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
      logAgent('SUBMIT', 'Error submitting agent', error);
      toast({
        title: 'Submission Failed',
        description: error instanceof Error ? error.message : 'Failed to submit agent. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: AgentFormValues) => {
    logAgent('SUBMIT', 'Form submitted', data);

    // Store form data for later use
    formDataRef.current = data;

    // Check if we have files pending upload
    const hasImageToUpload = imageFile.file && !imageFile.uploadedPath;
    const hasExecFileToUpload = execFile.file && !execFile.uploadedPath;

    // If we have files selected but not uploaded, prompt user to upload
    if (hasImageToUpload || hasExecFileToUpload) {
      logAgent('UPLOAD', 'Files pending upload', {
        hasImageToUpload,
        hasExecFileToUpload,
      });

      toast({
        title: 'Files Need to be Uploaded',
        description: 'Please upload your selected files before submitting the agent.',
      });

      // Don't proceed with submission
      return;
    }

    // All files are either uploaded or not provided, proceed with submission
    await submitAgentData(data);
  };

  return (
    <AddAgentFormContainer>
      <AddAgentHeader title="Add My Agent" />

      <FormCard>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information Section */}
            <AgentBasicInfo form={form} />

            {/* File Upload Section */}
            <AgentFileUpload
              form={form}
              image={imageFile.file}
              setImage={setImage}
              execFile={execFile.file}
              setExecFile={setExecFile}
              onImageUploadComplete={handleImageUploadComplete}
              onExecFileUploadComplete={handleExecFileUploadComplete}
              isUploading={isUploading}
              setIsUploading={setIsUploading}
            />

            {/* Technical Information Section */}
            <AgentTechnicalInfo form={form} />

            {/* I/O Examples Section */}
            <AgentIOExamples form={form} />

            <div className="pt-4">
              <FormSubmitButton 
                isSubmitting={isSubmitting || isUploading} 
                label="Submit Agent" 
                submittingLabel="Submitting..." 
              />
            </div>
          </form>
        </Form>
      </FormCard>
    </AddAgentFormContainer>
  );
};

export default AddAgent;
