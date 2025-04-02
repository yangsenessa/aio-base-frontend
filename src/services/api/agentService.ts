import * as mockApi from '../mockApi';
import { isUsingMockApi } from './apiConfig';
import { uploadExecutableFile } from '@/services/ExecFileUpload';
import { addAgentItem } from '@/services/can/agentOperations';
import type { AgentItem, Result_1 } from 'declarations/aio-base-backend/aio-base-backend.did';

// Add logger utility for agent service
const logAgentService = (area: string, message: string, data?: any) => {
  if (data) {
    console.log(`[AgentService][${area}] ${message}`, data);
  } else {
    console.log(`[AgentService][${area}] ${message}`);
  }
};

/**
 * Submit agent data to the backend
 * @param agentData Agent metadata and configuration
 * @param imageFile Optional image file for agent avatar
 * @param execFile Optional executable file for agent implementation
 * @returns Promise resolving to submission response
 */
export const submitAgent = async (
  agentData: mockApi.AgentSubmission,
  imageFile?: File | null,
  execFile?: File | null
): Promise<mockApi.SubmissionResponse> => {
  // Log submission with file information
  logAgentService('SUBMIT', 'Starting agent submission process', {
    agentData,
    hasImageFile: !!imageFile,
    hasExecFile: !!execFile
  });

  try {
    // If using mock API, delegate to mock implementation
    if (isUsingMockApi()) {
      logAgentService('SUBMIT', 'Using mock API implementation');
      return mockApi.submitAgent(agentData, imageFile, execFile);
    }

    // Real implementation follows
    logAgentService('SUBMIT', 'Using real API implementation');
    
    // Handle file uploads if needed (if paths not already provided)
    let imagePath = agentData.imagePath;
    let execFilePath = agentData.execFilePath;

    // Only upload image if not already uploaded and an image file is provided
    if (!imagePath && imageFile) {
      logAgentService('UPLOAD', 'Uploading image file', { filename: imageFile.name });
      
      const imageUploadResult = await uploadExecutableFile(imageFile, 'img');
      
      if (imageUploadResult.success) {
        imagePath = imageUploadResult.filepath || '';
        logAgentService('UPLOAD', 'Image upload successful', { filepath: imagePath });
      } else {
        logAgentService('UPLOAD', 'Image upload failed', imageUploadResult);
        return {
          success: false,
          message: `Failed to upload image: ${imageUploadResult.message}`,
          timestamp: Date.now()
        };
      }
    }

    // Only upload executable if not already uploaded and an executable file is provided
    if (!execFilePath && execFile) {
      logAgentService('UPLOAD', 'Uploading executable file', { filename: execFile.name });
      
      const execUploadResult = await uploadExecutableFile(execFile, 'agent');
      
      if (execUploadResult.success) {
        execFilePath = execUploadResult.filepath || '';
        logAgentService('UPLOAD', 'Executable upload successful', { filepath: execFilePath });
      } else {
        logAgentService('UPLOAD', 'Executable upload failed', execUploadResult);
        return {
          success: false,
          message: `Failed to upload executable: ${execUploadResult.message}`,
          timestamp: Date.now()
        };
      }
    }

    // Prepare final agent data with paths
    const finalAgentData = {
      ...agentData,
      imagePath: imagePath || '',
      execFilePath: execFilePath || ''
    };

    logAgentService('SUBMIT', 'Prepared final agent data', finalAgentData);

    // Convert to AgentItem format for canister
    const agentItem: AgentItem = {
      id: BigInt(0), // Will be assigned by canister
      name: finalAgentData.name,
      description: finalAgentData.description,
      author: finalAgentData.author,
      owner: '', // Will be set by canister
      git_repo: finalAgentData.gitRepo || '',
      exec_file: finalAgentData.execFilePath ? [finalAgentData.execFilePath] : [],
      image_file: finalAgentData.imagePath ? [finalAgentData.imagePath] : [],
      homepage: finalAgentData.homepage ? [finalAgentData.homepage] : [],
      server_endpoint: finalAgentData.serverEndpoint ? [finalAgentData.serverEndpoint] : [],
      platform: finalAgentData.platform,
      input_params: finalAgentData.inputParams ? [finalAgentData.inputParams] : [],
      output_example: finalAgentData.outputExample ? [finalAgentData.outputExample] : []
    };

    logAgentService('SUBMIT', 'Converted to AgentItem format', agentItem);

    // Call agent submission endpoint via canister
    const result = await addAgentItem(agentItem);
    logAgentService('SUBMIT', 'Canister response received', result);
    
    if ('Ok' in result) {
      const agentId = result.Ok.toString();
      logAgentService('SUBMIT', 'Agent submitted successfully', { agentId });
      
      return {
        success: true,
        id: agentId,
        message: 'Agent submitted successfully',
        timestamp: Date.now()
      };
    } else {
      // Handle error response from canister
      const errorMessage = result.Err || 'Unknown error occurred';
      logAgentService('SUBMIT', 'Canister returned error', { error: errorMessage });
      
      return {
        success: false,
        message: `Failed to submit agent: ${errorMessage}`,
        timestamp: Date.now()
      };
    }
  } catch (error) {
    logAgentService('SUBMIT', 'Exception during agent submission', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to submit agent',
      timestamp: Date.now()
    };
  }
};
