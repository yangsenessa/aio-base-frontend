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
    <aside className="border-r border-border/20 bg-sidebar h-full overflow-y-auto pt-16 pb-16 w-[20%] fixed left-0 top-0 z-10">
      <div className="p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          Navigation
        </h2>
        
        <div className="space-y-2">
          {categories.map((category) => {
            const isActive = location.pathname === category.path;
            const isHovered = hoverCard === category.id;
            
            return (
              <Link
                key={category.id}
                to={category.path}
                className={`
                  flex items-center gap-3 rounded-lg border transition-all ease-in-out duration-300 p-3
                  ${isActive 
                    ? 'border-primary/30 bg-primary/10 web3-glow text-primary' 
                    : 'border-transparent bg-card/50 hover:bg-card/70 card-hover text-muted-foreground hover:text-foreground'
                  }
                `}
                onMouseEnter={() => setHoverCard(category.id)}
                onMouseLeave={() => setHoverCard(null)}
              >
                <div className={`
                  rounded-full p-2 flex items-center justify-center flex-shrink-0
                  ${isActive ? 'bg-primary/20 text-primary' : 'bg-secondary/60'}
                `}>
                  <category.icon size={18} />
                </div>
                <span className="font-medium text-sm">{category.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
      
      <div className="px-4 mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          Resources
        </h2>
        <div className="mb-4">
          <FileDownload
            filepath="/whitepaper/AIO-MCP-v1.2.1.pdf"
            filename="AIO-MCP-Protocol-v1.2.1.pdf"
            className="flex items-center gap-3 p-3 text-sm font-medium transition-colors rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground"
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
            <div className="rounded-full p-2 bg-secondary/60 flex items-center justify-center flex-shrink-0">
              <Download className="h-4 w-4" />
            </div>
            <span className="text-sm">Download Whitepaper</span>
          </FileDownload>
        </div>
      </div>
      
      <div className="px-4 mt-4">
        <div>
          <ContactUs />
        </div>
      </div>
    </aside>
  );
};

export default MainMenu;
