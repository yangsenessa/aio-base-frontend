
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { submitAgent } from '@/services/apiService';
import { AgentFormValues } from '@/types/agent';
import { UploadedFile } from '@/hooks/useFileUploads';

// Add logger utility for agent submission
const logSubmission = (area: string, message: string, data?: any) => {
  if (data) {
    console.log(`[AgentSubmission][${area}] ${message}`, data);
  } else {
    console.log(`[AgentSubmission][${area}] ${message}`);
  }
};

interface UseAgentSubmissionProps {
  imageFile: UploadedFile;
  execFile: UploadedFile;
  setIsUploading: (value: boolean) => void;
}

export function useAgentSubmission({ imageFile, execFile, setIsUploading }: UseAgentSubmissionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formDataRef = useRef<AgentFormValues | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const submitAgentData = async (data: AgentFormValues) => {
    try {
      setIsSubmitting(true);
      logSubmission('SUBMIT', 'Preparing agent data', {
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

      logSubmission('SUBMIT', 'Final agent data with URLs', agentData);

      // If we have uploaded files already, pass the paths instead of the File objects
      // If no files are provided, pass undefined
      const imageToSubmit = imageFile.uploadedPath ? undefined : imageFile.file;
      const execFileToSubmit = execFile.uploadedPath ? undefined : execFile.file;

      // Submit the agent data to the backend
      const response = await submitAgent(agentData, imageToSubmit, execFileToSubmit);

      logSubmission('SUBMIT', 'Submission response', response);

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
      logSubmission('SUBMIT', 'Error submitting agent', error);
      toast({
        title: 'Submission Failed',
        description: error instanceof Error ? error.message : 'Failed to submit agent. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (data: AgentFormValues) => {
    logSubmission('SUBMIT', 'Form submitted', data);

    // Store form data for later use
    formDataRef.current = data;

    // Check if we have files pending upload
    const hasImageToUpload = imageFile.file && !imageFile.uploadedPath;
    const hasExecFileToUpload = execFile.file && !execFile.uploadedPath;

    // If we have files selected but not uploaded, prompt user to upload
    if (hasImageToUpload || hasExecFileToUpload) {
      logSubmission('UPLOAD', 'Files pending upload', {
        hasImageToUpload,
        hasExecFileToUpload,
      });

      setIsUploading(true);
      toast({
        title: 'Files Need to be Uploaded',
        description: 'Please upload your selected files before submitting the agent.',
      });

      // Don't proceed with submission
      return false;
    }

    // All files are either uploaded or not provided, proceed with submission
    await submitAgentData(data);
    return true;
  };

  return {
    isSubmitting,
    handleSubmit
  };
}
