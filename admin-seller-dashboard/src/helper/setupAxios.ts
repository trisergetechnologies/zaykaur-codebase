import axios from "axios";
import { getToken } from "@/helper/tokenHelper";

export function setupAxiosInterceptors(logout: () => void) {
  axios.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Only 401 means session is invalid. 403 is "forbidden for this resource" — still logged in.
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        logout();
      }
      return Promise.reject(error);
    }
  );
}
