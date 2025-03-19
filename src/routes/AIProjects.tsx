
import { ExternalLink, Star, Users, GitFork } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  stars: number;
  forks: number;
  contributors: number;
  link: string;
  tags: string[];
}

const projects: Project[] = [
  {
    id: '1',
    title: 'Neural Interface',
    description: 'A revolutionary neural network interface for seamless human-machine interaction, built with TensorFlow and React.',
    stars: 3420,
    forks: 567,
    contributors: 42,
    link: '#',
    tags: ['TensorFlow', 'Neural Networks', 'UI/UX'],
  },
  {
    id: '2',
    title: 'Vision Transformer',
    description: 'Implement vision transformers for computer vision tasks with state-of-the-art performance on image recognition benchmarks.',
    stars: 2918,
    forks: 482,
    contributors: 36,
    link: '#',
    tags: ['PyTorch', 'Computer Vision', 'Transformers'],
  },
  {
    id: '3',
    title: 'Auto-ML Platform',
    description: 'Open-source platform for automated machine learning, feature engineering, and model deployment with minimal configuration.',
    stars: 5723,
    forks: 921,
    contributors: 64,
    link: '#',
    tags: ['AutoML', 'Python', 'MLOps'],
  },
  {
    id: '4',
    title: 'Federated Learning Framework',
    description: 'Privacy-preserving machine learning framework that enables training across decentralized data sources without sharing raw data.',
    stars: 1845,
    forks: 321,
    contributors: 28,
    link: '#',
    tags: ['Privacy', 'Distributed ML', 'Encryption'],
  },
  {
    id: '5',
    title: 'Reinforcement Learning Toolkit',
    description: 'Comprehensive toolkit for designing, training, and evaluating reinforcement learning agents in complex environments.',
    stars: 2156,
    forks: 387,
    contributors: 31,
    link: '#',
    tags: ['RL', 'Deep Learning', 'Simulations'],
  },
];

const AIProjects = () => {
  return (
    <div>
      <section className="space-y-4 mb-8">
        <h1 className="text-3xl font-bold">AI Projects</h1>
        <p className="text-muted-foreground max-w-3xl">
          Explore our collection of cutting-edge artificial intelligence projects, 
          from neural networks to computer vision and reinforcement learning.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <div 
            key={project.id}
            className="bg-white rounded-lg border border-border/40 overflow-hidden shadow-subtle hover:shadow-md transition-all duration-300 hover:-translate-y-1"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">{project.title}</h3>
                <a 
                  href={project.link} 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink size={18} />
                </a>
              </div>
              
              <p className="text-muted-foreground mb-6">
                {project.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {project.tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Star size={16} className="mr-1" />
                  <span>{project.stars.toLocaleString()}</span>
                </div>
                <div className="flex items-center">
                  <GitFork size={16} className="mr-1" />
                  <span>{project.forks.toLocaleString()}</span>
                </div>
                <div className="flex items-center">
                  <Users size={16} className="mr-1" />
                  <span>{project.contributors} contributors</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIProjects;
