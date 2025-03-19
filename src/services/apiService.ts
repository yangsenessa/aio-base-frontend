
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
