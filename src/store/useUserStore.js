import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useUserStore = create()(
    persist(
        (set) => ({
            email: null,
            firstName: null,
            lastName: null,
            phone: null,
            address: null,
            city: null,
            birthdate: null,
            avatar: null,
            setUser: (user) => set({ ...user }),
            clearUser: () => set({ email: "", firstName: "", lastName: "", phone: "", address: "", city: "", birthdate: "", avatar: "" }),
        }),
        {
            name: "user-storage",
        },
    ),
)

