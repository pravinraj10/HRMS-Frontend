import { useState, useEffect, useCallback } from "react";
import api from "../api/api";

export const useCrud = () => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);

  // States for what's actually shown in the table
  const [displayedCountries, setDisplayedCountries] = useState([]);
  const [displayedStates, setDisplayedStates] = useState([]);
  const [displayedCities, setDisplayedCities] = useState([]);
  const [displayedDepartments, setDisplayedDepartments] = useState([]);
  const [displayedRoles, setDisplayedRoles] = useState([]);

  const [loading, setLoading] = useState(false);

  const mapCountry = (item) => ({
    id: item.id,
    code: item.countryCode,
    name: item.countryName,
    status: item.isActive ? "Active" : "Inactive",
  });

  const mapState = (item) => ({
    id: item.id,
    name: item.stateName,
    countryId: item.countryId,
    code: item.stateCode,
    status: item.isActive ? "Active" : "Inactive",
  });

  const mapCity = (item) => ({
    id: item.id,
    name: item.cityName,
    stateId: item.stateId,
    countryId: item.countryId,
    status: item.isActive ? "Active" : "Inactive",
  });

  const mapDepartment = (item) => ({
    id: item.id,
    departmentName: item.departmentName,
    description: item.description,
    isActive: item.isActive,
    status: item.isActive ? "Active" : "Inactive",
  });

  const mapRole = (item) => ({
    id: item.id,
    name: item.roleName,
    department: item.departmentName || "",
    departmentId: item.departmentId || null,
    type: item.roleType || "",
    description: item.description || "",
    users: item.assignedUsers ?? 0,
    status: item.isActive ? "Active" : "InActive",
  });

  const getArray = (res) => {
    if (Array.isArray(res)) return res;
    if (res?.$values) return res.$values;
    if (res?.data) return res.data;
    return [];
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, sRes, ciRes, dRes, rRes] = await Promise.all([
        api.get("/Country"),
        api.get("/State"),
        api.get("/City"),
        api.get("/Department"),
        api.get("/Role"),
      ]);

      const countryData = getArray(cRes.data).map(mapCountry);
      const stateData = getArray(sRes.data).map(mapState);
      const cityData = getArray(ciRes.data).map(mapCity);
      const departmentData = getArray(dRes.data).map(mapDepartment);
      const roleData = getArray(rRes.data).map(mapRole);

      setCountries(countryData);
      setDisplayedCountries(countryData);
      setStates(stateData);
      setDisplayedStates(stateData);
      setCities(cityData);
      setDisplayedCities(cityData);
      setDepartments(departmentData);
      setDisplayedDepartments(departmentData);
      setRoles(roleData);
      setDisplayedRoles(roleData);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const create = async (endpoint, data) => {
    try {
      if (endpoint === "Country") {
        await api.post("/Country", {
          countryCode: data.code,
          countryName: data.name,
          createdBy: data.createdBy || "Admin",
        });
      }

      if (endpoint === "State") {
        await api.post("/State", {
          stateName: data.name,
          stateCode: data.code || "NA",
          countryId: data.countryId,
          createdBy: data.createdBy || "Admin",
        });
      }

      if (endpoint === "City") {
        await api.post("/City", {
          cityName: data.name,
          stateId: data.stateId,
          countryId: data.countryId,
          createdBy: data.createdBy || "Admin",
        });
      }

      if (endpoint === "roles") {
        await api.post("/Role", {
          roleName: data.name,
          departmentId: data.departmentId || null,
          roleType: data.type || "",
          description: data.description || "",
          isActive: true,
          createdBy: "Admin",
        });
      }

      await fetchAll();
    } catch (err) {
      console.error("Create error:", err);
      throw err;
    }
  };

  const update = async (endpoint, id, data) => {
    try {
      if (endpoint === "Country") {
        await api.put("/Country", {
          id: id,
          countryCode: data.code,
          countryName: data.name,
          updatedBy: data.updatedBy || "Admin",
        });
      }

      if (endpoint === "State") {
        await api.put("/State", {
          id: id,
          stateName: data.name,
          stateCode: data.code || "NA",
          countryId: data.countryId,
          updatedBy: data.updatedBy || "Admin",
        });
      }

      if (endpoint === "City") {
        await api.put("/City", {
          id: id,
          cityName: data.name,
          stateId: data.stateId,
          countryId: data.countryId,
          updatedBy: data.updatedBy || "Admin",
        });
      }

      if (endpoint === "roles") {
        await api.put("/Role", {
          id: id,
          roleName: data.name,
          departmentId: data.departmentId || null,
          roleType: data.type || "",
          description: data.description || "",
          isActive: data.status === "Active",
          updatedBy: "Admin",
        });
      }

      await fetchAll();
    } catch (err) {
      console.error("Update error:", err);
      throw err;
    }
  };

  const remove = async (endpoint, item) => {
    try {
      if (endpoint === "Country") {
        await api.delete(`/Country/${item.id}`);
      }
      if (endpoint === "State") {
        await api.delete(`/State/${item.id}`);
      }
      if (endpoint === "City") {
        await api.delete(`/City/${item.id}`);
      }
      if (endpoint === "roles") {
        await api.delete(`/Role/${item.id}`);
      }
      await fetchAll();
      return { success: true };
    } catch (err) {
      console.error("Delete error:", err);
      throw err;
    }
  };

  const toggleStatus = async (endpoint, id, isActive) => {
    try {
      await api.put(`/${endpoint}/set-active/${id}?isActive=${isActive}`);
      await fetchAll();
      return { success: true };
    } catch (err) {
      console.error("Status update error:", err);
      return { success: false };
    }
  };

  return {
    countries,
    states,
    cities,
    departments,
    roles,
    displayedCountries,
    displayedStates,
    displayedCities,
    displayedDepartments,
    displayedRoles,
    loading,
    create,
    update,
    remove,
    toggleStatus,
    searchRole: async (term) => {
      if (!term) {
        setDisplayedRoles(roles);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/Role/search?searchTerm=${term}`);
        setDisplayedRoles(getArray(res.data).map(mapRole));
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    },
    searchDepartment: async (term) => {
      if (!term) {
        setDisplayedDepartments(departments);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/Department/search?searchTerm=${term}`);
        setDisplayedDepartments(getArray(res.data).map(mapDepartment));
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    },
    searchCountry: async (term) => {
      if (!term) {
        setDisplayedCountries(countries);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/Country/search?searchTerm=${term}`);
        setDisplayedCountries(getArray(res.data).map(mapCountry));
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    },
    searchState: async (term) => {
      if (!term) {
        setDisplayedStates(states);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/State/search?searchTerm=${term}`);
        setDisplayedStates(getArray(res.data).map(mapState));
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    },
    searchCity: async (term) => {
      if (!term) {
        setDisplayedCities(cities);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/City/search?searchTerm=${term}`);
        setDisplayedCities(getArray(res.data).map(mapCity));
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }
  };
};