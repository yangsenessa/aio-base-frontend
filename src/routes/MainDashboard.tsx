
import { Outlet } from 'react-router-dom';
import MainMenu from '@/components/MainMenu';
import Toolbar from '@/components/Toolbar';
import ChatSidebar from '@/components/ChatSidebar';

const MainDashboard = () => {
  return (
    <div className="flex min-h-screen w-full">
      <MainMenu />
      <div className="flex-1 ml-[20%]">
        <Toolbar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
      <ChatSidebar />
    </div>
  );
};

export default MainDashboard;
