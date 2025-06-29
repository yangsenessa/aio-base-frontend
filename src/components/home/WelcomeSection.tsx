
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AIOLogo from '@/components/AIOLogo';

const WelcomeSection = () => {
  return (
    <section className="max-w-3xl mx-auto text-center space-y-6 mb-16 pt-12">
      <div className="flex flex-col items-center mb-8">
        <img 
          src="/newlogo.png" 
          alt="AIO Logo" 
          className="w-48 h-48 mb-4"
        />
        <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Welcome to Univoice : Orchestrating the Future of AI
        </div>
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
           Univoice: Where Intelligence Awakens
      </h1>
      <p className="text-base text-muted-foreground max-w-2xl mx-auto">
           From intention to orchestration—Univoice connects agents, models, and minds in a living ecosystem of intelligent collaboration.
      </p>
      
      <div className="pt-4">
        <Link to="/ai-projects">
          <Button variant="default" className="text-sm py-4 px-5">
            Explore Projects
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default WelcomeSection;
