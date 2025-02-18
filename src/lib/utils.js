import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

// Combine clsx and tailwind-merge
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Get the last message from the messages array
export const getLastMessage = (messages) => {
  if (!messages || messages.length === 0) return "No messages";
  return messages.reduce((latest, message) =>
      new Date(message.created_at) > new Date(latest.created_at) ? message : latest
  ).content;
};

// Categorize chat history based on the date
export const categorizeHistory = (chatHistory) => {
  const today = new Date().toDateString();
  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toDateString();
  const last7Days = new Date(new Date().setDate(new Date().getDate() - 7));

  return {
      today: chatHistory.filter(item =>
          new Date(item.messages[item.messages.length - 1]?.created_at || "").toDateString() === today
      ),
      yesterday: chatHistory.filter(item =>
          new Date(item.messages[item.messages.length - 1]?.created_at || "").toDateString() === yesterday
      ),
      last7Days: chatHistory.filter(item => {
          const lastMsgDate = new Date(item.messages[item.messages.length - 1]?.created_at || "");
          return lastMsgDate >= last7Days && lastMsgDate.toDateString() !== today && lastMsgDate.toDateString() !== yesterday;
      })
  };
};
