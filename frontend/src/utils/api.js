const envApiUrl = process.env.REACT_APP_API_URL?.trim();

const isLocalhost = (hostname) => {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    hostname.startsWith("172.") ||
    hostname.endsWith(".local")
  );
};

const getDevApiUrl = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (isLocalhost(hostname)) {
      return `http://${hostname}:5000`;
    }
  }
  return "";
};

const API_URL = envApiUrl 
  ? envApiUrl.replace(/\/+$/, "") 
  : getDevApiUrl();

export default API_URL;
