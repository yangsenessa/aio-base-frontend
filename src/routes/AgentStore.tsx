
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { agents, caseStudies } from '@/components/agentStore/agentData';

const AgentStore = () => {
  const [activeCaseStudy, setActiveCaseStudy] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const nextCaseStudy = () => {
    setActiveCaseStudy((current) => (current + 1) % caseStudies.length);
  };

  const prevCaseStudy = () => {
    setActiveCaseStudy((current) => (current - 1 + caseStudies.length) % caseStudies.length);
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAgents = agents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(agents.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="py-8">
      {/* Featured Section Header */}
      <div className="flex items-center mb-6">
        <h2 className="text-xl font-semibold">Featured</h2>
      </div>

      {/* Case Study Card */}
      <div className="mb-12 border rounded-xl shadow-sm overflow-hidden bg-card">
        <div className="p-8">
          <div className="text-center mb-2">
            <span className="text-sm text-muted-foreground uppercase tracking-wide">CASE STUDY</span>
          </div>
          <h1 className="text-4xl font-bold text-center mb-4">{caseStudies[activeCaseStudy].title}</h1>
          <p className="text-lg text-muted-foreground text-center max-w-4xl mx-auto">
            {caseStudies[activeCaseStudy].description}
          </p>
          <div className="flex justify-center mt-6">
            <button className="text-primary hover:underline">Read more</button>
          </div>
        </div>
        
        {/* Pagination controls */}
        <div className="flex justify-between items-center px-8 pb-4">
          <button 
            className="p-2 rounded-full border hover:bg-secondary transition-colors" 
            onClick={prevCaseStudy}
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            className="p-2 rounded-full border hover:bg-secondary transition-colors" 
            onClick={nextCaseStudy}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentAgents.map((agent) => (
          <Card key={agent.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative h-48 bg-slate-200">
              <img
                src={agent.image}
                alt={agent.title}
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-3 left-3 bg-white/90 text-black">
                {agent.category}
              </Badge>
              {agent.hasVideo && (
                <button className="absolute right-3 top-3 bg-white/90 p-2 rounded-full hover:bg-white/70 transition-colors">
                  <Play size={16} />
                </button>
              )}
            </div>
            <CardContent className="pt-4">
              <h3 className="text-xl font-semibold mb-2">{agent.title}</h3>
              <p className="text-muted-foreground line-clamp-3">{agent.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Pagination */}
      <div className="mt-10">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }).map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  isActive={currentPage === index + 1}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext
                onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default AgentStore;
