import axios from "axios";

// Base instance configured for the Express backend
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`,
  headers: {
    "Content-Type": "application/json"
  }
});

export default instance;
