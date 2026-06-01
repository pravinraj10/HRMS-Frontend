import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../Pages/Login/Login";
import Dashboard from "../Pages/Dashboard/Dashboard";
import MainLayout from "../Layout/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import Unauthorized from "../Pages/Unauthorized/Unauthorized";
import Profile from "../Pages/Settings/Profile/Profile";
import Security from "../Pages/Settings/Security/Security";
import General from "../Pages/Settings/General/General";
import Holiday from "../Pages/Settings/Holiday/Holiday";
import Department from "../Pages/Settings/Department/Department";
import Designation from "../Pages/Settings/Designation/Designation";

import Roles from "../Pages/Settings/RolesAndPermission/Roles";
import AddRole from "../Pages/Settings/RolesAndPermission/AddRole";

import Business from "../Pages/Configurations/Business";

import AddUser from "../Pages/Users/AddUser/AddUser";

import EmployeeList from "../Pages/Users/EmployeeList/EmployeeList";
import AddEmployee from "../Pages/Users/EmployeeList/AddEmployee";
import EditEmployee from "../Pages/Users/EmployeeList/EditEmployee";
import ViewEmployee from "../Pages/Users/EmployeeList/ViewEmployee";
import EmployeeDocuments from "../Pages/Users/EmployeeList/EmployeeDocuments";



const Routing = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* DEFAULT ROUTE */}
        <Route
          path="/"
          element={
            localStorage.getItem("token") ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* PROTECTED */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* COMMON */}
          <Route path="dashboard" element={<Dashboard />} />

          <Route path="settings/profile" element={<Profile />} />
          <Route path="settings/security" element={<Security />} />
          <Route path="settings/general" element={<General />} />
          <Route path="settings/holidays" element={<Holiday />} />
          <Route path="settings/department" element={<Department />} />
          <Route path="settings/designation" element={<Designation />} />

          <Route path="configuration/business" element={<Business />} />

          {/* ADMIN & HR */}
          <Route element={<ProtectedRoute allowedRoles={["Admin", "HR"]} />}>
            <Route path="employee/list" element={<EmployeeList />} />
            <Route path="employee/add" element={<AddEmployee />} />
            <Route path="employee/edit/:id" element={<EditEmployee />} />
            <Route path="employee/view/:id" element={<ViewEmployee />} />
            <Route
              path="employee/documents/:id"
              element={<EmployeeDocuments />}
            />


            <Route path="users/add" element={<AddUser />} />
          </Route>

          {/* ADMIN ONLY */}
          <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
            <Route path="settings/roles" element={<Roles />} />
            <Route path="settings/roles/add" element={<AddRole />} />
            <Route path="settings/roles/edit/:id" element={<AddRole />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Routing;
