import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import TopNav from "../navigation/TopNav";
import Sidebar from "../navigation/Sidebar";
import MobileHeader from "../navigation/MobileHeader";
import MobileDrawer from "../navigation/MobileDrawer";

function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div>
      <div className="hidden lg:block">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
        />
      </div>

      <div className="lg:hidden">
        <MobileHeader onMenuClick={() => setMobileMenuOpen(true)} />
        <MobileDrawer
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
      </div>

      <main className={collapsed ? "lg:ml-[104px]" : "lg:ml-[320px]"}>
        <div className="hidden lg:block">
          <TopNav />
        </div>

        <div
          key={location.pathname}
          className={
            location.pathname.startsWith("/wrapped") ? "" : "animate-page-in"
          }
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default MainLayout;
