
import React, { useState, useRef, useEffect } from 'react';
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

// Add logger utility for AddAgent component
const logAgent = (area: string, message: string, data?: any) => {
  if (data) {
    console.log(`[AddAgent][${area}] ${message}`, data);
  } else {
    console.log(`[AddAgent][${area}] ${message}`);
  }
};

const AddAgent = () => {
  const [image, setImage] = useState<File | null>(null);
  const [execFile, setExecFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImagePath, setUploadedImagePath] = useState<string>('');
  const [uploadedExecFilePath, setUploadedExecFilePath] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [execFileUrl, setExecFileUrl] = useState<string>('');
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [showExecFileUploader, setShowExecFileUploader] = useState(false);
  const formDataRef = useRef<AgentFormValues | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

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

  // Generate proper download URLs whenever file paths change
  useEffect(() => {
    const generateUrls = async () => {
      // Generate image URL
      if (uploadedImagePath) {
        logAgent('URL_GEN', 'Generating image download URL', { path: uploadedImagePath });

        try {
          // For images, we need the special type=img format
          const pathParts = uploadedImagePath.split('/');
          const filename = pathParts[pathParts.length - 1] || 'unknown';
          const baseUrl = import.meta.env.VITE_DOWNLOAD_BASE_URL || 'http://localhost:8001';

          // Create URL with the special format required - using 'img' as type
          const imgUrl = `${baseUrl}?type=img&filename=${encodeURIComponent(filename)}`;

          logAgent('URL_GEN', 'Generated image download URL', { imgUrl });
          setImageUrl(imgUrl);
        } catch (error) {
          logAgent('URL_GEN', 'Error generating image URL', error);
          // Leave empty if generation fails
          setImageUrl('');
        }
      }

      // Generate executable URL
      if (uploadedExecFilePath) {
        logAgent('URL_GEN', 'Generating executable download URL', { path: uploadedExecFilePath });

        try {
          // Extract type and filename from path
          const pathParts = uploadedExecFilePath.split('/');
          let fileType = 'agent';

          // Ensure we use the right file type
          if (uploadedExecFilePath.includes('/agent/')) {
            fileType = 'agent';
          }

          const filename = pathParts[pathParts.length - 1] || 'unknown';
          const baseUrl = import.meta.env.VITE_DOWNLOAD_BASE_URL || 'http://localhost:8001';

          // Create URL with the correct format
          const exeUrl = `${baseUrl}?type=${fileType}&filename=${encodeURIComponent(filename)}`;

          logAgent('URL_GEN', 'Generated executable download URL', { exeUrl });
          setExecFileUrl(exeUrl);
        } catch (error) {
          logAgent('URL_GEN', 'Error generating executable URL', error);
          // Leave empty if generation fails
          setExecFileUrl('');
        }
      }
    };

    generateUrls();
  }, [uploadedImagePath, uploadedExecFilePath]);

  const handleImageUploadComplete = (filePath: string) => {
    logAgent('UPLOAD', 'Image upload completed', { filePath });
    setUploadedImagePath(filePath);
  };

  const handleExecFileUploadComplete = (filePath: string) => {
    logAgent('UPLOAD', 'Executable upload completed', { filePath });
    setUploadedExecFilePath(filePath);
  };

  const submitAgentData = async (data: AgentFormValues) => {
    try {
      setIsSubmitting(true);
      logAgent('SUBMIT', 'Preparing agent data', {
        formData: data,
        hasImageFile: !!image,
        hasExecFile: !!execFile,
        hasUploadedImagePath: !!uploadedImagePath,
        hasUploadedExecFilePath: !!uploadedExecFilePath,
        imageUrl,
        execFileUrl,
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
        imagePath: imageUrl || uploadedImagePath || '',
        execFilePath: execFileUrl || uploadedExecFilePath || '',
      };

      logAgent('SUBMIT', 'Final agent data with URLs', agentData);

      // If we have uploaded files already, pass the paths instead of the File objects
      // If no files are provided, pass undefined
      const imageToSubmit = uploadedImagePath ? undefined : image;
      const execFileToSubmit = uploadedExecFilePath ? undefined : execFile;

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
    const hasImageToUpload = image && !uploadedImagePath;
    const hasExecFileToUpload = execFile && !uploadedExecFilePath;

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

      // Trigger the file uploader components to show their upload dialogs
      if (hasImageToUpload) {
        setShowImageUploader(true);
      }

      if (hasExecFileToUpload) {
        setShowExecFileUploader(true);
      }

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
              <FormSubmitButton 
                isSubmitting={isSubmitting} 
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
