
import { Outlet } from 'react-router-dom';

const MainContent = ({ showChat }: { showChat?: boolean }) => {
  return (
    <main className={`flex-1 overflow-y-auto pt-16 h-full web3-gradient-bg ${!showChat ? 'lg:pr-0' : ''}`}>
      <div className={`container mx-auto p-6 page-transition ${!showChat ? 'lg:max-w-6xl' : 'max-w-4xl'}`}>
        <Outlet />
      </div>
    </main>
  );
};

export default MainContent;
