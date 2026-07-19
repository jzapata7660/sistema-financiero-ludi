import React from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="flex h-screen bg-[#f3f4f6] font-sans overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#f3f4f6] p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
