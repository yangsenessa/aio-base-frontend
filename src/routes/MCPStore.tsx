
import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Server } from 'lucide-react';

interface MCPServerItem {
  id: string;
  title: string;
  description: string;
  isNew: boolean;
  githubLink: string;
}

const mcpServers: MCPServerItem[] = [
  {
    id: 'npm-search',
    title: 'NPM Search',
    description: 'Search for npm packages',
    isNew: true,
    githubLink: '#'
  },
  {
    id: 'cloudflare',
    title: 'Cloudflare',
    description: 'Interacting with Cloudflare services',
    isNew: true,
    githubLink: '#'
  },
  {
    id: 'openai',
    title: 'OpenAI',
    description: 'Query OpenAI models directly from Claude using MCP protocol',
    isNew: true,
    githubLink: '#'
  },
  {
    id: 'apple-notes',
    title: 'Apple Notes',
    description: 'Talk with your Apple Notes',
    isNew: true,
    githubLink: '#'
  },
  {
    id: 'everything-search',
    title: 'Everything Search',
    description: 'Fast Windows file search using Everything SDK',
    isNew: true,
    githubLink: '#'
  },
  {
    id: 'mysql',
    title: 'MySQL',
    description: 'MySQL database integration with configurable access controls and schema inspection',
    isNew: true,
    githubLink: '#'
  },
  {
    id: 'apple-shortcuts',
    title: 'Apple Shortcuts',
    description: 'An MCP Server Integration with Apple Shortcuts',
    isNew: false,
    githubLink: '#'
  },
  {
    id: 'data-exploration',
    title: 'Data Exploration',
    description: 'MCP server for autonomous data exploration on .csv-based datasets, providing intelligent insights with minimal effort.',
    isNew: false,
    githubLink: '#'
  },
  {
    id: 'search1api',
    title: 'Search1API',
    description: 'Search and crawl in one API',
    isNew: false,
    githubLink: '#'
  }
];

const MCPStore = () => {
  return (
    <div className="pt-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">MCP Store</h1>
        <div className="text-primary/80">MCP Servers</div>
      </div>

      <div className="my-12">
        <h2 className="text-3xl font-bold text-center mb-4">MCP Servers</h2>
        <p className="text-lg text-center text-muted-foreground mb-14">
          Explore our collection of powerful server resources for enhanced functionality
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mcpServers.map((server) => (
            <div 
              key={server.id} 
              className="rounded-lg bg-card/50 border border-border/20 p-6 hover:border-primary/30 transition-all duration-300"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold">{server.title}</h3>
                  {server.isNew && (
                    <Badge className="bg-emerald-500 hover:bg-emerald-600">New</Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{server.description}</p>
                <div className="pt-4">
                  <Link 
                    to={server.githubLink} 
                    className="text-primary hover:text-primary/80 flex items-center gap-2 text-sm transition-colors"
                  >
                    View on GitHub <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MCPStore;
