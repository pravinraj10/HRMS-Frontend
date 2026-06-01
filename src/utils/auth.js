import { jwtDecode } from "jwt-decode";

export const getToken = () => {
  return localStorage.getItem("token");
};

export const getRole = () => {
  return localStorage.getItem("role");
};

export const getPermissions = () => {
  const data = localStorage.getItem("permissions");
  return data ? JSON.parse(data) : [];
};

export const decodeToken = () => {
  const token = getToken();
  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const logout = () => {
  localStorage.clear();
  window.location.href = "/login";
};

export const hasPermission = (permissionName) => {
  const permissions = getPermissions();
  // Assume basic format or handle nested children if needed based on the user's data structure
  // Some apps flatten this, some search recursive. Here we assume top-level or basic nesting.
  const checkPermission = (menus) => {
      return menus.some(menu => {
          if (menu.name === permissionName) return true;
          if (menu.child && menu.child.length > 0) {
              return checkPermission(menu.child);
          }
          // Support for 'children' array which is used in Sidebar.jsx
          if (menu.children && menu.children.length > 0) {
              return checkPermission(menu.children);
          }
          return false;
      });
  };

  return checkPermission(permissions);
};
