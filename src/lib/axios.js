import { useAuthStore } from "@/store/useAuthStore";
import axios from "axios";

const client = axios.create({ baseURL: import.meta.env.VITE_BASE_URL });


client.interceptors.request.use(async (config) => {
  const { accessToken, refreshToken, expiresAt } = useAuthStore.getState()

  if (accessToken && expiresAt) {
    const isExpired = true
    if (isExpired && refreshToken) {
      try {
        const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/refresh-token`, { refreshToken })
        const { accessToken: newAccessToken, expiresAt: newExpiresAt } = response.data
        useAuthStore.getState().setAuth({ accessToken: newAccessToken, expiresAt: newExpiresAt })
        config.headers.Authorization = `Bearer ${newAccessToken}`
      } catch (error) {
        useAuthStore.getState().clearAuth()
        throw error
      }
    } else {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
  }
  return config
})


export const request = ({ ...options }) => {
  return client(options)
    .then((response) => response)
    .catch((error) => {
      console.error("API request error:", error)
      throw error
    })
}

// export const request = ({ ...options }) => {
//   const token = localStorage.getItem("token");
//   client.defaults.headers.common.Authorization = `Bearer ${token}`;

//   return client(options)
//     .then((response) => {
//       return response; // Extract data from the response
//     })
//     .catch((error) => {
//       // Optional: Log the error for debugging
//       console.error("API request error:", error)

//       throw error; // Rethrow the error to trigger the React Query onError callback
//     });
// };
