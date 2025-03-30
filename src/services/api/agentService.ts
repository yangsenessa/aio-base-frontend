
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
  
  if (isUsingMockApi()) {
    return mockApi.submitAgent(agentData, imageFile, execFile);
  }
  
  // In a real implementation, we would:
  // 1. Upload the files to storage canister
  // 2. Get the file references/URLs
  // 3. Add these references to the agent data
  // 4. Submit the complete data to the agent registry canister
  
  // For now, we'll just use the mock API
  return mockApi.submitAgent(agentData, imageFile, execFile);
};
