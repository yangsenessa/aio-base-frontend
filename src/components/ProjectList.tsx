import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Network, Code, Lightbulb, Zap, Layers } from 'lucide-react';

interface ProjectCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
}

const categories: ProjectCategory[] = [
  {
    id: 'protocol',
    title: 'Protocol',
    description: 'Agent integration',
    icon: Network,
    path: '/ai-projects',
  },
  {
    id: 'open-source',
    title: 'Open Source',
    description: 'Community-driven collaborative development',
    icon: Code,
    path: '/open-source',
  },
  {
    id: 'llm',
    title: 'LLM Demos',
    description: 'Language model demonstrations and experiments',
    icon: Lightbulb,
    path: '/llm-demos',
  },
  {
    id: 'tools',
    title: 'Developer Tools',
    description: 'Essential utilities for modern development',
    icon: Zap,
    path: '/tools',
  },
  {
    id: 'frameworks',
    title: 'Frameworks',
    description: 'Building blocks for robust applications',
    icon: Layers,
    path: '/frameworks',
  },
];

const ProjectList = () => {
  const location = useLocation();
  const [hoverCard, setHoverCard] = useState<string | null>(null);

  return (
    <aside className="border-r border-border/40 bg-secondary/30 h-full overflow-y-auto pb-16">
      <div className="p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-6">
          Project Categories
        </h2>
        
        <div className="space-y-4">
          {categories.map((category) => {
            const isActive = location.pathname === category.path;
            const isHovered = hoverCard === category.id;
            
            return (
              <Link
                key={category.id}
                to={category.path}
                className={`
                  block rounded-lg border p-4 transition-all ease-in-out duration-300 
                  ${isActive 
                    ? 'border-primary/20 bg-primary/5 shadow-sm' 
                    : 'border-transparent bg-white/50 hover:bg-white/80 card-hover'
                  }
                `}
                onMouseEnter={() => setHoverCard(category.id)}
                onMouseLeave={() => setHoverCard(null)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className={`
                      mr-3 rounded-full p-2 
                      ${isActive ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}
                    `}>
                      <category.icon size={18} />
                    </div>
                    <div>
                      <h3 className={`font-medium ${isActive ? 'text-foreground' : 'text-foreground/90'}`}>
                        {category.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight 
                    size={16} 
                    className={`
                      mt-1 transition-all duration-300 
                      ${isActive || isHovered ? 'translate-x-0 opacity-100 text-primary' : '-translate-x-2 opacity-0'}
                    `}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default ProjectList;
