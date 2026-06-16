import { type ReactNode } from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
