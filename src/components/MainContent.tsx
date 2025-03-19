
import { Outlet } from 'react-router-dom';

const MainContent = ({ showChat }: { showChat?: boolean }) => {
  return (
    <main className="flex-1 overflow-y-auto pt-16 h-full web3-gradient-bg">
      <div className={`container mx-auto p-6 page-transition ${showChat ? 'max-w-4xl' : 'max-w-full'}`}>
        <Outlet />
      </div>
    </main>
  );
};

export default MainContent;
