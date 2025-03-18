import { useAuthStore } from "@/store/useAuthStore";
import axios from "axios";

const client = axios.create({ baseURL: import.meta.env.VITE_BASE_URL });


let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else {
      promise.resolve(token)
    }
  })

  failedQueue = []
}

client.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState()

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

// Response interceptor - handles 401 errors
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${token}`,
            }
            return client(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const { refreshToken } = useAuthStore.getState()

      if (!refreshToken) {
        useAuthStore.getState().clearAuth()
        isRefreshing = false
        return Promise.reject(error)
      }

      try {
        const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/refresh-token`, { refreshToken })
        const { accessToken: newAccessToken, expiresAt: newExpiresAt, refreshToken: newRefreshToken } = response.data

        useAuthStore.getState().setAuth({
          accessToken: newAccessToken,
          expiresAt: newExpiresAt,
          refreshToken: newRefreshToken,
        })

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newAccessToken}`,
        }
        processQueue(null, newAccessToken)

        return client(originalRequest)
      } catch (refreshError) {

        useAuthStore.getState().clearAuth()
        processQueue(refreshError, null)
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export const request = ({ ...options }) => {
  return client(options)
    .then((response) => response)
    .catch((error) => {
      console.error("API request error:", error)
      throw error
    })
}


// FOR REQUEST INTERCEPTOR

// client.interceptors.request.use(async (config) => {
//   const { accessToken, refreshToken, expiresAt } = useAuthStore.getState()

//   if (accessToken && expiresAt) {
 
//     const expiresAtTime = new Date(expiresAt).getTime()
//     const currentTime = new Date().getTime()
//     const isExpired = expiresAtTime <= currentTime
    

//     if (isExpired && refreshToken) {
//       try {
//         const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/refresh-token`, { refreshToken })
//         const { accessToken: newAccessToken, expiresAt: newExpiresAt } = response.data
//         useAuthStore.getState().setAuth({ accessToken: newAccessToken, expiresAt: newExpiresAt })
//         config.headers.Authorization = `Bearer ${newAccessToken}`
//       } catch (error) {
//         useAuthStore.getState().clearAuth()
//         throw error
//       }
//     } else {
//       config.headers.Authorization = `Bearer ${accessToken}`
//     }
//   }

//   return config
// })


// export const request = ({ ...options }) => {
//   return client(options)
//     .then((response) => response)
//     .catch((error) => {
//       console.error("API request error:", error)
//       throw error
//     })
// }

