import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // NOT LOGGED IN
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ROLE NOT ALLOWED
  if (
    allowedRoles &&
    (!role || !allowedRoles.map((r) => r.toLowerCase()).includes(role.toLowerCase()))
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Support both Outlet (nested routes) and children (wrapping routes)
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
