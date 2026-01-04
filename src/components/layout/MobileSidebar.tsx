import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FilePlus, 
  CheckCircle2, 
  Clock, 
  Wallet, 
  FileText,
  Settings,
  LogOut,
  Shield,
  Users,
  X
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { canCreateExecutions, canApproveExecutions, canViewAuditLogs, canManageUsers, roleConfig } from "@/types/roles";
import { Button } from "@/components/ui/button";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, roles, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleNavClick = (href: string) => {
    navigate(href);
    onClose();
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, show: true },
    { name: 'New Execution', href: '/new-execution', icon: FilePlus, show: canCreateExecutions(roles) },
    { name: 'Approval Queue', href: '/approvals', icon: CheckCircle2, show: canApproveExecutions(roles) },
    { name: 'Transactions', href: '/transactions', icon: Clock, show: true },
    { name: 'Core Wallet', href: '/wallet', icon: Wallet, show: true },
    { name: 'Audit Logs', href: '/audit', icon: FileText, show: canViewAuditLogs(roles) },
  ];

  const adminNav = [
    { name: 'User Management', href: '/users', icon: Users, show: canManageUsers(roles) },
    { name: 'Settings', href: '/settings', icon: Settings, show: true },
  ];

  const userInitials = profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U';
  const primaryRole = roles[0] ? roleConfig[roles[0]]?.label : 'User';

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-72 bg-gradient-primary flex flex-col z-50 lg:hidden animate-slide-in-left">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-gold">
              <Shield className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-sidebar-foreground text-lg">CryptoExec</h1>
              <p className="text-xs text-sidebar-foreground/60">Execution Platform</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.filter(item => item.show).map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.href)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Admin Navigation */}
        <div className="px-3 py-2 border-t border-sidebar-border">
          {adminNav.filter(item => item.show).map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavClick(item.href)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                location.pathname === item.href
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </button>
          ))}
        </div>

        {/* User Profile */}
        <div className="px-3 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-accent-foreground font-semibold">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {profile?.full_name || 'Loading...'}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {primaryRole}
              </p>
            </div>
            <button 
              onClick={handleSignOut}
              className="p-2 rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
