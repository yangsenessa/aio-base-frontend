
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const featuredProjects = [
    {
      id: '1',
      title: 'ETHDenver 2025',
      subtitle: 'February 23 — March 2',
      description: 'Unifying Web3 + AI',
      image: 'public/lovable-uploads/0436b5b9-ba47-4f9e-8964-83d6c7633b6d.png',
      category: 'AI Projects',
      linkText: 'Join event',
      path: '/ai-projects',
    },
    {
      id: '2',
      title: 'The Self-Writing & Sovereign Internet Paradigm',
      subtitle: 'AI on the Internet Computer',
      description: 'Revolutionizing how we interact with the internet',
      image: 'public/lovable-uploads/12efe810-6cd3-4b57-b7c5-81fcfe676fb2.png',
      category: 'Open Source',
      linkText: 'Watch video',
      path: '/open-source',
    },
    {
      id: '3',
      title: 'UNDP Partnership: Universal Trusted Credentials',
      subtitle: 'Collaboration to enhance Financial Inclusion of MSMEs',
      description: 'Building a more inclusive financial future',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
      category: 'LLM Demos',
      linkText: 'Read the press release',
      path: '/llm-demos',
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
          {featuredProjects.map((project) => (
            <div
              key={project.id}
              className="rounded-lg overflow-hidden bg-card/40 flex flex-col h-full"
            >
              {/* Image section */}
              <div className="h-48 relative overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center" 
                  style={{ backgroundImage: `url(${project.image})` }}
                />
              </div>
              
              {/* Content section */}
              <div className="p-6 flex flex-col flex-grow bg-background">
                <div className="text-sm font-medium text-primary mb-2">
                  {project.category}
                </div>
                
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
