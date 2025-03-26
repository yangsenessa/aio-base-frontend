import * as mockApi from './mockApi';

// Flag to toggle between mock API and real ICP Canister calls
// This would be changed when deploying to production
let useMockApi = true;

// ICP Canister API functions would be implemented here
// For now, we'll just re-export the mock API functions

export const setUseMockApi = (usesMock: boolean): void => {
  useMockApi = usesMock;
  console.log(`API Service using ${useMockApi ? 'mock' : 'ICP Canister'} data`);
};

// Basic data retrieval functions
export const getProjects = (): Promise<mockApi.Project[]> => {
  if (useMockApi) {
    return mockApi.getProjects();
  }
  
  // This would be the real ICP Canister call
  // For now, return mock data
  console.log('Using ICP Canister would be implemented here');
  return mockApi.getProjects();
};

export const getProject = (id: string): Promise<mockApi.Project | undefined> => {
  if (useMockApi) {
    return mockApi.getProject(id);
  }
  
  // Real implementation would go here
  return mockApi.getProject(id);
};

export const getRepositories = () => {
  if (useMockApi) {
    return mockApi.getRepositories();
  }
  
  // Real implementation would go here
  return mockApi.getRepositories();
};

export const getRepository = (id: string) => {
  if (useMockApi) {
    return mockApi.getRepository(id);
  }
  
  // Real implementation would go here
  return mockApi.getRepository(id);
};

export const getLLMModels = () => {
  if (useMockApi) {
    return mockApi.getLLMModels();
  }
  
  // Real implementation would go here
  return mockApi.getLLMModels();
};

export const generateLLMResponse = (modelId: string, prompt: string) => {
  if (useMockApi) {
    return mockApi.generateLLMResponse(modelId, prompt);
  }
  
  // Real implementation would go here
  return mockApi.generateLLMResponse(modelId, prompt);
};

// New functions for data submission to backend canisters

// Submit Agent data
export const submitAgent = async (agentData: mockApi.AgentSubmission, imageFile?: File, execFile?: File): Promise<mockApi.SubmissionResponse> => {
  console.log('Submitting agent data to backend canister:', agentData);
  console.log('Image file:', imageFile);
  console.log('Executable file:', execFile);
  
  if (useMockApi) {
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

// Submit MCP Server data
export const submitMCPServer = async (serverData: mockApi.MCPServerSubmission, serverFile?: File): Promise<mockApi.SubmissionResponse> => {
  console.log('Submitting MCP server data to backend canister:', serverData);
  console.log('Server file:', serverFile);
  
  // Call the backend canister directly
  try {
    // In a real implementation, this would call the ICP canister functions directly
    console.log('Calling ICP canister to submit MCP server data');
    
    // For now, use the mock API for development/testing
    if (useMockApi) {
      return mockApi.submitMCPServer(serverData, serverFile);
    }
    
    // Create a timestamped ID (this would come from the canister in production)
    const id = `server-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Return a simulated successful response
    return {
      success: true,
      id,
      message: 'MCP Server submitted successfully to ICP canister',
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Error calling ICP canister:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error submitting to canister',
      timestamp: Date.now()
    };
  }
};

// Get user's assets (agents, servers, etc.)
export const getUserAssets = async (userId: string): Promise<mockApi.UserAssets> => {
  console.log('Fetching user assets for user:', userId);
  
  if (useMockApi) {
    return mockApi.getUserAssets(userId);
  }
  
  // Real implementation would query the appropriate canisters
  return mockApi.getUserAssets(userId);
};

// Get user's token balance and rewards
export const getUserTokens = async (userId: string): Promise<mockApi.UserTokens> => {
  console.log('Fetching token information for user:', userId);
  
  if (useMockApi) {
    return mockApi.getUserTokens(userId);
  }
  
  // Real implementation would query the token ledger canister
  return mockApi.getUserTokens(userId);
};

// Claim tokens to a wallet
export const claimTokens = async (userId: string, walletAddress: string, amount: number): Promise<mockApi.ClaimResponse> => {
  console.log(`Claiming ${amount} tokens for user ${userId} to wallet ${walletAddress}`);
  
  if (useMockApi) {
    return mockApi.claimTokens(userId, walletAddress, amount);
  }
  
  // Real implementation would interact with the token ledger canister
  return mockApi.claimTokens(userId, walletAddress, amount);
};

// Get dashboard statistics
export const getDashboardStats = async (): Promise<mockApi.DashboardStats> => {
  console.log('Fetching dashboard statistics');
  
  if (useMockApi) {
    return mockApi.getDashboardStats();
  }
  
  // Real implementation would aggregate data from multiple canisters
  return mockApi.getDashboardStats();
};
