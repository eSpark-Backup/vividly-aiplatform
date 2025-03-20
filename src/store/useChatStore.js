import { MODES } from "@/constant"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useChatStore = create()(
    persist((set) => ({
        socketURL: null,
        setSocketURL: (value) => set({ socketURL: value }),
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
        selectedVoice: null,
        setSelectedVoice: (value) => set(() => ({ selectedVoice: value })),
        clearChat: () => set({socketURL:null, conversations: [], messages: [], selectedImage: null, userUploadedImage: null, mode: MODES.CHAT }),
    }),
        {
            name: "chat-store",
            partialize: (state) => ({ selectedVoice: state.selectedVoice }),
        }
    )
)


