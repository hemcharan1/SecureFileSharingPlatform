import axios from "axios";

const API = axios.create({
  baseURL: "https://secure-file-sharing-api.onrender.com"
});

export default API;