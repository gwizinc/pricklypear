
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from "@/components/ui/navigation-menu";
import { useAuth } from "@/contexts/AuthContext";
import { User, LogOut, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="border-b py-4">
      <div className="container flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold flex items-center gap-2">
          <span className="text-2xl">🪺</span>
          <span>Nest</span>
        </Link>
        
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to="/threads" className="w-full cursor-pointer">New Thread</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </NavigationMenuItem>
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
