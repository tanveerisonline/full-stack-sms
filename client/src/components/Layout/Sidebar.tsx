import { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  ChevronRight, 
  BookOpen, 
  CheckCircle, 
  MessageSquare, 
  FileText, 
  PieChart, 
  Building, 
  DollarSign, 
  Trophy, 
  Users, 
  Library, 
  GraduationCap, 
  Truck,
  List,
  Calendar,
  ClipboardList,
  UserPlus,
  UserCheck,
  CreditCard,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NAVIGATION_ITEMS } from '@/utils/constants';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleNavigation = (path: string) => {
    setLocation(path);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const isActive = (path: string) => {
    return location === path;
  };

  const IconComponents = {
    BookOpen,
    CheckCircle,
    MessageSquare,
    FileText,
    PieChart,
    Building,
    DollarSign,
    Trophy,
    Users,
    Library,
    GraduationCap,
    Truck,
    List,
    Calendar,
    ClipboardList,
    UserPlus,
    UserCheck,
    CreditCard,
    User
  } as const;

  const renderIcon = (iconName: string, className: string = "w-4 h-4") => {
    const IconComponent = IconComponents[iconName as keyof typeof IconComponents];
    return IconComponent ? <IconComponent className={className} /> : null;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
          data-testid="sidebar-overlay"
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 z-30",
          "transform transition-transform duration-300 ease-in-out overflow-y-auto custom-scrollbar",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        data-testid="sidebar"
      >
        <nav className="py-2 px-2">
          <div className="space-y-1">
            {NAVIGATION_ITEMS.map((item) => (
              <div key={item.id}>
                {item.hasSubmenu ? (
                  <div className="nav-group">
                    <Button
                      variant="ghost"
                      className="w-full justify-between px-3 py-2.5 text-left text-slate-700 hover:bg-slate-50 rounded-lg"
                      onClick={() => toggleGroup(item.id)}
                      data-testid={`button-nav-group-${item.id}`}
                    >
                      <div className="flex items-center gap-3">
                        {renderIcon(item.icon, "w-4 h-4 text-slate-600")}
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <ChevronRight 
                        className={cn(
                          "w-4 h-4 transition-transform text-slate-400",
                          expandedGroups.includes(item.id) && "rotate-90"
                        )}
                      />
                    </Button>
                    
                    {expandedGroups.includes(item.id) && item.submenu && (
                      <div className="ml-6 space-y-0.5 mt-1 border-l border-slate-200 pl-3">
                        {item.submenu.map((subItem) => (
                          <Button
                            key={subItem.id}
                            variant="ghost"
                            className={cn(
                              "w-full justify-start px-3 py-2 text-left text-slate-600 hover:bg-primary-50 hover:text-primary-700 text-sm rounded-md",
                              isActive(subItem.path) && "bg-primary-50 text-primary-700 font-medium"
                            )}
                            onClick={() => handleNavigation(subItem.path)}
                            data-testid={`button-nav-item-${subItem.id}`}
                          >
                            <div className="flex items-center gap-2.5">
                              {renderIcon(subItem.icon, "w-3.5 h-3.5")}
                              <span>{subItem.label}</span>
                            </div>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start px-3 py-2.5 text-left text-slate-700 hover:bg-primary-50 hover:text-primary-700 rounded-lg",
                      isActive(item.path!) && "bg-primary-50 text-primary-700 font-medium"
                    )}
                    onClick={() => handleNavigation(item.path!)}
                    data-testid={`button-nav-item-${item.id}`}
                  >
                    <div className="flex items-center gap-3">
                      {renderIcon(item.icon, "w-4 h-4 text-slate-600")}
                      <span className="font-medium">{item.label}</span>
                    </div>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
}
