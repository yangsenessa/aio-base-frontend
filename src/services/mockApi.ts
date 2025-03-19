
// Mock data
export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
}

interface Repository {
  id: string;
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
}

interface LLMModel {
  id: string;
  name: string;
  version: string;
  capabilities: string[];
}

const MOCK_DELAY = 800; // ms

// Mock project data
const projects: Project[] = [
  {
    id: '1',
    title: 'Neural Interface',
    category: 'AI Projects',
    description: 'A revolutionary neural network interface for seamless human-machine interaction.',
  },
  {
    id: '2',
    title: 'Quantum OS',
    category: 'Open Source',
    description: 'Open-source distributed operating system with quantum computing capabilities.',
  },
  {
    id: '3',
    title: 'PaLM Assistant',
    category: 'LLM Demos',
    description: 'Conversational AI assistant powered by Google\'s PaLM architecture.',
  },
  // Add more projects as needed
];

// Mock repository data
const repositories: Repository[] = [
  {
    id: '1',
    name: 'aio-neural-interface',
    description: 'Neural network interface for seamless human-machine interaction.',
    stars: 325,
    forks: 87,
    language: 'Python',
  },
  {
    id: '2',
    name: 'quantum-os',
    description: 'Distributed operating system with quantum computing capabilities.',
    stars: 1243,
    forks: 352,
    language: 'Rust',
  },
  // Add more repositories as needed
];

// Mock LLM models
const llmModels: LLMModel[] = [
  {
    id: 'palm',
    name: 'PaLM',
    version: '2.0',
    capabilities: ['Text generation', 'Code generation', 'Translation'],
  },
  {
    id: 'llama',
    name: 'Llama',
    version: '2.0',
    capabilities: ['Text generation', 'Few-shot learning', 'Reasoning'],
  },
  {
    id: 'claude',
    name: 'Claude',
    version: '2.0',
    capabilities: ['Text generation', 'Summarization', 'Question answering'],
  },
  // Add more models as needed
];

// Helper to simulate async API calls
const simulateApiCall = <T>(data: T): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(data);
    }, MOCK_DELAY);
  });
};

// API functions
export const getProjects = (): Promise<Project[]> => {
  return simulateApiCall(projects);
};

export const getProject = (id: string): Promise<Project | undefined> => {
  const project = projects.find(p => p.id === id);
  return simulateApiCall(project);
};

export const getRepositories = (): Promise<Repository[]> => {
  return simulateApiCall(repositories);
};

export const getRepository = (id: string): Promise<Repository | undefined> => {
  const repository = repositories.find(r => r.id === id);
  return simulateApiCall(repository);
};

export const getLLMModels = (): Promise<LLMModel[]> => {
  return simulateApiCall(llmModels);
};

export const generateLLMResponse = (modelId: string, prompt: string): Promise<string> => {
  // Simulate different model responses
  const responses: Record<string, string> = {
    'palm': `Here's a response from PaLM about "${prompt}"`,
    'llama': `Here's what Llama thinks about "${prompt}"`,
    'claude': `Claude has analyzed "${prompt}" and here's the response`,
  };
  
  const response = responses[modelId] || `No response generated for model: ${modelId}`;
  return simulateApiCall(response);
};
