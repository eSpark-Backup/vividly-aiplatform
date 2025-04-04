import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useStudentStore = create()(
    persist((set) => ({
        isStudent: false,
        setIsStudent: (value) => set({ isStudent: value }),
        clearStudent: () => set({ isStudent: false }),
    }),
        {
            name: "student-storage",
        }
    )
)


