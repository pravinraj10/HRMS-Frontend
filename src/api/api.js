import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:44358/api"
});

export default api;