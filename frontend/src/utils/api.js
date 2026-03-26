const envApiUrl = process.env.REACT_APP_API_URL?.trim();
const browserOrigin =
  typeof window !== "undefined" ? window.location.origin : "";

const isLocalhostUrl = value =>
  /^https?:\/\/(localhost|127(?:\.\d{1,3}){3})(:\d+)?$/i.test(value);

const shouldIgnoreEnvApiUrl =
  envApiUrl &&
  browserOrigin &&
  !isLocalhostUrl(browserOrigin) &&
  isLocalhostUrl(envApiUrl);

const API_URL =
  envApiUrl && !shouldIgnoreEnvApiUrl
    ? envApiUrl.replace(/\/+$/, "")
    : "";

export default API_URL;
