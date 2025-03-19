
import { useState } from 'react';
import WelcomeSection from '@/components/home/WelcomeSection';
import ProjectsSection from '@/components/home/ProjectsSection';
import NewsSection from '@/components/home/NewsSection';
import CommunitySection from '@/components/home/CommunitySection';
import { allProjects, newsItems } from '@/components/home/projectsData';

const Home = () => {
  const projectsPerPage = 3;

  return (
    <div className="space-y-12">
      <WelcomeSection />
      <ProjectsSection allProjects={allProjects} projectsPerPage={projectsPerPage} />
      <NewsSection newsItems={newsItems} />
      <CommunitySection />
    </div>
  );
};

export default Home;
