import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../Pages/Login/Login";
import Dashboard from "../Pages/Dashboard/Dashboard";
import MainLayout from "../Layout/MainLayout";
import Profile from "../Pages/Settings/Profile/Profile";
import Security from "../Pages/Settings/Security/Security";
import UserList from "../Pages/Users/UserList/UserList";
import AddUser from "../Pages/Users/AddUser/AddUser";

import General from "../Pages/Settings/General/General";
import Roles from "../Pages/Settings/RolesAndPermission/Roles";
import Business from "../Pages/Configurations/Business";
import Holiday from "../Pages/Settings/Holiday/Holiday";
import Department from "../Pages/Settings/Department/Department";
import Designation from "../Pages/Settings/Designation/Designation";
const Routing = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="settings/profile" element={<Profile />} />
          <Route path="settings/security" element={<Security />} />
          <Route path="users/list" element={<UserList />} />
          <Route path="users/add" element={<AddUser />} />

          {/* settings */}
          <Route path="settings/general" element={<General />} />
          <Route path="settings/roles" element={<Roles />}/>
          <Route path="settings/holidays" element={<Holiday />} />
          <Route path="settings/department" element={<Department />} />
          <Route path="settings/designation" element={<Designation />} />

          <Route path="/configuration/business" element={<Business/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Routing;
