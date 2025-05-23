import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Server, PlusCircle, BookOpen, FileCode, ExternalLink, Github, Loader2, ChevronLeft, ChevronRight, User, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMcpItemsPaginated } from '@/services/can/mcpOperations';
import { useToast } from '@/components/ui/use-toast';
import type { McpItem } from 'declarations/aio-base-backend/aio-base-backend.did.d.ts';
import { usePlugConnect } from '@/lib/plug-wallet';
import { deleteMcpItem } from '@/services/can/mcpOperations';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface MCPServerItem {
  id: string;
  title: string;
  author: string;
  description: string;
  owner: string;
  isNew: boolean;
  githubLink: string;
}

const truncateToWords = (text: string, wordCount: number): string => {
  if (!text || typeof text !== 'string') return '';
  
  // 检查文本是否包含中文字符
  const containsChinese = /[\u4e00-\u9fa5]/.test(text);
  
  if (containsChinese) {
    // For Chinese text, truncate by character
    if (text.length <= wordCount * 2) return text;
    return text.substring(0, wordCount * 2) + '...';
  } else {
    // For English text, truncate by word
    const words = text.trim().split(/\s+/);
    
    if (words.length <= wordCount) return text;
    
    return words.slice(0, wordCount).join(' ') + '...';
  }
};

const MCPStore = () => {
  const [mcpServers, setMcpServers] = useState<MCPServerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { principalId } = usePlugConnect();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchMcpServers = async () => {
      try {
        setLoading(true);
        const offset = (currentPage - 1) * itemsPerPage;
        const result = await getMcpItemsPaginated(BigInt(offset), BigInt(itemsPerPage));
        setHasMore(result.length >= itemsPerPage);
        const mappedServers = result.map((item: McpItem) => ({
          id: item.id.toString(),
          title: item.name.toString(),
          author: item.author.toString(),
          owner: item.owner.toString(),
          description: item.description.toString(),
          isNew: true,
          githubLink: item.git_repo ? item.git_repo.toString() : '#'
        }));
        setMcpServers(mappedServers);
      } catch (err) {
        console.error('Error fetching MCP servers:', err);
        setError('Failed to load MCP servers. Please try again later.');
        toast({
          title: "Error",
          description: "Failed to load MCP servers from the backend",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMcpServers();
  }, [currentPage, itemsPerPage, toast]);

  const handleDeleteMcpItem = async (title: string) => {
    try {
      setIsDeleting(title);
      const result = await deleteMcpItem(title);
      
      if ('Ok' in result) {
        toast({
          title: "Success",
          description: "MCP server deleted successfully",
        });
        // Remove the deleted server from the list
        setMcpServers(prev => prev.filter(server => server.title !== title));
      } else {
        toast({
          title: "Error",
          description: `Failed to delete: ${result.Err}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting MCP server:', error);
      toast({
        title: "Error",
        description: "Failed to delete MCP server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const goToNextPage = () => {
    if (hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="pt-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">MCP Mnemonic</h1>
          <p className="text-muted-foreground">Discover and deploy MCP protocol compatible servers</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="gap-2">
            <Link to="/home/mcp-implementation">
              <BookOpen size={18} />
              Implementation Guide
            </Link>
          </Button>
          <Button variant="default" asChild className="gap-2">
            <Link to="/home/add-mcp-server">
              <PlusCircle size={18} />
              Add My MCP Server
            </Link>
          </Button>
        </div>
      </div>

      <div className="my-12">
        <h2 className="text-3xl font-bold text-center mb-4">Explore our collection of powerful server resources for enhanced functionality</h2>
        <p className="text-lg text-center text-muted-foreground mb-14">
          Build and connect with robust MCP servers to extend your application capabilities
        </p>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading MCP servers...</p>
          </div>
        ) : error ? (
          <div className="text-center p-12 border border-destructive/20 rounded-lg bg-destructive/10">
            <p className="text-destructive font-medium">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        ) : mcpServers.length === 0 ? (
          <div className="text-center p-12 border border-border rounded-lg bg-card/50">
            <p className="text-muted-foreground mb-4">No MCP servers found.</p>
            <Button asChild variant="default">
              <Link to="/home/add-mcp-server" className="gap-2">
                <PlusCircle size={16} />
                Add Your First MCP Server
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mcpServers.map((server) => (
                <div 
                  key={server.id} 
                  className="rounded-lg bg-card/50 border border-border/20 p-6 hover:border-primary/30 transition-all duration-300 flex flex-col"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-semibold">{server.title}</h3>
                      {server.isNew && (
                        <Badge className="bg-emerald-500 hover:bg-emerald-600">New</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User size={14} />
                      <span>{server.author}</span>
                    </div>
                    
                    <p className="text-muted-foreground">{truncateToWords(server.description, 20)}</p>
                    
                    <div className="flex justify-between items-center pt-3 mt-auto">
                      <Link 
                        to={server.githubLink} 
                        className="text-primary hover:text-primary/80 flex items-center gap-2 text-sm transition-colors"
                      >
                        <Github size={16} /> GitHub
                      </Link>
                      
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="View Source Code">
                          <FileCode size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          asChild
                          title="Connect to Server"
                        >
                          <Link to={`/home/mcp-server/${encodeURIComponent(server.title)}`}>
                            <ExternalLink size={16} />
                          </Link>
                        </Button>
                        
                        {/* Delete button - only shown if current user is the owner */}
                        {principalId && server.owner === principalId && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" 
                                title="Delete Server"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete MCP Server</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{server.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleDeleteMcpItem(server.title)}
                                  disabled={isDeleting === server.title}
                                >
                                  {isDeleting === server.title ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    'Delete'
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center mt-8">
              <div className="text-sm text-muted-foreground">
                Page {currentPage}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft size={16} />
                  Previous
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={goToNextPage}
                  disabled={!hasMore}
                  className="flex items-center gap-1"
                >
                  Next
                  <ChevronRight size={16} />
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Showing {mcpServers.length} servers
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MCPStore;
