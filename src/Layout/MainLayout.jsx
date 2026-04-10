import Sidebar from "../Components/Sidebar/Sidebar.jsx";
import Navbar from "../Components/Navbar/Navbar";
import { Outlet } from "react-router-dom";
import { useSidebar } from "../Context/SidebarContext.js";

const MainLayout = () => {
  const { collapsed, collapseSidebar, isMobile } = useSidebar();

  const showOverlay = isMobile && !collapsed;

  return (
    
    <div className="d-flex flex-column" style={{ height: "100vh", overflow: "hidden" }}>
      <Navbar />

      
      <div className="d-flex flex-grow-1 position-relative" style={{ overflow: "hidden" }}>
        <Sidebar />

        {showOverlay && (
          <div
            onClick={collapseSidebar}
            style={{
              position: "fixed",
              inset: 0,
              background: "transparent",
              zIndex: 998,
            }}
          />
        )}
        
        <div 
          className={`flex-grow-1 outlet-wrapper ${
            isMobile ? "mobile-offset" : ""
          }`}
        
          style={{ 
            height: "100%", 
            overflowY: isMobile ? "auto" : "hidden" 
          }}  
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;