
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from "@/components/ui/navigation-menu";

const Navigation = () => {
  return (
    <header className="border-b py-4">
      <div className="container flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold">Nest</Link>
        
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem className="list-none">
              <Button asChild variant="ghost">
                <Link to="/threads">Threads</Link>
              </Button>
            </NavigationMenuItem>
            <NavigationMenuItem className="list-none">
              <Button asChild variant="ghost">
                <Link to="/demo">Demo</Link>
              </Button>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
};

export default Navigation;
