
import React from 'react';
import { FileCode, Terminal, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { AgentItem } from 'declarations/aio-base-backend/aio-base-backend.did.d.ts';

interface AgentInfoCardProps {
  agent: AgentItem;
}

const AgentInfoCard = ({ agent }: AgentInfoCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Information</CardTitle>
        <CardDescription>AIO Protocol v1.2 Compatible</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-1">Author</h3>
          <p className="text-sm text-muted-foreground">{agent.author}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-1">Owner</h3>
          <p className="text-sm text-muted-foreground">{agent.owner || 'Unknown'}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-1">Version</h3>
          <p className="text-sm text-muted-foreground">{agent.version || '1.0.0'}</p>
        </div>
        
        {agent.git_repo && (
          <div>
            <h3 className="text-sm font-medium mb-1">Repository</h3>
            <a 
              href={agent.git_repo} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm text-blue-600 hover:underline"
            >
              {agent.git_repo}
            </a>
          </div>
        )}
        
        {agent.homepage.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-1">Homepage</h3>
            <a 
              href={agent.homepage[0]} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm text-blue-600 hover:underline"
            >
              {agent.homepage[0]}
            </a>
          </div>
        )}
        
        <div className="pt-2">
          <h3 className="text-sm font-medium mb-2">Actions</h3>
          <div className="flex flex-wrap gap-2">
            {agent.git_repo && (
              <Button variant="outline" size="sm" className="gap-1" asChild>
                <a href={agent.git_repo} target="_blank" rel="noopener noreferrer">
                  <FileCode size={14} />
                  View Source
                </a>
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-1">
              <Terminal size={14} />
              View Logs
            </Button>
            {agent.exec_file_url.length > 0 && (
              <Button variant="outline" size="sm" className="gap-1" asChild>
                <a href={agent.exec_file_url[0]} target="_blank" rel="noopener noreferrer">
                  <Download size={14} />
                  Download
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentInfoCard;
