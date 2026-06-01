import api from "../../api/api";

export const getMenuItems = async () => {
    try {
        const response = await api.get("/Menu");
        const data = response.data || [];
        return data;
    } catch (error) {
        console.error("Error fetching menu items:", error);
        return [];
    }
};
