export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const themes = ['dark', 'light']
export const MAX_FREE_COUNTS = 5
export const MESSAGES_PER_PAGE = 10
export const SILENCE_DURATION = 2000
export const MODES = {
  CHAT: "chat",
  CHAT_WITH_IMAGE: "chat_with_image",
  CHAT_WITH_IMAGE_ANALYSIS: "image_analysis",
}
export const PAYMENT_RECURRING_PERIOD = {
   DAILY: "DAILY",
   MONTHLY: "MONTHLY",
   ANNUALY: "ANNUALY"
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