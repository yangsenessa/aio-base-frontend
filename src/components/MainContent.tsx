
import { Outlet } from 'react-router-dom';

const MainContent = () => {
  return (
    <main className="flex-1 overflow-y-auto pt-16 h-full bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto p-6 page-transition">
        <Outlet />
      </div>
    </main>
  );
};

export default MainContent;
