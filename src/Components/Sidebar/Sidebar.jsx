import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "../../Context/SidebarContext";
import { sidebarIconMap } from "../../utils/sidebarIconMap";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { getMenuItems } from "./Sidebar";
import "./Sidebar.css";

const Sidebar = () => {
  const { collapsed, collapseSidebar, isMobile } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  const [menuItems, setMenuItems] = useState([]);
  const [openItem, setOpenItem] = useState(null);

  useEffect(() => {
    const fetchMenu = async () => {
      const response = await getMenuItems();
      setMenuItems(response);
    };
    fetchMenu();
  }, []);

  const toggleMenu = (index) => {
    if (collapsed) return;
    setOpenItem((prev) => (prev === index ? null : index));
  };

  const handleLinkClick = () => {
    if (isMobile) collapseSidebar();
  };

  return (
    <aside
      className={`sidebar ${collapsed ? "collapsed" : ""} ${
        isMobile && !collapsed ? "mobile-expanded" : ""
      }`}
    >
      {menuItems.map((item, index) => {
        const Icon = sidebarIconMap[item.icon];

        const hasActiveChild = item.children?.some(
          (c) => c.url === location.pathname
        );

        const isParentActive =
          (!item.children && location.pathname === item.url) ||
          hasActiveChild;

        return (
          <div key={item.id} className="sidebar-group mb-1">
            {!item.children && (
              <div className="sidebar-hover-wrapper">
                <NavLink
                  to={item.url}
                  onClick={handleLinkClick}
                  className={`sidebar-item d-flex align-items-center gap-3 px-4 py-3 ${
                    isParentActive ? "active" : ""
                  }`}
                >
                  <div className="sidebar-icon-wrapper">
                    {Icon && <Icon size={18} />}
                  </div>

                  {!collapsed && (
                    <span className="sidebar-text">{item.label}</span>
                  )}
                </NavLink>

                {/* Hover popup (collapsed) */}
                {collapsed && (
                  <div className="sidebar-hover-menu">
                    <NavLink
                      to={item.url}
                      onClick={handleLinkClick}
                      className="hover-child-item"
                    >
                      {item.label}
                    </NavLink>
                  </div>
                )}
              </div>
            )}

            {item.children && (
              <div className="sidebar-hover-wrapper">
                <div
                  className={`sidebar-item d-flex align-items-center gap-3 px-4 py-3 ${
                    isParentActive ? "active" : ""
                  }`}
                  onClick={() => {
                    if (collapsed) {
                      handleLinkClick();
                      navigate(item.url);
                    } else {
                      toggleMenu(index);
                    }
                  }}
                >
                  <div className="sidebar-icon-wrapper">
                    {Icon && <Icon size={18} />}
                  </div>

                  {!collapsed && (
                    <span className="sidebar-text">{item.label}</span>
                  )}

                  {!collapsed && (
                    <span className="ms-auto">
                      {openItem === index ? (
                        <FiChevronUp size={16} />
                      ) : (
                        <FiChevronDown size={16} />
                      )}
                    </span>
                  )}
                </div>

                {/* Hover popup with children */}
                {collapsed && (
                  <div className="sidebar-hover-menu">
                    <div className="hover-parent-title">{item.label}</div>

                    {item.children.map((child) => (
                      <NavLink
                        key={child.id}
                        to={child.url}
                        onClick={handleLinkClick}
                        className="hover-child-item"
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!collapsed && openItem === index && item.children && (
              <div className="child-container ms-4 mt-2">
                {item.children.map((child) => (
                  <NavLink
                    key={child.id}
                    to={child.url}
                    onClick={handleLinkClick}
                    className={`child-item d-flex align-items-center px-4 py-3 ${
                      location.pathname === child.url ? "active" : ""
                    }`}
                  >
                    <span className="child-dot">•</span>
                    <span className="sidebar-child-text ms-2">
                      {child.label}
                    </span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
};

export default Sidebar;
