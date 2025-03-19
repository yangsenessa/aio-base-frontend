
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

// Components
import Toolbar from "./components/Toolbar";
import ProjectList from "./components/ProjectList";
import MainContent from "./components/MainContent";
import ChatSidebar from "./components/ChatSidebar";

// Routes
import Home from "./routes/Home";
import AIProjects from "./routes/AIProjects";
import OpenSource from "./routes/OpenSource";
import LLMDemos from "./routes/LLMDemos";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  const [showChat, setShowChat] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="h-screen flex flex-col">
            <Toolbar />
            
            <div className="flex flex-1 overflow-hidden">
              {/* Left: Project List */}
              <div className="w-64 flex-shrink-0 hidden md:block">
                <ProjectList />
              </div>
              
              {/* Center: Main Content */}
              <div className="flex-1 flex overflow-hidden">
                <Routes>
                  <Route path="/" element={<MainContent showChat={showChat} />}>
                    <Route index element={<Home />} />
                    <Route path="/ai-projects" element={<AIProjects />} />
                    <Route path="/open-source" element={<OpenSource />} />
                    <Route path="/llm-demos" element={<LLMDemos />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              
                {/* Right: Chat Sidebar */}
                {showChat && (
                  <div className="w-80 flex-shrink-0 hidden lg:block">
                    <ChatSidebar />
                  </div>
                )}
              </div>
            </div>
            
            {/* Mobile Chat Toggle (only visible on small screens) */}
            <div className="lg:hidden fixed bottom-5 right-5 z-50">
              {!showChat && (
                <button 
                  onClick={() => setShowChat(true)}
                  className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
                >
                  Chat
                </button>
              )}
            </div>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
