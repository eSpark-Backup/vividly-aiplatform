import { MODES } from "@/constant"
import { create } from "zustand"

export const useChatStore = create()(
    (set) => ({
        mode: MODES.CHAT,
        setMode: (value) => set({ mode: value }),
        userUploadedImage: null,
        setUserUploadedImage: (value) => set({ userUploadedImage: value }),
        selectedImage: null,
        setSelectedImage: (value) => set({ selectedImage: value }),
        conversations: [],
        setConversations: (value) => set({ conversations: value }),
        messages: [],
        setMessages: (value) => set({ messages: value }),
        clearChat: () => set({ conversations: [], messages: [], selectedImage: null, userUploadedImage: null, mode: MODES.CHAT }),
    }),
)


