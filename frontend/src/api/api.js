import axios from "axios";

const API = axios.create({
  baseURL: "https://securefilesharingplatform.onrender.com"
});

export default API;