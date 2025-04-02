
import * as mockApi from '../mockApi';
import { isUsingMockApi } from './apiConfig';
import { getMcpItemByName, addMcpItem } from '../can';
import type { McpItem } from 'declarations/aio-base-backend/aio-base-backend.did';
import { formatJsonForCanister } from '@/util/formatters';
import { uploadExecutableFile } from '@/services/ExecFileUpload';

/**
 * Submit MCP server data to the backend
 * @param serverData MCP server metadata and configuration
 * @param serverFile Optional executable file for MCP server implementation
 * @returns Promise resolving to submission response
 */
export const submitMCPServer = async (
  serverData: mockApi.MCPServerSubmission, 
  serverFile?: File
): Promise<mockApi.SubmissionResponse> => {
  console.log('Submitting MCP server data to backend canister:', serverData);
  console.log('Server file:', serverFile ? serverFile.name : 'No file provided');
  
  // Prepare AIO-MCP protocol compliant data
  const protocolData = {
    ...serverData,
    // Add protocol-specific fields for registration
    protocol: "aio-mcp",
    version: "1.2.1"
  };
  
  console.log('Protocol-compliant data:', protocolData);
  
  try {
    if (isUsingMockApi()) {
      return mockApi.submitMCPServer(protocolData, serverFile);
    }
    
    // Real implementation - call ICP canister directly
    console.log('Calling ICP canister to submit MCP server data');
    
    //First, check if an MCP with this name already exists
    const existingMcp = await getMcpItemByName(serverData.name);
    if (existingMcp) {
      return {
        success: false,
        message: `An MCP server with the name "${serverData.name}" already exists.`,
        timestamp: Date.now()
      };
    }
    
    // Variables to store uploaded file info
    let execFilePath = '';
    let execFileDownloadUrl = '';
    
    // Upload serverFile if provided
    if (serverFile) {
      console.log('Uploading MCP server executable file:', serverFile.name);
      
      // Generate a custom filename based on the server name
      const customFilename = serverData.name 
        ? `${serverData.name}.js` 
        : serverFile.name;
      
      const uploadResult = await uploadExecutableFile(serverFile, 'mcp', customFilename);
      
      if (uploadResult.success) {
        execFilePath = uploadResult.filepath || '';
        execFileDownloadUrl = uploadResult.downloadUrl || '';
        console.log('MCP server executable upload successful', { 
          filepath: execFilePath,
          downloadUrl: execFileDownloadUrl
        });
      } else {
        console.error('MCP server executable upload failed', uploadResult);
        return {
          success: false,
          message: `Failed to upload executable: ${uploadResult.message}`,
          timestamp: Date.now()
        };
      }
    }
    
    // Format data according to McpItem structure, with special handling for JSON data
    const mcpItem: McpItem = {
      id: BigInt(0), // This will be assigned by the canister
      name: serverData.name,
      description: serverData.description,
      author: serverData.author,
      owner: "", // Will be set by the canister based on caller principal
      git_repo: serverData.gitRepo,
      // Use the exec_file field for the filename
      exec_file: serverFile ? [serverFile.name] : [],
      homepage: serverData.homepage ? [serverData.homepage] : [],
      // Use the download URL for the remote_endpoint if we have it, otherwise use the provided endpoint
      remote_endpoint: execFileDownloadUrl ? 
        [execFileDownloadUrl] : 
        (serverData.remoteEndpoint ? [serverData.remoteEndpoint] : []),
      mcp_type: serverData.type,
      community_body: serverData.communityBody ? 
        [formatJsonForCanister(serverData.communityBody)] : [],
      resources: serverData.resources,
      prompts: serverData.prompts,
      tools: serverData.tools,
      sampling: serverData.sampling
    };
    
    console.log('Formatted MCP item for canister:', mcpItem);
    
    // Call backend canister to add the MCP item
    const result = await addMcpItem(mcpItem);
    
    if ('Ok' in result) {
      return {
        success: true,
        id: result.Ok.toString(),
        message: serverFile 
          ? 'MCP Server with executable submitted successfully' 
          : 'MCP Server data submitted successfully (no executable)',
        timestamp: Date.now()
      };
    } else {
      throw new Error(result.Err);
    }
  } catch (error) {
    console.error('Error calling ICP canister:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error submitting to canister',
      timestamp: Date.now()
    };
  }
};

// Helper function to read file as text (no longer needed as we're using the uploadExecutableFile service)
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};
