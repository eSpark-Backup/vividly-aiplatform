import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useAuthStore = create()(
    persist(
      (set) => ({
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        user: {
            id: null,
            first_name: null,
            last_name: null,
            email: null,
        },
        setAuth: (auth) => set((state) => ({ ...state, ...auth })),
        clearAuth: () => set({ accessToken: null, refreshToken: null, expiresAt: null, user: null }),
      }),
      {
        name: "auth-storage",
      },
    ),
  )
  
  