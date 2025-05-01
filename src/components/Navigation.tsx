import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  LogIn, 
  LogOut, 
  Users, 
  Menu,
  X,
  UserRound,
  Settings,
  FileText,
  Bell
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import NotificationBadge from '@/components/ui/notification-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navigation = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { totalUnread } = useUnreadMessages();

  const handleLogout = async () => {
    await signOut();
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.'
    });
  };

  const getUserInitials = () => {
    if (!user) return '?';
    
    // Try to get name from metadata if available
    const displayName = user.user_metadata?.username || user.email;
    
    if (!displayName) return '?';
    
    if (user.user_metadata?.username) {
      // If we have a name, get first letter
      return displayName.charAt(0).toUpperCase();
    } else if (user.email) {
      // If we have an email, get first letter
      return user.email.charAt(0).toUpperCase();
    }
    
    return '?';
  };

  // Only show these nav items when user is logged in
  const navItems = user ? [
    { path: '/threads', label: 'Threads', icon: <MessageSquare className="h-4 w-4 mr-2" /> },
    { path: '/connections', label: 'Connections', icon: <Users className="h-4 w-4 mr-2" /> },
    { path: '/documents', label: 'Documents', icon: <FileText className="h-4 w-4 mr-2" /> },
  ] : [];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const renderNavItems = () => (
    <>
      {navItems.map((item) => (
        <Link key={item.path} to={item.path}>
          <Button 
            variant={isActive(item.path) ? "default" : "ghost"}
            className="flex items-center relative"
          >
            {item.icon}
            {item.label}
          </Button>
        </Link>
      ))}
    </>
  );

  const renderUserMenu = () => {
    if (!user) {
      return (
        <Button asChild>
          <Link to="/auth">
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Link>
        </Button>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.user_metadata?.avatar_url} alt="User avatar" />
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
            {totalUnread > 0 && <NotificationBadge count={totalUnread} />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel>
            {user.user_metadata?.username || user.email || 'My Account'}
            {totalUnread > 0 && (
              <span className="ml-2 bg-accent text-white text-xs font-medium rounded-full px-2 py-0.5">
                {totalUnread}
              </span>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/threads" className="flex w-full items-center justify-between">
              <div className="flex items-center">
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>Messages</span>
              </div>
              {totalUnread > 0 && (
                <span className="bg-accent text-white text-xs font-medium rounded-full px-2 py-0.5">
                  {totalUnread}
                </span>
              )}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/preferences" className="flex w-full items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>Preferences</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

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
            <span className="font-bold flex items-center">
              <span className="mr-1">🪺</span> Nest
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:flex-1 md:items-center md:space-x-2">
          <nav className="flex items-center space-x-2">
            {renderNavItems()}
          </nav>
          
          <div className="flex flex-1 items-center justify-end space-x-2">
            {renderUserMenu()}
          </div>
        </div>

        {/* Mobile Title (centered) */}
        <div className="flex flex-1 justify-center md:hidden">
          <Link to="/" className="flex items-center">
            <span className="font-bold flex items-center">
              <span className="mr-1">🪺</span> Nest
            </span>
          </Link>
        </div>

        {/* Mobile Right Actions */}
        <div className="flex items-center md:hidden">
          {renderUserMenu()}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobile && mobileMenuOpen && (
        <div className="border-t p-4 bg-background md:hidden">
          <nav className="grid grid-flow-row gap-2">
            {renderNavItems()}
            
            <Separator className="my-2" />
            
            {!user && (
              <Button asChild className="w-full">
                <Link to="/auth">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navigation;
