import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '../../auth/AuthContext';


interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar} 
        user={user}
        onLogout={logout}
      />
      
      <main className="flex-1 overflow-auto">
        <header className="h-16 border-b flex items-center justify-between px-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
          <button 
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-md hover:bg-secondary"
          >
            <Menu size={20} />
          </button>
          <div className="text-lg font-medium">Zona Gamer</div>
          <div className="flex items-center gap-2">
          </div>
        </header>
        
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          sidebarOpen ? "md:ml-0" : "md:ml-0"
        )}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
