import { useState, useEffect, useCallback } from "react";
import api from "../api/api";

const API_ENDPOINT = "/Employee";

export const useCrudEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(API_ENDPOINT);
      await new Promise(resolve => setTimeout(resolve, 800));
      const mappedData = response.data.map(emp => ({
        id: emp.id,
        employeeId: emp.employeeCode || "",
        name: emp.fullName || "",
        email: emp.personalEmail || "",
        phone: emp.personalPhone || "",
        status: emp.isActive ? "Active" : "Inactive",
        department: emp.departmentName || "N/A",
        designation: emp.designationName || "N/A",
        profilePhoto: emp.profilePhoto || ""
      }));
      setEmployees(mappedData);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const create = useCallback(async (payload) => {
    try {
      await api.post(API_ENDPOINT, payload);
      await fetchEmployees();
      return { success: true };
    } catch (err) {
      console.error("Create error:", err);
      return { success: false };
    }
  }, [fetchEmployees]);

  const update = useCallback(async (id, payload) => {
    try {

      await api.put(`${API_ENDPOINT}/${id}`, payload);
      await fetchEmployees();
      return { success: true };
    } catch (err) {
      console.error("Update error:", err);
      return { success: false };
    }
  }, [fetchEmployees]);

  const remove = useCallback(async (id) => {
    try {
      await api.delete(`${API_ENDPOINT}/${id}`);
      await fetchEmployees();
      return { success: true };
    } catch (err) {
      console.error("Remove error:", err);
      return { success: false };
    }
  }, [fetchEmployees]);

  const searchEmployees = useCallback(async (query) => {
    setSearchLoading(true);
    try {
      const response = await api.get(`${API_ENDPOINT}/search?search=${query}`);
      const mappedData = response.data.map(emp => ({
        id: emp.id,
        employeeId: emp.employeeCode || "",
        name: emp.fullName || "",
        email: emp.personalEmail || "",
        phone: emp.personalPhone || "",
        status: emp.isActive ? "Active" : "Inactive",
        department: emp.departmentName || "N/A",
        designation: emp.designationName || "N/A",
        profilePhoto: emp.profilePhoto || ""
      }));
      setEmployees(mappedData);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const getById = useCallback((id) => {
    return employees.find((emp) => String(emp.id) === String(id));
  }, [employees]);

  return {
    employees,
    loading,
    searchLoading,
    create,
    update,
    remove,
    getById,
    search: searchEmployees,
  };
};
