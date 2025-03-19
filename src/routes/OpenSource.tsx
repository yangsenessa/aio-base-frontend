
import { useEffect, useState } from 'react';
import { ExternalLink, GitBranch, Clock } from 'lucide-react';

interface RepoType {
  id: string;
  title: string;
  description: string;
  language: string;
  lastUpdated: string;
  branches: number;
  contributors: string[];
  link: string;
}

const repos: RepoType[] = [
  {
    id: '1',
    title: 'Quantum OS',
    description: 'Open-source distributed operating system with quantum computing capabilities, built for resilience and performance.',
    language: 'Rust',
    lastUpdated: '2023-11-15',
    branches: 27,
    contributors: ['user1', 'user2', 'user3', 'user4', 'user5'],
    link: '#',
  },
  {
    id: '2',
    title: 'DistributedDB',
    description: 'High-performance distributed database with strong consistency guarantees and fault tolerance built-in.',
    language: 'Go',
    lastUpdated: '2023-12-04',
    branches: 18,
    contributors: ['user3', 'user6', 'user7'],
    link: '#',
  },
  {
    id: '3',
    title: 'MeshNetwork',
    description: 'Self-organizing mesh network protocol for IoT devices with minimal configuration and maximum reliability.',
    language: 'C++',
    lastUpdated: '2024-01-12',
    branches: 15,
    contributors: ['user2', 'user4', 'user8', 'user9'],
    link: '#',
  },
  {
    id: '4',
    title: 'CloudNative Toolkit',
    description: 'A comprehensive toolkit for cloud-native application development, deployment, and monitoring.',
    language: 'TypeScript',
    lastUpdated: '2024-02-01',
    branches: 23,
    contributors: ['user1', 'user10', 'user11', 'user12'],
    link: '#',
  },
];

const languageColors: Record<string, string> = {
  'Rust': 'bg-orange-500',
  'Go': 'bg-blue-500',
  'C++': 'bg-pink-500',
  'TypeScript': 'bg-blue-400',
  'Python': 'bg-green-500',
  'JavaScript': 'bg-yellow-400',
};

const OpenSource = () => {
  const [activeRepo, setActiveRepo] = useState<RepoType | null>(null);

  useEffect(() => {
    // Set first repo as active by default
    if (repos.length > 0 && !activeRepo) {
      setActiveRepo(repos[0]);
    }
  }, [activeRepo]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <h1 className="text-3xl font-bold mb-6">Open Source</h1>
        
        <div className="space-y-4">
          {repos.map((repo) => (
            <div
              key={repo.id}
              className={`
                p-4 rounded-lg border cursor-pointer transition-all duration-300
                ${activeRepo?.id === repo.id 
                  ? 'border-primary/20 bg-primary/5 shadow-sm' 
                  : 'border-border/40 bg-white/80 hover:bg-white hover:shadow-subtle'
                }
              `}
              onClick={() => setActiveRepo(repo)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{repo.title}</h3>
                <div className="flex items-center space-x-1">
                  <span className={`w-3 h-3 rounded-full ${languageColors[repo.language] || 'bg-gray-400'}`}></span>
                  <span className="text-xs text-muted-foreground">{repo.language}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {repo.description}
              </p>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock size={14} className="mr-1" />
                <span>Updated {new Date(repo.lastUpdated).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="lg:col-span-2">
        {activeRepo ? (
          <div className="bg-white rounded-lg border border-border/40 p-6 animate-fade-in">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">{activeRepo.title}</h2>
                <div className="flex items-center space-x-1">
                  <span className={`w-3 h-3 rounded-full ${languageColors[activeRepo.language] || 'bg-gray-400'}`}></span>
                  <span className="text-sm text-muted-foreground">{activeRepo.language}</span>
                </div>
              </div>
              <a 
                href={activeRepo.link} 
                className="text-primary hover:text-primary/80 flex items-center space-x-1 transition-colors"
              >
                <span>View on GitHub</span>
                <ExternalLink size={16} />
              </a>
            </div>
            
            <p className="text-muted-foreground mb-6">
              {activeRepo.description}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="text-sm font-medium mb-2">Repository Details</div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <GitBranch size={16} className="mr-2 text-muted-foreground" />
                    <span><strong>{activeRepo.branches}</strong> branches</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={16} className="mr-2 text-muted-foreground" />
                    <span>Last updated: <strong>{new Date(activeRepo.lastUpdated).toLocaleDateString()}</strong></span>
                  </div>
                </div>
              </div>
              
              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="text-sm font-medium mb-2">Top Contributors</div>
                <div className="flex flex-wrap gap-2">
                  {activeRepo.contributors.map((user, index) => (
                    <div 
                      key={index}
                      className="flex items-center space-x-1 bg-white/80 rounded-full px-2 py-1 text-xs"
                    >
                      <div className="w-4 h-4 rounded-full bg-primary/20"></div>
                      <span>{user}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="border-t border-border/40 pt-6">
              <h3 className="font-medium mb-4">Getting Started</h3>
              <div className="bg-secondary rounded-md p-3 font-mono text-sm mb-4 overflow-x-auto">
                <code>git clone https://github.com/aio-center/{activeRepo.title.toLowerCase().replace(/\s+/g, '-')}.git</code>
              </div>
              <p className="text-sm text-muted-foreground">
                Check the README.md file in the repository for detailed installation and contribution guidelines.
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Select a repository to view details
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenSource;
