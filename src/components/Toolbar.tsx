
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Wallet, Menu, X } from 'lucide-react';
import AIOLogo from './AIOLogo';

const Toolbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show toolbar when:
      // 1. User scrolls up
      // 2. User is at the top of the page
      if (currentScrollY <= 0 || currentScrollY < lastScrollY) {
        setIsVisible(true);
      } 
      // Hide toolbar when user scrolls down
      else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/ai-projects', label: 'Protocol' },
    { path: '/open-source', label: 'Open Source' },
    { path: '/best-practices', label: 'Best practices' },
    { path: '/agent-store', label: 'Agent Store' },
    { path: '/mcp-store', label: 'MCP Store' },
  ];

  // Handle redirects from old paths
  const currentPath = location.pathname === '/frameworks' ? '/mcp-store' : location.pathname;

  return (
    <header 
      className={`border-b border-border/20 bg-background/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Left: Logo and Profile */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2">
            <AIOLogo size="sm" showText={true} />
          </Link>
          
          <div className="hidden md:flex items-center ml-4 cursor-pointer group">
            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
              <User size={18} />
            </div>
            <span className="ml-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">Profile</span>
          </div>
        </div>
        
        {/* Center: Navigation */}
        <nav className="hidden md:block">
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
        
        {/* Right: Metamask Button */}
        <div className="flex items-center">
          <button 
            className="flex items-center space-x-2 rounded-full bg-gradient-to-r from-primary/90 to-accent/90 px-4 py-2 text-sm font-medium text-white transition-colors hover:from-primary hover:to-accent"
          >
            <Wallet size={16} />
            <span className="hidden sm:inline">Connect Metamask</span>
          </button>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="ml-4 md:hidden rounded-md p-2 text-muted-foreground hover:bg-secondary"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
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
                <div className="flex items-center py-2 px-3 text-muted-foreground">
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
