import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useUserStore = create()(
    persist(
        (set) => ({
            email: "",
            firstName: "",
            lastName: "",
            phone: "",
            address: "",
            city: "",
            birthdate: "",
            avatar: "",
            isStudent: false,
            studentID: "",
            setUser: (user) => set({ ...user }),
            clearUser: () => set({ email: "", firstName: "", lastName: "", phone: "", address: "", city: "", birthdate: "", avatar: "", isStudent: false, studentID: "" }),
        }),
        {
            name: "user-storage",
        },
    ),
)

