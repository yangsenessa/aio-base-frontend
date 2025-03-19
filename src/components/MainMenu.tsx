
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Network, Code, Lightbulb, Zap, Server, LayoutDashboard } from 'lucide-react';
import ContactUs from '@/components/ContactUs';

interface ProjectCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  path: string;
}

const categories: ProjectCategory[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    id: 'protocol',
    title: 'Protocol',
    icon: Network,
    path: '/ai-projects',
  },
  {
    id: 'open-source',
    title: 'Open Source',
    icon: Code,
    path: '/open-source',
  },
  {
    id: 'llm',
    title: 'Best practices',
    icon: Lightbulb,
    path: '/best-practices',
  },
  {
    id: 'tools',
    title: 'Agent Store',
    icon: Zap,
    path: '/agent-store',
  },
  {
    id: 'mcp-store',
    title: 'MCP Store',
    icon: Server,
    path: '/mcp-store',
  },
];

const MainMenu = () => {
  const location = useLocation();
  const [hoverCard, setHoverCard] = useState<string | null>(null);
  
  // Handle redirects from old paths
  const currentPath = location.pathname === '/frameworks' ? '/mcp-store' : location.pathname;

  return (
    <aside className="border-r border-border/20 bg-sidebar h-full overflow-y-auto pt-16 pb-16">
      <div className="p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-6">
          Entry
        </h2>
        
        <div className="space-y-4">
          {categories.map((category) => {
            const isActive = currentPath === category.path;
            const isHovered = hoverCard === category.id;
            
            return (
              <Link
                key={category.id}
                to={category.path}
                className={`
                  block rounded-lg border transition-all ease-in-out duration-300 
                  ${isActive 
                    ? 'border-primary/30 bg-primary/10 web3-glow' 
                    : 'border-transparent bg-card/50 hover:bg-card/70 card-hover'
                  }
                `}
                onMouseEnter={() => setHoverCard(category.id)}
                onMouseLeave={() => setHoverCard(null)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className={`
                        mr-3 rounded-full p-2 
                        ${isActive ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}
                      `}>
                        <category.icon size={18} />
                      </div>
                      <div>
                        <h3 className={`font-medium ${isActive ? 'text-primary' : 'text-foreground/90'}`}>
                          {category.title}
                        </h3>
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
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      
      <div className="px-4 mt-4">
        <ContactUs />
      </div>
    </aside>
  );
};

export default MainMenu;
