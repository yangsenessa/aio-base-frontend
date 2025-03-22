
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const WelcomeSection = () => {
  return (
    <section className="max-w-3xl mx-auto text-center space-y-6 mb-16 pt-12">
      <div className="flex flex-col items-center mb-8">
        <img 
          src="/lovable-uploads/54c931cb-f737-402b-aea6-c43280665614.png" 
          alt="AIO Logo" 
          className="w-24 h-24 mb-4"
        />
        <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Welcome to AIO-2030
        </div>
      </div>
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
        Open Source and AI Development Projects
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        A curated hub for innovative projects across AI, open source, and language models, 
        bringing together cutting-edge technology and collaborative development.
      </p>
      
      <div className="pt-4">
        <Link to="/ai-projects">
          <Button variant="default" className="text-base py-5 px-6">
            Explore Projects
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default WelcomeSection;
