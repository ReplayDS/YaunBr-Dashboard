import React from 'react';
import { useMockBackend } from '../services/MockBackendContext';
import { LogOut, User as UserIcon } from 'lucide-react';
import { DICTIONARY } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  lang?: 'pt' | 'zh';
}

export const Layout: React.FC<LayoutProps> = ({ children, title, lang = 'pt' }) => {
  const { logout, currentUser } = useMockBackend();
  const dict = DICTIONARY[lang];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-10 border-t-4 border-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-red-200 shadow-lg">
               ¥
             </div>
             <h1 className="text-xl font-bold text-gray-900 tracking-tight">YuanBR</h1>
             <span className="hidden md:block mx-2 text-gray-300">|</span>
             <span className="text-sm font-medium text-gray-500">{title}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
              <UserIcon size={16} />
              <span className="font-medium truncate max-w-[120px]">{currentUser?.name}</span>
            </div>
            <button 
              onClick={logout}
              className="p-2 text-gray-500 hover:text-red-600 transition-colors"
              title={dict.logout}
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};