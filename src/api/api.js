import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:44306/api"
});

export default api;