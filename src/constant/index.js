export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const themes = ['dark', 'light']
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
   ANNUALLY: "ANNUALLY"
}
export const PLANS_IDS = {
  FREE: "FREE",
  PLUS_MONTHLY: import.meta.env.VITE_VIVIDLY_PLUS_PLAN_MONTHLY_ID,
  PREMIUM_MONTHLY: import.meta.env.VITE_VIVIDLY_PREMIUM_PLAN_MONTHLY_ID,
  STUDENT_MONTHLY: import.meta.env.VITE_VIVIDLY_STUDENT_PLAN_MONTHLY_ID,
  PLUS_ANNUALLY: import.meta.env.VITE_VIVIDLY_PLUS_PLAN_ANNUALLY_ID,
  PREMIUM_ANNUALLY: import.meta.env.VITE_VIVIDLY_PREMIUM_PLAN_ANNUALLY_ID,
  STUDENT_ANNUALLY: import.meta.env.VITE_VIVIDLY_STUDENT_PLAN_ANNUALLY_ID,
}

export const PLAN_FEATURE_ENUMS = {
  PICTURE_GENERATION: "PICTURE_GENERATION",
  PICTURE_ANALYSIS: "PICTURE_ANALYSIS",
  HUMANIZE: "HUMANIZE",
  VOICE_ASSISTANCE: "VOICE_ASSISTANCE",
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


//SQAURE PAYMENT BUTTON CSS 
export const paymentButtonCSS = (isDarkTheme) => ({
  css: {
      background: "linear-gradient(99.78deg, #9181F4 -5.85%, #5038ED 109.55%)",
      boxShadow: "0px 8px 21px 0px rgba(0,0,0,0.16)",
      fontSize: "14px",
      borderRadius: "10px",
      color: "#fff",
      "&:hover": {
          background: "linear-gradient(99.78deg, #8070e8 -5.85%, #4029d8 109.55%)",
      },
      "&:disabled": {
          background: isDarkTheme
              ? "linear-gradient(99.78deg, #5d52a3 -5.85%, #372a8a 109.55%)"
              : "linear-gradient(99.78deg, #c5bdff -5.85%, #9f8ff8 109.55%)",
          opacity: "0.7",
          color: isDarkTheme ? "#e0e0e0" : "#ffffff",
          boxShadow: "none",
      },
  },
})