import { Link, useLocation } from "react-router-dom";
import { Package, ShoppingCart, BarChart3, Receipt, Settings, TrendingUp, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { UserProfileDialog } from "@/components/UserProfileDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navigation = () => {
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
    <nav className="bg-white/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50 shadow-soft">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-primary shadow-medium">
              <Receipt className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                StokKitaPantau
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                Sistem Manajemen Inventori
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex bg-muted/50 rounded-2xl p-1 space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Button
                    key={item.path}
                    asChild
                    variant="ghost"
                    size="sm"
                    className={`flex items-center space-x-2 rounded-xl px-4 py-2 transition-all duration-300 ${
                      isActive 
                        ? "bg-white text-primary shadow-medium font-semibold" 
                        : "hover:bg-white/60 hover:text-primary text-muted-foreground"
                    }`}
                  >
                    <Link to={item.path}>
                      <Icon className="h-4 w-4" />
                      <span className="hidden md:inline text-sm">{item.label}</span>
                    </Link>
                  </Button>
                );
              })}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 bg-muted/50 hover:bg-primary/10 hover:text-primary">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-strong border-0 bg-white/95 backdrop-blur-xl">
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
          </div>
        </div>
      </div>
    </nav>
  );
};