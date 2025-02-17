import { create } from "zustand"

export const useDialogStore = create()(
    (set) => ({
        showSignOutDialog: false,
        setShowSignOutDialog: (value) => set({ showSignOutDialog: value }),
    }),
)


