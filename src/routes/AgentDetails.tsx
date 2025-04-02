
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { getAgentItemByName } from '@/services/can/agentOperations';
import type { AgentItem } from 'declarations/aio-base-backend/aio-base-backend.did.d.ts';
import AgentInfoCard from '@/components/agent/AgentInfoCard';
import AgentTestSection from '@/components/agent/AgentTestSection';
import AgentDocumentationSection from '@/components/agent/AgentDocumentationSection';

const AgentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const [agent, setAgent] = useState<AgentItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch agent details
  useEffect(() => {
    const fetchAgentDetails = async () => {
      setLoading(true);
      try {
        if (id) {
          const agentData = await getAgentItemByName(id);
          setAgent(agentData || null);
        }
      } catch (error) {
        console.error('Error fetching agent details:', error);
        toast({
          title: "Error",
          description: "Failed to fetch agent details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAgentDetails();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="py-8 flex justify-center items-center">
        <p>Loading agent details...</p>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="py-8">
        <div className="flex items-center mb-8">
          <Link to="/home/agent-store" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Agent not found</h1>
        </div>
        <Card>
          <CardContent className="py-8">
            <p>The agent "{id}" could not be found.</p>
            <Link to="/home/agent-store">
              <Button className="mt-4">Return to Agent Store</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex items-center mb-8">
        <Link to="/home/agent-store" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{agent.name}</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-1">
          <AgentInfoCard agent={agent} />
        </div>
        
        <div className="lg:col-span-2">
          <AgentTestSection agent={agent} />
        </div>
      </div>
      
      <AgentDocumentationSection agent={agent} />
    </div>
  );
};

export default AgentDetails;
