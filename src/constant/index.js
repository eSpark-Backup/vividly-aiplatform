export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const themes = ['dark', 'light']
export const MAX_FREE_COUNTS = 5
export const MESSAGES_PER_PAGE = 10
export const MODES = {
  CHAT: "chat",
  CHAT_WITH_IMAGE: "chat_with_image",
  CHAT_WITH_IMAGE_ANALYSIS: "image_analysis",
}




//CSS 
export const tabsCSS = `py-8 relative h-7 px-4 flex gap-2 text-sm font-medium transition-all
dark:hover:text-white hover:text-[#9181F4] dark:text-zinc-400 text-black 
data-[state=active]:text-[#9181F4] dark:data-[state=active]:text-white
data-[state=active]:after:absolute 
data-[state=active]:after:left-0 
data-[state=active]:after:bottom-0 
data-[state=active]:after:h-[4.31px] 
data-[state=active]:after:w-full 
data-[state=active]:after:bg-[#9181F4]
data-[state=active]:after:rounded-t-[6.31px]
data-[state=active]:after:shadow-[0px_6.31px_9.47px_-6.31px_#B6F09C29,0px_15.78px_23.67px_-4.73px_#B6F09C29]`



//Chat History Dummy data 
export const chatHistoryDummyData = [
  {
    id: "b3a1e18f-7b56-4b8e-b015-09f699f77b58", // UUID
    messages: [
      {
        id: "1abf3e68-67fa-4a3a-8f49-4db9c31508f3", // UUID
        content: "Inquiry for XYZ naming in the mark",
        created_at: new Date().toISOString(), // Today
        role: "sender", // Role field added
      },
    ],
  },
  {
    id: "c034df7a-cd0e-4313-8995-b2155d24a8e5", // UUID
    messages: [
      {
        id: "b8f1a173-45da-4bfa-bb60-941f517885d4", // UUID
        content: "Inquiry for XYZ naming in the mark",
        created_at: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), // Yesterday
        role: "receiver", // Role field added
      },
    ],
  },
  {
    id: "7a5278b9-c634-44cd-96cd-d1e1cf345a2d", // UUID
    messages: [
      {
        id: "44e13b3c-f5a7-4d56-b1de-b9c99cbd060d", // UUID
        content: "Inquiry for XYZ naming in the mark",
        created_at: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), // 2 days ago
        role: "sender", // Role field added
      },
    ],
  },
  {
    id: "a2796d71-70c3-473b-b273-b908574f6005", // UUID
    messages: [
      {
        id: "8f5d51a0-d3f4-47ac-b490-d7cc3dbe42fd", // UUID
        content: "Inquiry for XYZ naming in the mark",
        created_at: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), // 3 days ago
        role: "receiver", // Role field added
      },
    ],
  },
  {
    id: "b04d8a63-6f16-41c4-82e7-b81d42b5a41b", // UUID
    messages: [
      {
        id: "28efb75d-b018-41d8-a74b-b3d911b357b2", // UUID
        content: "Inquiry for XYZ naming in the mark",
        created_at: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(), // 4 days ago
        role: "sender", // Role field added
      },
    ],
  },
];