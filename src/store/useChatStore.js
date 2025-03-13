import { MODES } from "@/constant"
import { create } from "zustand"

export const useChatStore = create()(
    (set) => ({
        mode: MODES.CHAT,
        setMode: (value) => set({ mode: value }),
        conversations: [],
        setConversations: (value) => set({ conversations: value }),
        messages: [],
        setMessages: (value) => set({ messages: value }),
    }),
)


