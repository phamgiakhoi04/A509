import axios from "axios";

const configuredApiUrl =
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;

// API methods use the canonical `/api/...` paths. Accept both the old
// VITE_API_URL (host) and VITE_API_BASE_URL (host + /api) env names without
// ever producing a duplicated `/api/api` URL.
const apiBaseUrl = configuredApiUrl
  ? configuredApiUrl.replace(/\/+$/, "").replace(/\/api$/, "")
  : "http://localhost:8080";

const axiosClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
});

axiosClient.interceptors.request.use(
  (config) => {
    const base = import.meta.env.BASE_URL || "/";
    const pathname = window.location.pathname || "";
    const prefix = base.replace(/\/$/, "");
    const path =
      prefix && pathname.startsWith(prefix + "/")
        ? pathname.slice(prefix.length)
        : pathname;
    config.headers["X-A509-Language"] =
      !path.startsWith("/admin") &&
      localStorage.getItem("A509_LANGUAGE") === "en"
        ? "en"
        : "vi";
    const token = localStorage.getItem("ACCESS_TOKEN");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let pendingSessionCheck: { token: string; promise: Promise<boolean> } | null =
  null;

function isSessionInvalid(token: string): Promise<boolean> {
  if (pendingSessionCheck?.token === token) return pendingSessionCheck.promise;
  // Bypass this client's interceptor to avoid recursion if the profile API returns 401.
  const promise = axios
    .get(`${apiBaseUrl}/api/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 15000,
    })
    .then(() => false)
    .catch((error) => error.response?.status === 401)
    .finally(() => {
      if (pendingSessionCheck?.token === token) pendingSessionCheck = null;
    });
  pendingSessionCheck = { token, promise };
  return promise;
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const requestToken = error.config?.headers?.Authorization;
    const currentToken = localStorage.getItem("ACCESS_TOKEN");
    // An old in-flight request must not clear a newly logged-in session.
    // Failed login requests and anonymous 401s do not expire a session.
    if (
      error.response?.status === 401 &&
      currentToken &&
      requestToken === `Bearer ${currentToken}` &&
      !error.config?.url?.startsWith("/api/auth/")
    ) {
      const invalid =
        error.config?.url?.split("?")[0] === "/api/users/profile" ||
        (await isSessionInvalid(currentToken));
      if (invalid && localStorage.getItem("ACCESS_TOKEN") === currentToken) {
        localStorage.removeItem("ACCESS_TOKEN");
        localStorage.removeItem("USER_INFO");
        window.dispatchEvent(new Event("a509:session-expired"));
      }
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
