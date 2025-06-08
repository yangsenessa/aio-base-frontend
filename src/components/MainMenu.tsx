import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, FileText, Code, Lightbulb, Zap, Server, LayoutDashboard, Flag, Download } from 'lucide-react';
import ContactUs from '@/components/ContactUs';
import FileDownload from '@/components/FileDownload';
import { toast } from '@/components/ui/use-toast';

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
    path: '/home/dashboard',
  },
  {
    id: 'protocol',
    title: 'Write Paper',
    icon: FileText,
    path: '/home/ai-projects',
  },
  {
    id: 'open-source',
    title: 'Open Source',
    icon: Code,
    path: '/home/open-source',
  },
  {
    id: 'llm',
    title: 'Best practices',
    icon: Lightbulb,
    path: '/home/best-practices',
  },
  {
    id: 'tools',
    title: 'Agent Mnemonic',
    icon: Zap,
    path: '/home/agent-store',
  },
  {
    id: 'mcp-store',
    title: 'MCP Mnemonic',
    icon: Server,
    path: '/home/mcp-store',
  },
  {
    id: 'flag-agent',
    title: 'Flag Agent',
    icon: Flag,
    path: '/home/flag-agent',
  },
];

const MainMenu = () => {
  const location = useLocation();
  const [hoverCard, setHoverCard] = useState<string | null>(null);
  
  return (
    <aside className="border-r border-border/20 bg-sidebar h-full overflow-y-auto pt-16 pb-16 w-12 max-w-12 min-w-12">
      <div className="p-1 w-full max-w-12">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 hidden">
          Entry
        </h2>
        
        <div className="space-y-1 w-full max-w-12">
          {categories.map((category) => {
            const isActive = location.pathname === category.path;
            const isHovered = hoverCard === category.id;
            
            return (
              <Link
                key={category.id}
                to={category.path}
                className={`
                  block rounded-lg border transition-all ease-in-out duration-300 w-full max-w-10
                  ${isActive 
                    ? 'border-primary/30 bg-primary/10 web3-glow' 
                    : 'border-transparent bg-card/50 hover:bg-card/70 card-hover'
                  }
                `}
                onMouseEnter={() => setHoverCard(category.id)}
                onMouseLeave={() => setHoverCard(null)}
                title={category.title}
              >
                <div className="p-1 flex items-center justify-center w-full max-w-10">
                  <div className={`
                    rounded-full p-1 w-8 h-8 flex items-center justify-center
                    ${isActive ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}
                  `}>
                    <category.icon size={16} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      
      <div className="px-1 mt-4 w-full max-w-12">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 hidden">
          Resources
        </h2>
        <div className="mb-2 w-full max-w-10">
          <FileDownload
            filepath="/whitepaper/AIO-MCP-v1.2.1.pdf"
            filename="AIO-MCP-Protocol-v1.2.1.pdf"
            className="inline-flex items-center justify-center w-8 h-8 text-sm font-medium transition-colors rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            onDownloadComplete={(response) => {
              if (response.success) {
                toast({
                  title: "Download Successful",
                  description: `"${response.filename}" has been downloaded successfully.`,
                });
              }
            }}
            onDownloadError={(error) => {
              toast({
                title: "Download Failed",
                description: error.message || "Failed to download whitepaper.",
                variant: "destructive",
              });
            }}
          >
            <Download className="h-4 w-4" />
          </FileDownload>
        </div>
      </div>
      
      <div className="px-1 mt-2 w-full max-w-12">
        <div className="w-full max-w-10">
          <ContactUs />
        </div>
      </div>
    </aside>
  );
};

export default MainMenu;
