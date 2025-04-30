
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from "@/components/ui/navigation-menu";
import { useAuth } from "@/contexts/AuthContext";
import { User, LogOut } from "lucide-react";

const Navigation = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="border-b py-4">
      <div className="container flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold">Nest</Link>
        
        <NavigationMenu>
          <NavigationMenuList className="flex items-center gap-2">
            <NavigationMenuItem className="list-none">
              <Button asChild variant="ghost">
                <Link to="/demo">Demo</Link>
              </Button>
            </NavigationMenuItem>
            
            {user ? (
              <>
                <NavigationMenuItem className="list-none">
                  <Button asChild variant="ghost">
                    <Link to="/threads">My Threads</Link>
                  </Button>
                </NavigationMenuItem>
                <NavigationMenuItem className="list-none">
                  <Button variant="outline" size="sm" onClick={handleSignOut} className="flex gap-2">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </NavigationMenuItem>
              </>
            ) : (
              <NavigationMenuItem className="list-none">
                <Button asChild variant="outline">
                  <Link to="/auth" className="flex gap-2">
                    <User className="h-4 w-4" />
                    Sign In
                  </Link>
                </Button>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
};

export default Navigation;
