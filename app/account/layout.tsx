
import React from 'react';

import StoreHeader from '@/components/store/header';
import SideBarMenu from './SideBarMenu';
import { redirect } from 'next/navigation';
import { checkUserAuth } from '@/utils/auth';

const AccountPageLayout = async ({ children }: { children: React.ReactNode }) => {

  const isAuthenticated = await checkUserAuth();

  if(!isAuthenticated){
    return redirect('/login');
  }

  return (
      <div className="min-h-screen bg-gray-50">
          <StoreHeader/>
           
      <div className="container mx-auto px-4 mt-10">
        <div className="flex flex-col lg:flex-row gap-6">
          
         <SideBarMenu/>

          <main className="w-full lg:w-3/4">
             {children}
          </main>

        </div>
      </div>
    </div>
  );
}

export default AccountPageLayout;