
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const WelcomeSection = () => {
  return (
    <section className="max-w-3xl mx-auto text-center space-y-6 mb-16 pt-12">
      <div className="flex flex-col items-center mb-8">
        <img 
          src="/lovable-uploads/ed0700ff-7072-485a-8b81-b08b32839e62.png" 
          alt="AIO Logo" 
          className="w-48 h-48 mb-4"
        />
        <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Welcome to AIO-2030
        </div>
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
        Open Source and AI Development Projects
      </h1>
      <p className="text-base text-muted-foreground max-w-2xl mx-auto">
        A curated hub for innovative projects across AI, open source, and language models, 
        bringing together cutting-edge technology and collaborative development.
      </p>
      
      <div className="pt-4">
        <Link to="/ai-projects">
          <Button variant="default" className="text-sm py-4 px-5">
            Explore Projects
          </Button>
        </Link>
      </div>
      
      <div className="mt-4 flex flex-col items-center">
        <p className="text-[#ea384c] text-sm font-medium">
          Power by ICP (International Computer Protocol)
        </p>
      </div>
    </section>
  );
};

export default WelcomeSection;
