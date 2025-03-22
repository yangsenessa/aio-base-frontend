
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <div className="text-center max-w-3xl mx-auto space-y-8">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-tight">
          When stars fall in chaos,<br />the colony brings order.
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300">
          A thousand minds, one nest. A million paths, one frequency.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link to="/dashboard">
            <Button variant="outline" className="text-lg py-6 px-8 border-white text-white hover:bg-white/10">
              Join the Colony
            </Button>
          </Link>
        </div>
        
        <div className="pt-8 text-gray-400">
          AIO — Agent Input & Output Protocol
        </div>
      </div>
    </div>
  );
};

export default Index;
