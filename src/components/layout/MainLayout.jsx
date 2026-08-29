import { useState } from "react";
import { Outlet } from "react-router-dom";
import TopNav from "../navigation/TopNav";
import Sidebar from "../navigation/Sidebar";


function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main className={collapsed ? "ml-[104px]" : "ml-[320px]"}>
        <TopNav />
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;