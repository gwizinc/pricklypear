
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Separator } from '@/components/ui/separator';
import { 
  Home, 
  MessageSquare, 
  LogIn, 
  LogOut, 
  Users, 
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useMobile } from '@/hooks/use-mobile';

const Navigation = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const { isMobile } = useMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.'
    });
  };

  const navItems = [
    { path: '/', label: 'Home', icon: <Home className="h-4 w-4 mr-2" /> },
    { path: '/threads', label: 'Threads', icon: <MessageSquare className="h-4 w-4 mr-2" /> },
    { path: '/connections', label: 'Connections', icon: <Users className="h-4 w-4 mr-2" /> },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const renderNavItems = () => (
    <>
      {navItems.map((item) => (
        <Link key={item.path} to={item.path}>
          <Button 
            variant={isActive(item.path) ? "default" : "ghost"}
            className="flex items-center"
          >
            {item.icon}
            {item.label}
          </Button>
        </Link>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex mr-4 md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
        
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold">ThoughtLink</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:flex-1 md:items-center md:space-x-2">
          <nav className="flex items-center space-x-2">
            {renderNavItems()}
          </nav>
          
          <div className="flex flex-1 items-center justify-end space-x-2">
            <ThemeToggle />
            
            {!user ? (
              <Button asChild>
                <Link to="/auth">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
              </Button>
            ) : (
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Title (centered) */}
        <div className="flex flex-1 justify-center md:hidden">
          <Link to="/" className="flex items-center">
            <span className="font-bold">ThoughtLink</span>
          </Link>
        </div>

        {/* Mobile Right Actions */}
        <div className="flex items-center md:hidden">
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobile && mobileMenuOpen && (
        <div className="border-t p-4 bg-background md:hidden">
          <nav className="grid grid-flow-row gap-2">
            {renderNavItems()}
            
            <Separator className="my-2" />
            
            {!user ? (
              <Button asChild className="w-full">
                <Link to="/auth">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
              </Button>
            ) : (
              <Button variant="ghost" className="w-full" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navigation;
