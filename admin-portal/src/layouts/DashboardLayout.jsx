import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import SEOHead from '../components/seo/SEOHead';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-ui-bg flex flex-col font-sans">
      <SEOHead title="Dashboard | Velaivaaipu" description="Your private Velaivaaipu account dashboard." robots="noindex, nofollow" />
      <Header />
      
      <div className="flex-1 w-full max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-8 px-4 sm:px-6 py-8">
        {/* Left Sidebar - Hidden on mobile, fixed width on Desktop */}
        <aside className="hidden lg:block w-[280px] flex-shrink-0 sticky top-28 z-10" style={{ height: 'calc(100vh - 7rem)' }}>
          <Sidebar />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
      
      {/* Mobile Sidebar Trigger / Quick Actions could go here */}
    </div>
  );
};

export default DashboardLayout;
