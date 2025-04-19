
import { cn } from '@/lib/utils';
import { Outlet } from 'react-router-dom';

interface MainContentProps {
  showChat?: boolean;
}

const MainContent = ({ showChat }: MainContentProps) => {
  return (
    <main className="flex-1 overflow-y-auto pt-16 h-full web3-gradient-bg">
      <div className={cn(
        "container mx-auto p-6 page-transition",
        showChat ? 'pr-[328px] lg:pr-6' : 'max-w-full'
      )}>
        <Outlet />
      </div>
    </main>
  );
};

export default MainContent;
