
import * as mockApi from '../mockApi';
import { isUsingMockApi } from './apiConfig';
import { getMcpItemByName, addMcpItem } from '../can/callAioBaseBackend';
import type { McpItem } from '../../declarations/aio-base-backend/aio-base-backend.did.d.ts';

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
  console.log('Server file:', serverFile);
  
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
    
    // First, check if an MCP with this name already exists
    const existingMcp = await getMcpItemByName(serverData.name);
    if (existingMcp) {
      return {
        success: false,
        message: `An MCP server with the name "${serverData.name}" already exists.`,
        timestamp: Date.now()
      };
    }
    
    // TODO: Handle file uploads to storage canister and get URLs
    // For now, we'll proceed without file references
    
    // Format data according to McpItem structure
    const mcpItem: McpItem = {
      id: BigInt(0), // This will be assigned by the canister
      name: serverData.name,
      description: serverData.description,
      author: serverData.author,
      owner: "", // Will be set by the canister based on caller principal
      git_repo: serverData.gitRepo,
      homepage: serverData.homepage ? [serverData.homepage] : [],
      remote_endpoint: serverData.remoteEndpoint ? [serverData.remoteEndpoint] : [],
      mcp_type: serverData.type,
      community_body: serverData.communityBody ? [serverData.communityBody] : [],
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
        message: 'MCP Server submitted successfully to ICP canister',
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
