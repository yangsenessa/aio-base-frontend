
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";

const Home = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 3;

  const allProjects = [
    {
      id: '1',
      title: 'ETHDenver 2025',
      subtitle: 'February 23 — March 2',
      description: 'Unifying Web3 + AI',
      image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200',
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

  // Define news items for the NEWS section
  const newsItems = [
    {
      id: 'news1',
      title: 'Crypto News & Regulatory Update: February 28 – March 14, 2025',
      subtitle: 'a16z crypto policy & regulatory teams',
      description: '',
      isNew: true,
    },
    {
      id: 'news2',
      title: 'A Policy Blueprint for US Investment in AI Talent and Infrastructure',
      author: 'Matt Perault',
      description: 'The US government should invest in AI talent and infrastructure to ensure that Little Tech has the ability to compete and thrive.',
      isNew: true,
    },
    {
      id: 'news3',
      title: 'a16z\'s Recommendations for the National AI Action Plan',
      author: 'Jai Ramaswamy, Collin McCune, and Matt Perault',
      description: 'This week, a16z shared our recommendations with the White House Office of Science and Technology Policy (OSTP) for how the United States can implement a competitiveness agenda that will enable it to continue to lead the world in AI development.',
      isNew: true,
    },
    {
      id: 'news4',
      title: 'Blockchain Performance, Demystified',
      author: 'Alexander (Sasha) Spiegelman, Tim Roughgarden, and Robert Hackett',
      description: '',
      isNew: true,
    },
  ];

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
          <h2 className="text-2xl font-semibold">Hot Agent</h2>
          <Link 
            to="/ai-projects" 
            className="text-sm text-primary hover:underline flex items-center space-x-1"
          >
            <span>View all AI Agent</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {currentProjects.map((project) => (
            <div
              key={project.id}
              className="rounded-xl overflow-hidden flex flex-col bg-card shadow-md hover:shadow-lg transition-all duration-300 h-full"
            >
              <div className="h-64 relative overflow-hidden">
                <img 
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-primary/90 text-white text-sm font-medium px-3 py-1 rounded-full">
                  {project.category}
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-grow bg-background">
                <h3 className="text-2xl font-bold leading-tight mb-3">
                  {project.title}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {project.subtitle}
                </p>
                
                <p className="text-sm text-muted-foreground mb-6 flex-grow">
                  {project.description}
                </p>
                
                <Link 
                  to={project.path}
                  className="text-sm text-primary flex items-center gap-1 hover:underline mt-auto"
                >
                  <span>{project.linkText}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
        
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

      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">NEWS</h2>
        <div className="flex flex-col space-y-8">
          {newsItems.map((news) => (
            <div 
              key={news.id}
              className="border-b border-border/30 pb-8 last:border-0"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold">{news.title}</h3>
                {news.isNew && (
                  <Badge variant="default" className="bg-orange-500 hover:bg-orange-600">NEW</Badge>
                )}
              </div>
              
              <div className="text-muted-foreground mb-3">
                {news.author && <p>{news.author}</p>}
                {news.subtitle && <p>{news.subtitle}</p>}
              </div>
              
              {news.description && (
                <p className="text-muted-foreground">{news.description}</p>
              )}
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
