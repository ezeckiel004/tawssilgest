import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar"; // Vérifiez que le chemin est correct
import Header from "./Header"; // Vérifiez que le chemin est correct

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="lg:pl-72">
        <Header setSidebarOpen={setSidebarOpen} />

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; // ⚠️ Vérifiez que c'est "export default Layout"
