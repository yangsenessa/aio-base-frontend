
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
              <MainDashboard />
            </ChatProvider>
          }>
            <Route index element={<Home />} />
            <Route path="dashboard" element={<MainDashboard />} />
            <Route path="agent-store" element={<AgentStore />} />
            <Route path="mcp-store" element={<MCPStore />} />
            <Route path="mcp-stacking-records" element={<MCPStackingRecords />} />
            <Route path="ai-projects" element={<AIProjects />} />
            <Route path="add-agent" element={<AddAgent />} />
            <Route path="add-mcp-server" element={<AddMCPServer />} />
            <Route path="agent-implementation" element={<AgentImplementation />} />
            <Route path="mcp-implementation" element={<MCPImplementation />} />
            <Route path="best-practices" element={<BestPractices />} />
            <Route path="open-source" element={<OpenSource />} />
            <Route path="flag-agent" element={<FlagAgent />} />
            <Route path="user-dashboard" element={<UserDashboard />} />
            <Route path="profile" element={<UserDashboard />} />
            <Route path="wallet-settings" element={<WalletSettings />} />
            <Route path="agent/:agentName" element={<AgentDetails />} />
            <Route path="mcp-server/:serverName" element={<MCPServerDetails />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
