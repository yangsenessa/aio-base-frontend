
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ChatProvider } from '@/contexts/ChatContext';
import Index from '@/pages/Index';
import Home from '@/routes/Home';
import AgentStore from '@/routes/AgentStore';
import MCPStore from '@/routes/MCPStore';
import MCPStackingRecords from '@/routes/MCPStackingRecords';
import AIProjects from '@/routes/AIProjects';
import AddAgent from '@/routes/AddAgent';
import AddMCPServer from '@/routes/AddMCPServer';
import AgentImplementation from '@/routes/AgentImplementation';
import MCPImplementation from '@/routes/MCPImplementation';
import BestPractices from '@/routes/BestPractices';
import OpenSource from '@/routes/OpenSource';
import FlagAgent from '@/routes/FlagAgent';
import UserDashboard from '@/routes/UserDashboard';
import WalletSettings from '@/routes/WalletSettings';
import AgentDetails from '@/routes/AgentDetails';
import MCPServerDetails from '@/routes/MCPServerDetails';
import MainDashboard from '@/routes/MainDashboard';
import AIODashboard from '@/routes/AIODashboard';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <Router>
      <Toaster />
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/user-dashboard/wallet-settings" element={<WalletSettings />} />
          <Route path="/home" element={
            <ChatProvider>
              <Home />
            </ChatProvider>
          } />
          <Route path="/home/dashboard" element={
            <ChatProvider>
              <MainDashboard />
            </ChatProvider>
          }>
            <Route index element={<AIODashboard />} />
          </Route>
          <Route path="/home/agent-store" element={
            <ChatProvider>
              <AgentStore />
            </ChatProvider>
          } />
          <Route path="/home/mcp-store" element={
            <ChatProvider>
              <MCPStore />
            </ChatProvider>
          } />
          <Route path="/home/mcp-stacking-records" element={
            <ChatProvider>
              <MCPStackingRecords />
            </ChatProvider>
          } />
          <Route path="/home/ai-projects" element={
            <ChatProvider>
              <AIProjects />
            </ChatProvider>
          } />
          <Route path="/home/add-agent" element={
            <ChatProvider>
              <AddAgent />
            </ChatProvider>
          } />
          <Route path="/home/add-mcp-server" element={
            <ChatProvider>
              <AddMCPServer />
            </ChatProvider>
          } />
          <Route path="/home/agent-implementation" element={
            <ChatProvider>
              <AgentImplementation />
            </ChatProvider>
          } />
          <Route path="/home/mcp-implementation" element={
            <ChatProvider>
              <MCPImplementation />
            </ChatProvider>
          } />
          <Route path="/home/best-practices" element={
            <ChatProvider>
              <BestPractices />
            </ChatProvider>
          } />
          <Route path="/home/open-source" element={
            <ChatProvider>
              <OpenSource />
            </ChatProvider>
          } />
          <Route path="/home/flag-agent" element={
            <ChatProvider>
              <FlagAgent />
            </ChatProvider>
          } />
          <Route path="/home/user-dashboard" element={
            <ChatProvider>
              <UserDashboard />
            </ChatProvider>
          } />
          <Route path="/home/profile" element={
            <ChatProvider>
              <UserDashboard />
            </ChatProvider>
          } />
          <Route path="/home/wallet-settings" element={
            <ChatProvider>
              <WalletSettings />
            </ChatProvider>
          } />
          <Route path="/home/agent/:agentName" element={
            <ChatProvider>
              <AgentDetails />
            </ChatProvider>
          } />
          <Route path="/home/mcp-server/:serverName" element={
            <ChatProvider>
              <MCPServerDetails />
            </ChatProvider>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
