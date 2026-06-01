import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "../../Context/SidebarContext";
import { sidebarIconMap } from "../../utils/sidebarIconMap";
import { FiChevronDown, FiChevronUp, FiLogOut } from "react-icons/fi";
import profileImg from "../../asset/image/profile.jpg";
import "./Sidebar.css";

const Sidebar = () => {
  const { collapsed, collapseSidebar, isMobile } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  const [menuItems, setMenuItems] = useState([]);
  const [user, setUser] = useState(null);
  const [openItem, setOpenItem] = useState(null);

 useEffect(() => {

  const fetchMenu = () => {

    const permissions =
      localStorage.getItem("permissions");

    if (!permissions) {

      setMenuItems([]);

      return;
    }

    try {

      const parsed =
        JSON.parse(permissions);

      const menuArray =
        Array.isArray(parsed)
          ? parsed
          : [];

      const formattedMenus =
        menuArray.map((item) => ({

          id: item.id,

          label: item.name,

          icon:
            item.name === "Dashboard"
              ? "hi-view-grid"

              : item.name === "Employee"
              ? "bi-people"

              : item.name === "Settings"
              ? "bi-gear"

              : item.name === "Configuration"
              ? "bi-sliders"

              : "bi-grid",

          url:
            item.name === "Dashboard"
              ? "/dashboard"

              : item.name === "Employee"
              ? "/employee/list"

              : "#",

          // Employee is a direct link — no submenu
          children:
            item.name === "Employee"
              ? []
              : (item.child || []).filter((child) =>
                  child.name !== "Employee List"
                ).map((child) => ({

                  id: child.id,

                  label: child.name === "Add User" ? "User" : child.name,

                  url:

                    child.name === "Add User"
                    ? "/users/add"

                    : child.name === "Roles & Permission"
                    ? "/settings/roles"

                    : child.name === "Profile"
                    ? "/settings/profile"

                    : child.name === "Security"
                    ? "/settings/security"

                    : child.name === "General"
                    ? "/settings/general"

                    : child.name === "Holidays"
                    ? "/settings/holidays"

                    : child.name === "Department"
                    ? "/settings/department"

                    : child.name === "Designation"
                    ? "/settings/designation"

                    : child.name === "Business"
                    ? "/configuration/business"

                    : "#",
                })),
        }));

      console.log(
        "Formatted Menus:",
        formattedMenus
      );

      setMenuItems(formattedMenus);

    } catch (error) {

      console.error(
        "Permission parse error:",
        error
      );

      setMenuItems([]);
    }
  };

  fetchMenu();

}, []);

  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };

    loadUser();

    window.addEventListener("userUpdate", loadUser);
    return () => {
      window.removeEventListener("userUpdate", loadUser);
    };
  }, []);

  const toggleMenu = (index) => {
    if (collapsed) return;
    setOpenItem((prev) => (prev === index ? null : index));
  };

  const handleLinkClick = () => {
    if (isMobile) collapseSidebar();
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <aside
      className={`sidebar d-flex flex-column ${collapsed ? "collapsed" : ""} ${
        isMobile && !collapsed ? "mobile-expanded" : ""
      }`}
    >
      <div className="sidebar-menu flex-grow-1 overflow-auto pe-1">
        {menuItems.map((item, index) => {
          const Icon = sidebarIconMap[item.icon];

          // Treat empty children array as no children
          const hasChildren =
            Array.isArray(item.children) && item.children.length > 0;

          const hasActiveChild = hasChildren
            ? item.children.some((c) => c.url === location.pathname)
            : false;

          const isParentActive =
            (!hasChildren && location.pathname === item.url) || hasActiveChild;

          return (
            <div key={item.id} className="sidebar-group mb-1">
              {/* Regular Menu Item (no children OR empty children array) */}
              {!hasChildren && (
                <div className="sidebar-hover-wrapper">
                  <NavLink
                    to={item.url}
                    onClick={handleLinkClick}
                    className={`sidebar-item d-flex align-items-center gap-3 px-4 py-3 ${
                      isParentActive ? "active" : ""
                    }`}
                  >
                    <div className={`sidebar-icon-wrapper ${item.icon}`}>
                      {Icon && <Icon size={18} />}
                    </div>

                    {!collapsed && (
                      <span className="sidebar-text">{item.label}</span>
                    )}
                  </NavLink>

                  {/* Hover popup when collapsed */}
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

              {/* Parent Menu with Children */}
              {hasChildren && (
                <div className="sidebar-hover-wrapper">
                  <div
                    className={`sidebar-item d-flex align-items-center gap-3 px-4 py-3 ${
                      isParentActive ? "active" : ""
                    }`}
                    onClick={() => {
                      if (hasChildren) {
                        toggleMenu(index);
                      } else {
                        handleLinkClick();

                        navigate(item.url);
                      }
                    }}
                  >
                    <div className={`sidebar-icon-wrapper ${item.icon}`}>
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

                  {/* Hover children when collapsed */}
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

              {/* Expanded children */}
              {!collapsed && openItem === index && hasChildren && (
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
      </div>

      {/* FOOTER */}
      <div className="sidebar-footer mt-auto pt-3 border-top">
        <div
          className={`user-profile-card d-flex align-items-center mb-3 rounded ${collapsed ? "justify-content-center p-1" : "p-2"}`}
          style={{ background: "#F8F9FA" }}
        >
          <img
            src={
              user?.profilePhoto
                ? user.profilePhoto.startsWith("http")
                  ? user.profilePhoto
                  : `https://localhost:44306${user.profilePhoto}`
                : profileImg
            }
            alt="User"
            className="rounded-circle"
            style={{ width: "40px", height: "40px", objectFit: "cover" }}
          />
          {!collapsed && (
            <div className="user-info ms-3 overflow-hidden">
              <div
                className="user-name fw-bold"
                style={{ fontSize: "14px", color: "#333" }}
              >
                {user?.fullName || "User"}
              </div>
              <div
                className="user-email text-muted text-truncate"
                style={{ fontSize: "12px" }}
              >
                {user?.email || ""}
              </div>
            </div>
          )}
        </div>
        <button
          className="btn w-100 fw-bold d-flex align-items-center justify-content-center"
          onClick={handleLogout}
          style={{
            background: "#DD3300",
            color: "#fff",
            borderRadius: "6px",
            padding: collapsed ? "8px 0" : "10px",
          }}
        >
          {collapsed ? <FiLogOut size={20} /> : "Logout"}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
