import { useState } from "react";
import { Outlet } from "react-router-dom";
import TopNav from "../navigation/TopNav";
import Sidebar from "../navigation/Sidebar";
import MobileHeader from "../navigation/MobileHeader";
import MobileDrawer from "../navigation/MobileDrawer";

function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div>
      <div className="hidden lg:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </div>

      <div className="lg:hidden">
        <MobileHeader onMenuClick={() => setMobileMenuOpen(true)} />
        <MobileDrawer open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      </div>

      <main className={collapsed ? "lg:ml-[104px]" : "lg:ml-[320px]"}>
        <div className="hidden lg:block">
          <TopNav />
        </div>

        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;