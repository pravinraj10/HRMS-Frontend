import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../Pages/Login/Login";
import Dashboard from "../Pages/Dashboard/Dashboard";
import MainLayout from "../Layout/MainLayout";
import PrivateRoute from "./PrivateRoute";
import Profile from "../Pages/Settings/Profile/Profile";
import Security from "../Pages/Settings/Security/Security";
import AddUser from "../Pages/Users/AddUser/AddUser";
import General from "../Pages/Settings/General/General";
import Roles from "../Pages/Settings/RolesAndPermission/Roles";
import Business from "../Pages/Configurations/Business";
import Holiday from "../Pages/Settings/Holiday/Holiday";
import Department from "../Pages/Settings/Department/Department";
import Designation from "../Pages/Settings/Designation/Designation";
import EmployeeList from "../Pages/Users/EmployeeList/EmployeeList";
import AddEmployee from "../Pages/Users/EmployeeList/AddEmployee";
import EditEmployee from "../Pages/Users/EmployeeList/EditEmployee";
import ViewEmployee from "../Pages/Users/EmployeeList/ViewEmployee";
import EmployeeDocuments from "../Pages/Users/EmployeeList/EmployeeDocuments";
import StatusHistory from "../Pages/Users/Status-History/StatusHistory";
import ViewStatusHistory from "../Pages/Users/Status-History/ViewStatusHistory";

const Routing = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="settings/profile" element={<Profile />} />
          <Route path="settings/security" element={<Security />} />
          <Route path="settings/general" element={<General />} />
          <Route path="settings/roles" element={<Roles />} />
          <Route path="settings/holidays" element={<Holiday />} />
          <Route path="settings/department" element={<Department />} />
          <Route path="settings/designation" element={<Designation />} />
          <Route path="employee/list" element={<EmployeeList />} />
          <Route path="employee/add" element={<AddEmployee />} />
          <Route path="employee/edit/:id" element={<EditEmployee />} />
          <Route path="employee/view/:id" element={<ViewEmployee />} />
          <Route path="employee/documents/:id" element={<EmployeeDocuments />} />
          <Route path="employee/status" element={<StatusHistory />} />
          <Route path="employee/status/view/:id" element={<ViewStatusHistory />} />
          <Route path="users/add" element={<AddUser />} />
          <Route path="configuration/business" element={<Business />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
};

export default Routing;