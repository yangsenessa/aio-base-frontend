
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const Home = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 3;

  const allProjects = [
    {
      id: '1',
      title: 'ETHDenver 2025',
      subtitle: 'February 23 — March 2',
      description: 'Unifying Web3 + AI',
      image: 'public/lovable-uploads/7cbe8554-c0af-4c4b-abaa-fc292a86ddb2.png',
      category: 'AI Projects',
      linkText: 'Join event',
      path: '/ai-projects',
    },
    {
      id: '2',
      title: 'The Self-Writing & Sovereign Internet Paradigm',
      subtitle: 'AI on the Internet Computer',
      description: 'Revolutionizing how we interact with the internet',
      image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=1200',
      category: 'Open Source',
      linkText: 'Watch video',
      path: '/open-source',
    },
    {
      id: '3',
      title: 'UNDP Partnership: Universal Trusted Credentials',
      subtitle: 'Collaboration to enhance Financial Inclusion of MSMEs',
      description: 'Building a more inclusive financial future',
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1200',
      category: 'LLM Demos',
      linkText: 'Read the press release',
      path: '/llm-demos',
    },
    {
      id: '4',
      title: 'Quantum Neural Networks',
      subtitle: 'Next-generation AI computation',
      description: 'Exploring the intersection of quantum computing and neural networks',
      image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=1200',
      category: 'AI Research',
      linkText: 'Explore research',
      path: '/ai-projects',
    },
    {
      id: '5',
      title: 'Decentralized Identity Framework',
      subtitle: 'Self-sovereign identity solutions',
      description: 'Building the foundation for user-controlled digital identity',
      image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=1200',
      category: 'Web3 Infrastructure',
      linkText: 'View framework',
      path: '/open-source',
    },
    {
      id: '6',
      title: 'Neural Interface Systems',
      subtitle: 'Human-computer interaction revolution',
      description: 'Breaking barriers between human cognition and digital systems',
      image: 'https://images.unsplash.com/photo-1581090700227-1e37b190418e?q=80&w=1200',
      category: 'AI Projects',
      linkText: 'Learn more',
      path: '/ai-projects',
    },
  ];

  // Calculate total number of pages
  const totalPages = Math.ceil(allProjects.length / projectsPerPage);
  
  // Get current projects
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = allProjects.slice(indexOfFirstProject, indexOfLastProject);

  // Change page
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="space-y-12">
      <section className="max-w-3xl mx-auto text-center space-y-6 mb-16 pt-12">
        <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Welcome to AIO-center
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
          Open Source and AI Development Projects
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A curated hub for innovative projects across AI, open source, and language models, 
          bringing together cutting-edge technology and collaborative development.
        </p>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Featured Projects</h2>
          <Link 
            to="/ai-projects" 
            className="text-sm text-primary hover:underline flex items-center space-x-1"
          >
            <span>View all projects</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentProjects.map((project) => (
            <div
              key={project.id}
              className="rounded-lg overflow-hidden bg-card/40 flex flex-col h-full shadow-md hover:shadow-lg transition-all duration-300"
            >
              {/* Image section */}
              <div className="h-48 relative overflow-hidden">
                <img 
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute top-3 left-3 bg-primary/90 text-white text-xs font-medium px-2 py-1 rounded">
                  {project.category}
                </div>
              </div>
              
              {/* Content section */}
              <div className="p-6 flex flex-col flex-grow bg-background">
                <h3 className="text-xl font-bold leading-tight mb-2">
                  {project.title}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {project.subtitle}
                </p>
                
                <p className="text-sm text-muted-foreground mb-4 flex-grow">
                  {project.description}
                </p>
                
                <Link 
                  to={project.path}
                  className="text-sm text-primary flex items-center gap-1 hover:underline"
                >
                  <span>{project.linkText}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination */}
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage - 1);
                    }} 
                  />
                </PaginationItem>
              )}
              
              {Array.from({ length: totalPages }).map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(index + 1);
                    }}
                    isActive={currentPage === index + 1}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage + 1);
                    }} 
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      </section>

      {/* Showcase section with highlighted projects */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Project Showcase</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {additionalProjects.map((project) => (
            <div 
              key={project.id}
              className="flex flex-col md:flex-row gap-6 p-6 rounded-xl web3-card hover:-translate-y-1 transition-all duration-300"
            >
              <div className="md:w-1/3 h-48 md:h-auto rounded-lg overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="md:w-2/3 flex flex-col justify-between">
                <div>
                  <div className="text-sm text-primary mb-2">{project.category}</div>
                  <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{project.subtitle}</p>
                  <p className="text-muted-foreground">{project.description}</p>
                </div>
                <Link 
                  to={project.path}
                  className="text-primary flex items-center gap-1 mt-4 hover:underline self-start"
                >
                  <span>{project.linkText}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white/80 rounded-xl border border-border/40 p-8 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-md">
            <h2 className="text-2xl font-semibold mb-4">Join the Community</h2>
            <p className="text-muted-foreground mb-6">
              Connect with developers, share ideas, and contribute to innovative open-source projects 
              that are shaping the future of technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                Join Discord
              </button>
              <button className="bg-secondary text-foreground px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors">
                GitHub
              </button>
            </div>
          </div>
          <div className="w-full md:w-1/3 bg-gradient-to-r from-primary/10 to-primary/5 h-48 rounded-lg"></div>
        </div>
      </section>
    </div>
  );
};

export default Home;
