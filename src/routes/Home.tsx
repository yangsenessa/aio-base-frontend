
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const featuredProjects = [
    {
      id: '1',
      title: 'Neural Interface',
      category: 'AI Projects',
      description: 'A revolutionary neural network interface for seamless human-machine interaction',
      path: '/ai-projects',
    },
    {
      id: '2',
      title: 'Quantum OS',
      category: 'Open Source',
      description: 'Open-source distributed operating system with quantum computing capabilities',
      path: '/open-source',
    },
    {
      id: '3',
      title: 'PaLM Assistant',
      category: 'LLM Demos',
      description: 'Conversational AI assistant powered by Google\'s PaLM architecture',
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
            <Link
              key={project.id}
              to={project.path}
              className="bg-white rounded-lg border border-border/40 overflow-hidden shadow-subtle hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="h-40 bg-gradient-to-r from-secondary to-accent"></div>
              <div className="p-6">
                <div className="text-xs font-medium text-primary mb-2">
                  {project.category}
                </div>
                <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {project.description}
                </p>
                <div className="text-sm text-primary flex items-center space-x-1">
                  <span>Learn more</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </Link>
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
