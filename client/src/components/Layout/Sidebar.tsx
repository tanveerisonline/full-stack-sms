import { useState } from 'react';
import { useLocation } from 'wouter';
import { ChevronRight } from 'lucide-react';
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
        <nav className="p-4">
          <div className="space-y-2">
            {NAVIGATION_ITEMS.map((item) => (
              <div key={item.id}>
                {item.hasSubmenu ? (
                  <div className="nav-group">
                    <Button
                      variant="ghost"
                      className="w-full justify-between px-4 py-3 text-left text-slate-700 hover:bg-slate-50"
                      onClick={() => toggleGroup(item.id)}
                      data-testid={`button-nav-group-${item.id}`}
                    >
                      <div className="flex items-center space-x-3">
                        <i className={`${item.icon} w-5`}></i>
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight 
                        className={cn(
                          "w-4 h-4 transition-transform",
                          expandedGroups.includes(item.id) && "rotate-90"
                        )}
                      />
                    </Button>
                    
                    {expandedGroups.includes(item.id) && item.submenu && (
                      <div className="ml-8 space-y-1 mt-1">
                        {item.submenu.map((subItem) => (
                          <Button
                            key={subItem.id}
                            variant="ghost"
                            className={cn(
                              "w-full justify-start px-4 py-2 text-left text-slate-600 hover:bg-primary-50 hover:text-primary-700 text-sm",
                              isActive(subItem.path) && "bg-primary-50 text-primary-700"
                            )}
                            onClick={() => handleNavigation(subItem.path)}
                            data-testid={`button-nav-item-${subItem.id}`}
                          >
                            <i className={`${subItem.icon} w-4 mr-3`}></i>
                            <span>{subItem.label}</span>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start px-4 py-3 text-left text-slate-700 hover:bg-primary-50 hover:text-primary-700",
                      isActive(item.path!) && "bg-primary-50 text-primary-700"
                    )}
                    onClick={() => handleNavigation(item.path!)}
                    data-testid={`button-nav-item-${item.id}`}
                  >
                    <i className={`${item.icon} w-5 mr-3`}></i>
                    <span>{item.label}</span>
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
