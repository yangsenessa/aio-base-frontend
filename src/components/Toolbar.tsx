
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Wallet, Menu, X } from 'lucide-react';
import AIOLogo from './AIOLogo';
import { useMetaMaskConnect, shortenAddress } from '../lib/Metamask-wallet';

const Toolbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  const { account, isConnecting, handleConnectWallet } = useMetaMaskConnect();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY <= 0 || currentScrollY < lastScrollY) {
        setIsVisible(true);
      } 
      else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navItems = [
    { path: '/home', label: 'Home' },
    { path: '/home/dashboard', label: 'Dashboard' },
    { path: '/home/ai-projects', label: 'Protocol' },
    { path: '/home/open-source', label: 'Open Source' },
    { path: '/home/best-practices', label: 'Best practices' },
    { path: '/home/agent-store', label: 'Agent Mnemonic' },
    { path: '/home/mcp-store', label: 'MCP Mnemonic' },
  ];

  const currentPath = location.pathname === '/frameworks' ? '/home/mcp-store' : location.pathname;

  const handleProfileClick = () => {
    navigate('/user-dashboard');
    setIsMenuOpen(false);
  };

  return (
    <header 
      className={`border-b border-border/20 bg-background/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="container mx-auto px-4 flex items-center h-16">
        {/* Logo positioned at the left */}
        <div className="flex-1 flex items-center">
          <Link to="/home" className="mr-6">
            <AIOLogo size="sm" showText={true} />
          </Link>
          
          {/* Navigation items centered */}
          <nav className="hidden md:block ml-auto">
            <ul className="flex space-x-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    className={`nav-link ${currentPath === item.path ? 'active' : ''}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        
        {/* Right side items - Profile & Connect Wallet */}
        <div className="flex items-center ml-4">
          <div 
            className="hidden md:flex items-center cursor-pointer group hover:bg-secondary/50 rounded-full px-3 py-1 transition-colors mr-4"
            onClick={handleProfileClick}
          >
            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
              <User size={18} />
            </div>
            <span className="ml-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">Profile</span>
          </div>
          
          <button 
            className={`flex items-center space-x-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              account 
                ? 'bg-secondary text-foreground hover:bg-secondary/80' 
                : 'bg-gradient-to-r from-primary/90 to-accent/90 text-white hover:from-primary hover:to-accent'
            }`}
            onClick={handleConnectWallet}
            disabled={isConnecting}
          >
            <Wallet size={16} />
            <span className="hidden sm:inline">
              {isConnecting 
                ? 'Connecting...' 
                : account 
                  ? shortenAddress(account) 
                  : 'Connect Metamask'
              }
            </span>
          </button>
          
          <button 
            className="ml-4 md:hidden rounded-md p-2 text-muted-foreground hover:bg-secondary"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden bg-background border-b border-border/20 animate-slide-up">
          <nav className="container mx-auto px-4 py-4">
            <ul className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    className={`block py-2 px-3 rounded-md ${
                      currentPath === item.path 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-muted-foreground hover:bg-secondary/50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <div 
                  className="flex items-center py-2 px-3 text-muted-foreground hover:bg-secondary/50 rounded-md cursor-pointer"
                  onClick={handleProfileClick}
                >
                  <User size={18} className="mr-2" />
                  <span>Profile</span>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Toolbar;
