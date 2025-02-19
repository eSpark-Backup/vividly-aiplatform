import { create } from "zustand"

export const useChatStore = create()(
    (set) => ({
        conversations: [],
        setConversations: (value) => set({ conversations: value }),
    }),
)


