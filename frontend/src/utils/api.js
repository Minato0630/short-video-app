const API_URL =
  process.env.REACT_APP_API_URL ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:5000");

export default API_URL;
