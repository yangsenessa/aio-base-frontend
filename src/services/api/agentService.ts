
import * as mockApi from '../mockApi';
import { isUsingMockApi } from './apiConfig';

/**
 * Submit agent data to the backend
 * @param agentData Agent metadata and configuration
 * @param imageFile Optional image file for agent avatar
 * @param execFile Optional executable file for agent implementation
 * @returns Promise resolving to submission response
 */
export const submitAgent = async (
  agentData: mockApi.AgentSubmission, 
  imageFile?: File, 
  execFile?: File
): Promise<mockApi.SubmissionResponse> => {
  console.log('Submitting agent data to backend canister:', agentData);
  console.log('Image file:', imageFile);
  console.log('Executable file:', execFile);
  console.log('Image path (if pre-uploaded):', agentData.imagePath);
  console.log('Exec file path (if pre-uploaded):', agentData.execFilePath);
  
  if (isUsingMockApi()) {
    return mockApi.submitAgent(agentData, imageFile, execFile);
  }
  
  // In a real implementation, we would:
  // 1. Check if files are already uploaded (paths provided)
  // 2. If not uploaded yet, upload the files to storage canister
  // 3. Get the file references/URLs
  // 4. Add these references to the agent data
  // 5. Submit the complete data to the agent registry canister
  
  // For now, we'll just use the mock API
  return mockApi.submitAgent(agentData, imageFile, execFile);
};
