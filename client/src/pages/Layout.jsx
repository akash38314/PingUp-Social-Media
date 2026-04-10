import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Loading from "../components/Loading";
import { useSelector } from "react-redux";

const Layout = () => {
  const user = useSelector((state) => state.user?.value);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return <Loading />;

  return (
    <div className="w-full flex h-screen">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 bg-slate-50 overflow-y-auto">
        <Outlet />
      </div>

      {/* Mobile Menu Button */}
      <button
        className="absolute top-3 right-3 p-2 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden z-50 cursor-pointer"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </div>
  );
};

export default Layout;
