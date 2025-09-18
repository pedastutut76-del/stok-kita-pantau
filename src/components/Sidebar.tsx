import { Link, useLocation } from "react-router-dom";
import { Package, ShoppingCart, BarChart3, Receipt, Settings, TrendingUp, LogOut, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const navItems = [
    {
      path: "/",
      label: "Cek Stok",
      icon: Package,
    },
    {
      path: "/kasir",
      label: "Kasir POS",
      icon: ShoppingCart,
    },
    {
      path: "/laporan",
      label: "Laporan",
      icon: BarChart3,
    },
    {
      path: "/laba-rugi",
      label: "Laba Rugi",
      icon: TrendingUp,
    },
    {
      path: "/admin",
      label: "Admin",
      icon: Settings,
    }
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className={cn(
      "fixed left-0 top-0 z-50 h-full bg-white/95 backdrop-blur-xl border-r border-border/50 shadow-strong transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-primary shadow-medium">
              <Receipt className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                StokKitaPantau
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                Sistem Inventori
              </span>
            </div>
          </div>
        )}
        
        {isCollapsed && (
          <div className="mx-auto">
            <div className="p-2 rounded-xl bg-gradient-primary shadow-medium">
              <Receipt className="h-5 w-5 text-white" />
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 rounded-lg hover:bg-primary/10"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-medium" 
                  : "hover:bg-primary/10 hover:text-primary text-muted-foreground",
                isCollapsed && "justify-center"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="border-t border-border/50 pt-4">
          {isCollapsed ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-full h-10 rounded-xl hover:bg-primary/10">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" className="w-56 rounded-xl shadow-strong border-0 bg-white/95 backdrop-blur-xl">
                <DropdownMenuItem disabled className="text-sm font-medium">
                  {user?.email}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="hover:bg-primary/10 rounded-lg cursor-pointer">
                  <Link to="/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Pengaturan & Profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive hover:bg-destructive/10 rounded-lg">
                  <LogOut className="h-4 w-4 mr-2" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center space-x-3 px-3 py-2 bg-muted/50 rounded-xl">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-1">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="flex-1 h-8 rounded-lg hover:bg-primary/10"
                >
                  <Link to="/settings">
                    <Settings className="h-4 w-4 mr-1" />
                    <span className="text-xs">Settings</span>
                  </Link>
                </Button>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-lg hover:bg-destructive/10 text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
